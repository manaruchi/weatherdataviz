// Initialize Leaflet map
const map = L.map('map', {
    attributionControl: false,
    zoomControl: false,
    minZoom: 5,
    maxZoom: 10, 
    maxBounds: [
      [-5, 45],
      [48, 110]
    ],
    maxBoundsViscosity: 1.0
  }).setView([25, 80], 5);


// India and World Shapefiles



// Load World GeoJSON
fetch('./data/world.geojson')
  .then(response => response.json())
  .then(data => {
    const worldLayer = L.geoJSON(data, {
      style: {
        color: 'grey',
        weight: 1,
        fillOpacity: 0
      },
    }).addTo(map);
  });

  // Load India GeoJSON
fetch('./data/india_proj.geojson')
  .then(response => response.json())
  .then(data => {
    const indiaLayer = L.geoJSON(data, {
      style: {
        color: 'grey',
        weight: 1,
        fillOpacity: 0
      },
    }).addTo(map);
  });

  // Basemap - Using a Darker Version of CartoDB
L.tileLayer('./tiles/{z}/{x}/{y}{r}.png', {
  attribution: 'CartoDark',
  maxZoom: 10
  }).addTo(map);


// ==================== TIME SLIDER ==============================================
const slider = document.getElementById("time-slider");
const tooltip = document.getElementById("slider-tooltip");
const container = document.getElementById("time-slider-container");

// Update this with your actual time labels per step
const timeLabels = [
  "2025-05-23 00Z", "2025-05-23 03Z", "2025-05-23 06Z", "2025-05-23 09Z",
  // ...
];

// Show time on hover or drag
slider.addEventListener("mousemove", (e) => {
  const rect = slider.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const index = Math.round(percent * (slider.max - slider.min));
  const label = timeLabels[index] || '--';

  tooltip.textContent = label;
  tooltip.style.left = `${e.clientX}px`;
  tooltip.style.top = `${rect.top - 30}px`;
  tooltip.style.display = 'block';
});

slider.addEventListener("mouseleave", () => {
  tooltip.style.display = 'none';
});
// ===============================================================================================
