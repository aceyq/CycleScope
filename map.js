// Import Mapbox as an ES module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Check that Mapbox GL JS is loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);

// 🔑 Your Mapbox access token (pk...)
mapboxgl.accessToken = 'pk.eyJ1IjoiYWNlbHlubnFpYW8iLCJhIjoiY21oemh2YmQzMG91dDJucTBhb3RldWpyeiJ9.91xzjF6NjtIaS3wU_LQD8w';

// Create the base map
const map = new mapboxgl.Map({
  container: 'map', // div id="map"
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027], // Boston/Cambridge area
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

// 🔹 Shared paint style for bike lanes (optional but nice)
const bikeLinePaint = {
  'line-color': '#32D400', // bright-ish green
  'line-width': 4,
  'line-opacity': 0.6,
};

map.on('load', async () => {
    console.log('Map loaded, adding bike lanes…');
  
    // Boston
    map.addSource('boston_route', {
      type: 'geojson',
      data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
    });
  
    map.addLayer({
      id: 'boston-bike-lanes',
      type: 'line',
      source: 'boston_route',
      paint: bikeLinePaint,
    });
  
    // Cambridge
    map.addSource('cambridge_route', {
      type: 'geojson',
      data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson', // <- plug in the lab URL
    });
  
    map.addLayer({
      id: 'cambridge-bike-lanes',
      type: 'line',
      source: 'cambridge_route',
      paint: bikeLinePaint,
    });

    // ===== Step 3: Bluebikes stations =====

  // Select the SVG overlay inside #map
  const svg = d3.select('#map').select('svg');

  // Load Bluebikes station JSON
  const jsonUrl =
    'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

  let jsonData;
  try {
    jsonData = await d3.json(jsonUrl);
    console.log('Loaded JSON Data:', jsonData);
  } catch (error) {
    console.error('Error loading JSON:', error);
    return; // stop if we couldn’t load data
  }

  const stations = jsonData.data.stations;
  console.log('Stations Array:', stations);

  // Create one circle per station
  const circles = svg
    .selectAll('circle')
    .data(stations)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8);

  // Function to update circle positions based on current map view
  function updatePositions() {
    circles
      .attr('cx', (d) => getCoords(d).cx)
      .attr('cy', (d) => getCoords(d).cy);
  }

  // Initial positioning
  updatePositions();

  // Keep markers in sync with the map
  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);
});
  