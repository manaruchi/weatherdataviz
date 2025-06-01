// Global Variables
let selectedLayerKey = "wind_speed"; // default
let playing = false;
let playInterval;

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







  // Basemap - Using a Darker Version of CartoDB
L.tileLayer('./tiles/{z}/{x}/{y}{r}.png', {
  attribution: 'CartoDark',
  maxZoom: 10,
  }).addTo(map);




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
        weight: 1.5,
        fillOpacity: 0
      },
    }).addTo(map);
  });
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

// console.log(timeLabels)

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
  levelTooltip.style.left = `${rect.left + (rect.width * (index / levelSlider.max))-20}px`;
  levelTooltip.style.top = `${rect.top - 10}px`;
  levelTooltip.style.display = "block";

  // TODO: Load wind data for this level index
});

// Function to Enable or Disable Vertical Height Slider
function vertSliderControl(v){
  const slider = document.getElementById("level-slider");
  const sliderLabel = document.getElementById("level-label");
  if(v === 0) {
    // Set val to 0 and disable
    slider.value = 0;
    slider.disabled = true;
    sliderLabel.innerText = "Surface";
    loadWindData();
  } else {
    slider.disabled = false;
  }
}


// ===============================================================================================
// Code to get winds at given values
const levVal = document.getElementById("level-slider");
const tVal = document.getElementById("time-slider");
const toggleInput = document.getElementById("wind-toggle");



document.getElementById("time-slider").addEventListener("input", function (e) {
  loadWindData();
  updateOverlay(selectedLayerKey);
  getPointData();
});

document.getElementById("level-slider").addEventListener("input", function (e) {
  loadWindData();
  updateOverlay(selectedLayerKey);
  getPointData();
});

// Wind Toggle at Layers Container
toggleInput.addEventListener("change", function () {
  loadWindData();
  getPointData();
});

// Time Range Control Buttons
document.getElementById("next-btn").addEventListener("click", function (e) {
  const curValueOfTimeSlider = document.getElementById("time-slider");
  curValueOfTimeSlider.value = Math.min(parseInt(curValueOfTimeSlider.value) + 1, curValueOfTimeSlider.max);
  loadWindData();
  updateOverlay(selectedLayerKey);
  getPointData();
});

document.getElementById("prev-btn").addEventListener("click", function (e) {
  const curValueOfTimeSlider = document.getElementById("time-slider");
  curValueOfTimeSlider.value = Math.min(parseInt(curValueOfTimeSlider.value) - 1, curValueOfTimeSlider.max);
  loadWindData();
  updateOverlay(selectedLayerKey);
  getPointData();
});

document.getElementById("first-btn").addEventListener("click", function (e) {
  const curValueOfTimeSlider = document.getElementById("time-slider");
  curValueOfTimeSlider.value = Math.min(parseInt(curValueOfTimeSlider.value) - 3, curValueOfTimeSlider.max);
  loadWindData();
  updateOverlay(selectedLayerKey);
  getPointData();
});

document.getElementById("last-btn").addEventListener("click", function (e) {
  const curValueOfTimeSlider = document.getElementById("time-slider");
  curValueOfTimeSlider.value = Math.min(parseInt(curValueOfTimeSlider.value) + 3, curValueOfTimeSlider.max);
  loadWindData();
  updateOverlay(selectedLayerKey);
  getPointData();
});

document.getElementById("animate").addEventListener("click", togglePlay);

// Animate Button
function togglePlay() {
  const btn = document.getElementById("animate");
  if (!playing) {
    playInterval = setInterval(showNextFrame, 2000);
    btn.textContent = "⏸";
    btn.title = "Pause Animation";
  } else {
    clearInterval(playInterval);
    btn.textContent = "▶";
    btn.title = "Play Animation";
  }
  playing = !playing;
}

function showNextFrame(){
  const curValueOfTimeSlider = document.getElementById("time-slider");
  curValueOfTimeSlider.value = Math.min(parseInt(curValueOfTimeSlider.value) + 1, curValueOfTimeSlider.max);
  loadWindData();
  updateOverlay(selectedLayerKey);
}


function createDynamicLegend(options) {
  const {
    containerId = 'legend',
    title = 'Wind Speed (KT)',
    colorScale = [
      "#0077FF", // Blue
      "#00FFFD", // Cyan
      "#4EFF3C", // Green
      "#FFFF00", // Yellow
      "#FFB600", // Orange
      "#FF3E00", // Red
      "#990000", // Dark Red
      "#800080"  // Purple
    ],
    min = 0,
    max = 30,
    steps = 6  // Number of labels
  } = options;

  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous

  container.style = `
    position: absolute;
    bottom: 5px;
    right: 20px;
    padding: 10px;
    background: rgba(0,0,0,0.4);
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0,0,0,0.3);
    font-family: sans-serif;
    z-index: 999;
    color: white;
  `;

  const titleDiv = document.createElement('div');
  titleDiv.innerText = title;
  titleDiv.style = 'font-size: 14px; margin-bottom: 4px; text-align: center;';
  container.appendChild(titleDiv);

  const barDiv = document.createElement('div');
  barDiv.style = `
    height: 20px;
    width: 240px;
    background: linear-gradient(to right, ${colorScale.join(',')});
    border: 1px solid #aaa;
    border-radius: 4px;
    margin-bottom: 4px;
  `;
  container.appendChild(barDiv);

  const labelsDiv = document.createElement('div');
  labelsDiv.style = 'display: flex; justify-content: space-between; font-size: 12px;';

  for (let i = 0; i <= steps; i++) {
    const value = min + i * (max - min) / steps;
    const label = document.createElement('span');
    label.innerText = value.toFixed(0);
    labelsDiv.appendChild(label);
  }

  container.appendChild(labelsDiv);
}


// Toggle Between Layers
document.querySelectorAll(".layer-toggle").forEach(button => {
  button.addEventListener("click", () => {
    // Remove 'active' from all buttons
    document.querySelectorAll(".layer-toggle").forEach(btn =>
      btn.classList.remove("active")
    );

    // Add 'active' to clicked button
    button.classList.add("active");

    
    // Update the Global Variable
    selectedLayerKey = button.getAttribute("data-layer");

    // Call your layer switching function here
    updateOverlay(selectedLayerKey);
    getPointData();
  });
});


