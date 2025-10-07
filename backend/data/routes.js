const morningRoute = {
  busId: "BUS_001",
  route: "Boothapadi - Mpnmjec",
  stops: [
    { name: "Boothapadi", lat: 11.60979, lon: 77.71569, time: "06:25 AM" },
    { name: "Unjapalayam", lat: 11.60846, lon: 77.70135, time: "06:30 AM" },
    { name: "Attavanaipudur", lat: 11.59186, lon: 77.66493, time: "07:10 AM" },
    { name: "Poonachi", lat: 11.58573, lon: 77.66314, time: "07:15 AM" },
    { name: "Chittar", lat: 11.55115, lon: 77.71735, time: "07:20 AM" },
    { name: "Jeeva nagar", lat: 11.47374, lon: 77.69571, time: "07:35 AM" },
    { name: "Bhavani BS", lat: 11.45242, lon: 77.68752, time: "07:40 AM" },
    { name: "Anthiyur Pirivu", lat: 11.44662, lon: 77.6841, time: "07:45 AM" },
    { name: "Pathirakadai", lat: 11.44216, lon: 77.68322, time: "07:48 AM" },
    { name: "Kalingarayanpalayam", lat: 11.43618, lon: 77.67765, time: "07:50 AM" },
    { name: "Lakshminagar", lat: 11.43068, lon: 77.67532, time: "07:55 AM" },
    { name: "Appachi nagar", lat: 11.41659, lon: 77.67961, time: "08:00 AM" },
    { name: "R.N. Pudhur", lat: 11.39992, lon: 77.69013, time: "08:10 AM" },
    { name: "BP Agraharam", lat: 11.37204, lon: 77.70517, time: "08:15 AM" },
    { name: "Agraharam", lat: 11.36999, lon: 77.70658, time: "08:18 AM" },
    { name: "Christhu Jothi School", lat: 11.36343, lon: 77.71083, time: "08:20 AM" },
    { name: "VOC Park Erode", lat: 11.35264, lon: 77.72046, time: "08:25 AM" },
    { name: "Erode BS", lat: 11.346396, lon: 77.718577, time: "08:30 AM" },
    { name: "GH", lat: 11.34052, lon: 77.71681, time: "08:35 AM" },
    { name: "Surampatti four Rd", lat: 11.332481, lon: 77.719785, time: "08:38 AM" },
    { name: "Diesel Shed", lat: 11.325696, lon: 77.717981, time: "08:40 AM" },
    { name: "Kasipalayam", lat: 11.319061, lon: 77.713521, time: "08:45 AM" },
    { name: "ITI", lat: 11.315461, lon: 77.711959, time: "08:48 AM" },
    { name: "KK-nagar", lat: 11.311733, lon: 77.707231, time: "08:50 AM" },
    { name: "Rangampalayam", lat: 11.30395, lon: 77.70235, time: "08:55 AM" },
    { name: "Mpnmjec", lat: 11.186755, lon: 77.622584, time: "09:20 AM" },
  ].map((stop, index) => ({ ...stop, order: index }))
};

const eveningTimes = {
  "Mpnmjec": "04:25 PM",
  "Rangampalayam": "04:50 PM",
  "KK-nagar": "04:55 PM",
  "ITI": "04:57 PM",
  "Kasipalayam": "05:00 PM",
  "Diesel Shed": "05:05 PM",
  "Surampatti four Rd": "05:07 PM",
  "GH": "05:10 PM",
  "Erode BS": "05:15 PM",
  "VOC Park Erode": "05:20 PM",
  "Christhu Jothi School": "05:25 PM",
  "Agraharam": "05:27 PM",
  "BP Agraharam": "05:30 PM",
  "R.N. Pudhur": "05:35 PM",
  "Appachi nagar": "05:45 PM",
  "Lakshminagar": "05:50 PM",
  "Kalingarayanpalayam": "05:55 PM",
  "Pathirakadai": "05:57 PM",
  "Anthiyur Pirivu": "06:00 PM",
  "Bhavani BS": "06:05 PM",
  "Jeeva nagar": "06:10 PM",
  "Chittar": "06:25 PM",
  "Poonachi": "06:30 PM",
  "Attavanaipudur": "06:35 PM",
  "Unjapalayam": "07:15 PM",
  "Boothapadi": "07:20 PM"
};

// Automatically generate the evening route by reversing the morning route
const eveningRoute = {
  busId: "BUS_001_EVE",
  route: "Mpnmjec - Boothapadi",
  stops: morningRoute.stops.slice().reverse().map((stop, index) => {
    // Find the original stop to get lat/lon
    const originalStop = morningRoute.stops.find(s => s.name === stop.name);
    return {
      name: stop.name,
      lat: originalStop.lat,
      lon: originalStop.lon,
      time: eveningTimes[stop.name] || "N/A", // Use evening time, default to N/A
      order: index
    };
  })
};

module.exports = [morningRoute, eveningRoute];