const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');
const busRoutesData = require('./data/routes.js');

const app = express();
const PORT = process.env.PORT || 3000;
// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Smart Bus Tracker Backend API',
    health: '/health',
    buses: '/api/buses',
    locations: '/api/locations',
    routes: '/api/routes'
  });
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// List all bus locations
app.get('/api/locations', (req, res) => {
  const locations = Array.from(busLocations.values());
  res.json(locations);
});

// In-memory storage for bus locations
const busLocations = new Map();
const busRoutes = new Map(); // This will store route variants for each bus


// Helper function to get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Helper function to calculate distance between two coordinates
const EARTH_RADIUS_KM = 6371;
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = EARTH_RADIUS_KM;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Initialize bus routes and locations using the full busId (e.g., 'BUS_001')
busRoutesData.forEach(route => {
  const fullBusId = route.busId;
  if (!busRoutes.has(fullBusId)) {
    const routeVariants = {};
    busRoutes.set(fullBusId, routeVariants);
    const initialRoute = routeVariants.morning || routeVariants.evening || route;

    busLocations.set(fullBusId, {
      busId: fullBusId,
      lat: initialRoute.stops[0].lat,
      lon: initialRoute.stops[0].lon,
      speed: 0,
      updated: new Date().toISOString(),
      status: 'Offline',
      currentStopIndex: 0,
      routeType: route.busId.includes('_EVE') ? 'evening' : 'morning'
    });
  }

  const routeType = route.busId.includes('_EVE') ? 'evening' : 'morning';
  busRoutes.get(fullBusId)[routeType] = route;
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Bus Tracker Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Helper function to get detailed bus information
function getBusDetails(busId, routeType) {
  const location = busLocations.get(busId);
  const routeVariants = busRoutes.get(busId);

  if (!location || !routeVariants) {
    return null;
  }

  // If routeType is not provided, use the one stored with the bus location.
  // The stored routeType is the most reliable source of truth.
  if (!routeType) {
    routeType = location.routeType;
  } else if (routeType !== location.routeType) {
    location.routeType = routeType; // Allow override but update state
  }

  let route = routeVariants[routeType];
  if (!route) {
    // Fallback to the other route if the selected one doesn't exist
    const fallbackRouteType = routeType === 'morning' ? 'evening' : 'morning';
    route = routeVariants[fallbackRouteType];
    if (!route) {
      return null;
    }
    routeType = fallbackRouteType;
  }

  const currentStop = route.stops[location.currentStopIndex];
  const nextStop = route.stops[location.currentStopIndex + 1];

  let eta = 'N/A';
  if (location.status === 'At Stop' || location.speed === 0) {
    eta = 'Stopped';
  } else if (nextStop && location.speed > 0) {
    const distance = calculateDistance(
      location.lat, location.lon,
      nextStop.lat, nextStop.lon
    );
    // ETA in minutes, with a floor of 1 minute if moving.
    eta = Math.max(1, Math.ceil((distance / location.speed) * 60));
  }

  return {
    ...location,
    driver: route.driver,
    route: route.route,
    currentStop: currentStop?.name,
    nextStop: nextStop?.name,
    eta: eta,
    totalStops: route.stops.length,
    stops: route.stops,
    routeType: routeType
  };
}

// Get all buses
app.get('/api/buses', (req, res) => {
  const buses = [];
  for (const busId of busLocations.keys()) {
    const busDetails = getBusDetails(busId);
    if (busDetails) {
      // Omit stops from the main list to keep the payload smaller
      const { stops, ...busSummary } = busDetails;
      buses.push(busSummary);
    }
  }
  res.json(buses);
});

// Get specific bus location
app.get('/api/locations/:busId', (req, res) => {
  const { busId } = req.params;
  const busDetails = getBusDetails(busId.toUpperCase()); // routeType is now determined automatically
  
  if (!busDetails) {
    return res.status(404).json({ error: 'Bus not found' });
  }
  
  res.json(busDetails);
});


// Update bus location (from GPS hardware) - accepts both /api/locations/:busId and /api/locations with device_id
app.post('/api/locations/:busId', handleLocationUpdate);
app.post('/api/locations', (req, res) => {
  const { device_id, lat, lon, speed, time } = req.body;
  if (!device_id) {
    return res.status(400).json({ error: 'Missing required field: device_id' });
  }
  req.params = req.params || {};
  req.params.busId = device_id;
  handleLocationUpdate(req, res);
});

function handleLocationUpdate(req, res) {
  const { busId: busIdFromParams } = req.params;
  const { lat, lon, speed, time } = req.body;

  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Missing required fields: lat, lon' });
  }

  const busId = busIdFromParams.toUpperCase();
  const routeVariants = busRoutes.get(busId);
  if (!routeVariants) {
    return res.status(404).json({ error: 'Bus not found' });
  }

  // --- Smart Route Determination ---
  // Determine the route based on proximity to the start/end points of the morning/evening routes.
  const morningRoute = routeVariants.morning;
  const eveningRoute = routeVariants.evening;

  let routeType = 'morning'; // Default
  if (morningRoute && eveningRoute) {
    const distToMorningStart = calculateDistance(lat, lon, morningRoute.stops[0].lat, morningRoute.stops[0].lon);
    const distToEveningStart = calculateDistance(lat, lon, eveningRoute.stops[0].lat, eveningRoute.stops[0].lon);
    // If the bus is closer to the start of the evening route, it's on the evening trip. Otherwise, morning.
    routeType = distToEveningStart < distToMorningStart ? 'evening' : 'morning';
  } else if (eveningRoute) {
    routeType = 'evening';
  }

  let route = routeVariants[routeType];
  // --- End of Smart Route Determination ---

  if (!route) {
    // Fallback if one of the routes is missing for some reason
    route = routeVariants.morning || routeVariants.evening;
  }
  // --- End of Smart Route Determination ---

  let currentStopIndex = 0;
  let status = speed > 0 ? 'Moving' : 'Stopped';

  // Find current stop based on proximity
  let minDistance = Infinity;
  route.stops.forEach((stop, index) => {
    const distance = calculateDistance(lat, lon, stop.lat, stop.lon);
    if (distance < minDistance) {
      minDistance = distance;
      currentStopIndex = index;
    }
  });

  // If very close to a stop (within 100m), mark as at stop
  if (minDistance < 0.1) {
    status = 'At Stop';
  }

  // Use the time from the hardware, or fallback to server time
  let updatedTimestamp;
  if (time) {
    // The hardware sends time as "HH:MM:SS". We combine it with the current date.
    // Use IST for creating the date to avoid timezone mismatches around midnight.
    const nowInIST = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const year = nowInIST.getFullYear();
    const month = String(nowInIST.getMonth() + 1).padStart(2, '0');
    const day = String(nowInIST.getDate()).padStart(2, '0');
    updatedTimestamp = new Date(`${year}-${month}-${day}T${time}Z`).toISOString();
  } else {
    updatedTimestamp = new Date().toISOString();
  }

  const locationData = {
    busId,
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    speed: speed ? parseFloat(speed) : 0,
    updated: updatedTimestamp,
    status,
    currentStopIndex,
    routeType
  };

  busLocations.set(busId, locationData);

  console.log(`📍 Updated location for ${busId}: ${lat}, ${lon} (Speed: ${speed} km/h) on ${routeType} route at ${time}`);

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: locationData
  });
}

// Get bus route information
app.get('/api/routes/:busId', (req, res) => {
  const { busId } = req.params;
  const { routeType = 'morning' } = req.query; // Default to morning
  const routeVariants = busRoutes.get(busId.toUpperCase());
  
  if (!routeVariants || !routeVariants[routeType]) {
    return res.status(404).json({ error: 'Route not found' });
  }
  
  res.json(routeVariants[routeType]);
});

// Get all routes (less meaningful now, but kept for compatibility)
app.get('/api/routes', (req, res) => {
  const allRoutes = [];
  for (const routeVariants of busRoutes.values()) {
    allRoutes.push(...Object.values(routeVariants));
  }
  res.json(allRoutes);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('\n🚌 Smart Bus Tracker Backend Started!');
  console.log('=====================================');
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`🌍 LAN Access: http://${localIP}:${PORT}`);
  console.log(`👉 API Example: http://${localIP}:${PORT}/api/locations/BUS_001`);
  console.log(`🔍 Health Check: http://${localIP}:${PORT}/health`);
  console.log('=====================================\n');
});