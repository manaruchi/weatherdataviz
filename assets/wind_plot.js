
let velocityLayer = null;

function loadWindData(timestampStr) {
  const filePath = `./data/wind_data/wind_Surface_${timestampStr}.json`; // modify as needed

  // Show a loading spinner
  document.getElementById("loading-spinner").style.display = "block";

  fetch(filePath)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load wind data");
      return response.json();
    })
    .then((windData) => {
      
      // Update the Time Label over the Time Slider
      const timeLabelOverSlider = document.getElementById("time-label");
      timeLabelOverSlider.innerText = windData[0].header.refTime;
      // Remove existing layer
      if (velocityLayer) {
        map.removeLayer(velocityLayer);
      }

      // Create new velocity layer
      velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "Wind",
          position: "bottomleft",
          emptyString: "No wind data",
          speedUnit: "KT"
        },
        data: windData,
        maxVelocity: 100,
        velocityScale: 0.005,
        colorScale: ['white'],
        lineWidth: 1,
        frameRate: 20
      });

      velocityLayer.addTo(map);
    })
    .catch((err) => {
      console.error("Error loading wind data:", err);
    })
     .finally(() => {
      // Hide spinner when done
      document.getElementById("loading-spinner").style.display = "none";
    });
}


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
  