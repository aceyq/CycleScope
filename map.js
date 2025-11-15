// --- Imports ---
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

console.log('Mapbox GL JS Loaded:', mapboxgl);
console.log('D3 Loaded:', d3);

// 🔑 Your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWNlbHlubnFpYW8iLCJhIjoiY21oemh2YmQzMG91dDJucTBhb3RldWpyeiJ9.91xzjF6NjtIaS3wU_LQD8w';

// --- Base map ---
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027], // Boston/Cambridge area
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

// Shared line style for bike lanes
const bikeLinePaint = {
  'line-color': '#32D400',
  'line-width': 4,
  'line-opacity': 0.6,
};

/**
 * Convert a station's lat/lon (from the JSON) into pixel coordinates
 * on the Mapbox map. Returns { cx, cy } or null if coordinates are bad.
 *
 * JSON fields (actual structure):
 *   lat  -> latitude
 *   lon  -> longitude
 */
function getCoords(station) {
  const lon = Number(station.lon);
  const lat = Number(station.lat);

  // If either is NaN/invalid, skip this station
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    console.warn('Invalid station coordinates, skipping:', station);
    return null;
  }

  // Mapbox accepts [lon, lat]
  const p = map.project([lon, lat]);
  return { cx: p.x, cy: p.y };
}

// --- When the map is ready ---
map.on('load', async () => {
  console.log('Map loaded, adding bike lanes and stations…');

  // ===== Step 2: Bike lanes =====

  // Boston bike lanes
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

  // Cambridge bike lanes
  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
  });

  map.addLayer({
    id: 'cambridge-bike-lanes',
    type: 'line',
    source: 'cambridge_route',
    paint: bikeLinePaint,
  });

  // ===== Step 3: Bluebikes stations =====

  // SVG overlay inside #map
  const svg = d3.select('#map').select('svg');

  // Load station JSON from the lab URL
  const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

  let jsonData;
  try {
    jsonData = await d3.json(jsonurl);
    console.log('Loaded JSON Data:', jsonData);
  } catch (error) {
    console.error('Error loading JSON:', error);
    return; // stop if fetch failed
  }

  const stations = jsonData.data.stations;
  console.log('Stations Array:', stations);

  // Append one circle per station
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

  // Position circles based on current map view
  function updatePositions() {
    circles
      .attr('cx', (d) => {
        const pt = getCoords(d);
        return pt ? pt.cx : -9999; // move invalid ones offscreen
      })
      .attr('cy', (d) => {
        const pt = getCoords(d);
        return pt ? pt.cy : -9999;
      })
      .attr('display', (d) => {
        const pt = getCoords(d);
        return pt ? null : 'none'; // hide invalid stations
      });
  }

  // Initial draw
  updatePositions();

  // Keep markers aligned when the map moves/zooms/resizes
  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);
});