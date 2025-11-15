// Import Mapbox as an ES module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Check that Mapbox GL JS is loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);

// 🔑 Put YOUR token here (must start with "pk.")
mapboxgl.accessToken = 'pk.eyJ1IjoiYWNlbHlubnFpYW8iLCJhIjoiY21oemh2YmQzMG91dDJucTBhb3RldWpyeiJ9.91xzjF6NjtIaS3wU_LQD8w';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div where the map will render
  style: 'mapbox://styles/mapbox/streets-v12', // or your custom style
  center: [-71.09415, 42.36027], // [longitude, latitude] - Boston/Cambridge
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});
