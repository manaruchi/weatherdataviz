// Initialize Leaflet map
const map = L.map('map', {
    attributionControl: false,
    minZoom: 5,
    maxZoom: 10, 
    maxBounds: [
      [5, 45],
      [48, 110]
    ],
    maxBoundsViscosity: 1.0
  }).setView([25, 80], 5);

// Basemap - Using a Darker Version of CartoDB
L.tileLayer('./tiles/{z}/{x}/{y}{r}.png', {
  attribution: 'CartoDark',
  maxZoom: 10
  }).addTo(map);

// Add Shapefile


// Surface Wind JSON Data
fetch('../data/wind_velocity.json')
  .then(res => res.json())
  .then(json => {
    const velocityLayer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Global Wind',
        position: 'bottomleft',
        emptyString: 'No wind data',
        angleConvention: 'bearingCW',
        speedUnit: 'kt'
      },
      data: json,
      maxVelocity: 100
    });

    velocityLayer.addTo(map);
  })
  .catch(err => {
    console.error("Failed to load wind data:", err);
  });

  // Wind Legend
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "info legend horizontal-legend");
  
    const speeds = [0, 5, 10, 15, 20, 25, 30, 40, 50];
    const colors = [
      "#00f", "#0cf", "#0f0", "#ff0",
      "#f90", "#f00", "#c00", "#800", "#400"
    ];
  
    div.innerHTML += "<div class='legend-title'>Wind Speed (kt)</div>";
  
    // Create each color box with label inside
    for (let i = 0; i < speeds.length; i++) {
      const from = speeds[i];
      const to = speeds[i + 1];
      const label = to ? `${from}–${to}` : `${from}+`;
  
      div.innerHTML +=
        `<div class="legend-box" style="background:${colors[i]}">` +
        `${label}` +
        `</div>`;
    }
  
    return div;
  };
  
  legend.addTo(map);
  