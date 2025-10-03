


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

// List all bus locations
app.get('/api/locations', (req, res) => {
  const locations = Array.from(busLocations.values());
  res.json(locations);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// In-memory storage for bus locations
const busLocations = new Map();
const busRoutes = new Map();

// Helper function to get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}



// Initialize bus routes and locations
busRoutesData.forEach(route => {
  busRoutes.set(route.busId, route);
  busLocations.set(route.busId, {
    busId: route.busId,
    lat: route.stops[0].lat,
    lon: route.stops[0].lon,
    speed: 0,
    updated: new Date().toISOString(),
    status: 'Stopped',
    currentStopIndex: 0
  });
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
function getBusDetails(busId) {
  const location = busLocations.get(busId);
  const route = busRoutes.get(busId);

  if (!location || !route) {
    return null;
  }

  const currentStop = route.stops[location.currentStopIndex];
  const nextStop = route.stops[location.currentStopIndex + 1];

  let eta = 'Unknown';
  if (nextStop && location.speed > 0) {
    const distance = calculateDistance(
      location.lat, location.lon,
      nextStop.lat, nextStop.lon
    );
    eta = Math.ceil((distance / location.speed) * 60); // minutes
  } else if (location.speed === 0) {
    eta = 'Stopped';
  }

  return {
    ...location,
    driver: route.driver,
    route: route.route,
    currentStop: currentStop?.name,
    nextStop: nextStop?.name,
    eta: eta,
    totalStops: route.stops.length,
    stops: route.stops
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
  const busDetails = getBusDetails(busId.toUpperCase());
  
  if (!busDetails) {
    return res.status(404).json({ error: 'Bus not found' });
  }
  
  res.json(busDetails);
});

// Update bus location (from GPS hardware)
app.post('/api/locations', (req, res) => {
  const { device_id, lat, lon, speed } = req.body;
  
  if (!device_id || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Missing required fields: device_id, lat, lon' });
  }

  const busId = device_id.toUpperCase();
  const route = busRoutes.get(busId);
  
  let currentStopIndex = 0;
  let status = speed > 0 ? 'Moving' : 'Stopped';
  
  // Find current stop based on proximity
  if (route) {
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
  }

  const locationData = {
    busId,
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    speed: speed ? parseFloat(speed) : 0,
    updated: new Date().toISOString(),
    status,
    currentStopIndex
  };

  busLocations.set(busId, locationData);
  
  console.log(`📍 Updated location for ${busId}: ${lat}, ${lon} (Speed: ${speed} km/h)`);
  
  res.json({ 
    success: true, 
    message: 'Location updated successfully',
    data: locationData
  });
});

// Get bus route information
app.get('/api/routes/:busId', (req, res) => {
  const { busId } = req.params;
  const route = busRoutes.get(busId.toUpperCase());
  
  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }
  
  res.json(route);
});

// Get all routes
app.get('/api/routes', (req, res) => {
  const routes = Array.from(busRoutes.values());
  res.json(routes);
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