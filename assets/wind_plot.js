

// Add Shapefile


// Surface Wind JSON Data
fetch('../data/wind_data/wind_2025-02-19_12.json')
  .then(res => res.json())
  .then(json => {
    const velocityLayer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Global Wind',
        position: 'bottomleft',
        emptyString: 'No wind data',
        angleConvention: 'bearingCW',
        speedUnit: 'KT'
      },
      data: json,
      maxVelocity: 100,
      particleColor: 'white',
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
  