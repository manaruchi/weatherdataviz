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

const startDate = new Date("2025-02-19T00:00:00Z");

var timeLabels = [];

for (let i = 0; i < 72; i++) {
    const time = new Date(startDate.getTime() + i * 60 * 60 * 1000); // Add i hours
    const utcHours = String(time.getUTCHours()).padStart(2, '0');
    const utcDay = time.getUTCDate();
    const utcMonth = time.getUTCMonth() + 1;
    const utcYear = time.getUTCFullYear();

    // Format: "YYYY-MM-DD HHZ"
    const timeStr = `${utcYear}-${String(utcMonth).padStart(2, '0')}-${String(utcDay).padStart(2, '0')} ${utcHours}Z`;
    timeLabels.push(timeStr);
}

console.log(timeLabels)

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



// Vertical Height Slider Control ================================================================
const levelSlider = document.getElementById("level-slider");
const levelLabel = document.getElementById("level-label");
const levelTooltip = document.getElementById("level-slider-tooltip");

const levelLabels = [
  "Surface", "925 hPa", "850 hPa", "700 hPa", "600 hPa",
  "500 hPa", "300 hPa", "200 hPa", "100 hPa", "50 hPa"
];

// Show tooltip on hover or drag
levelSlider.addEventListener("mousemove", (e) => {
  const rect = levelSlider.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const index = Math.round(percent * (levelSlider.max - levelSlider.min));
  const label = levelLabels[index] || "--";

  levelTooltip.textContent = label;
  levelTooltip.style.left = `${e.clientX}px`;
  levelTooltip.style.top = `${rect.top - 30}px`;
  levelTooltip.style.display = "block";
});

levelSlider.addEventListener("mouseleave", () => {
  levelTooltip.style.display = "none";
});

levelSlider.addEventListener("input", (e) => {
  const index = parseInt(e.target.value);
  levelLabel.textContent = levelLabels[index];

  const rect = levelSlider.getBoundingClientRect();
  levelTooltip.textContent = levelLabels[index];
  levelTooltip.style.left = `${rect.left + (rect.width * (index / levelSlider.max))}px`;
  levelTooltip.style.top = `${rect.top - 30}px`;
  levelTooltip.style.display = "block";

  // TODO: Load wind data for this level index
});


// ===============================================================================================