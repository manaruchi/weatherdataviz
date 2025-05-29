
let velocityLayer = null;





function loadWindData() {
  // Arguments are value from time slider, value of level slider and toggle button

  // Get values of the sliders and toggles
  const levVal = document.getElementById("level-slider");
  const tVal = document.getElementById("time-slider");
  const toggleInput = document.getElementById("wind-toggle");

  const timestampStr = tVal.value;
  const levelStr = levVal.value;

  if (toggleInput.checked){
    const filePath = `./data/wind_data/wind_${timestampStr}_${levelStr}.json`; // modify as needed

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
          displayValues: false,
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
  else{
    // Remove existing layer
      if (velocityLayer) {
        map.removeLayer(velocityLayer);
      }
  }
  
}




  
  legend.addTo(map);
  


