let currentOverlay = null;

// Define Colorscales
const temp_rdbu_r = [
        "#053061",  // Dark Blue
        "#2166ac",  // Blue
        "#4393c3",  // Medium Blue
        "#92c5de",  // Sky Blue
        "#d1e5f0",  // Light Blue
        "#ffffff",  // White (neutral/midpoint)
        "#fddbc7",  // Light Pink
        "#f4a582",  // Peach
        "#d6604d",  // Light Red
        "#b2182b",  // Red
        "#67001f"   // Dark Red
      ]

const temp_blues = [
        "#021025", // Near-black blue
        "#041f4a", // Very dark blue
        "#08306b", // Dark navy blue
        "#08519c", // Strong blue
        "#2171b5", // Deep sky blue
        "#4292c6", // Medium blue
        "#6baed6", // Medium light blue
        "#9ecae1", // Sky blue
        "#c6dbef", // Soft blue
        "#deebf7", // Pale blue
        "#f7fbff"  // Very light blue (almost white)
      ]

const rain_colors = [
  "#464444",//  Dark
  "#f7fbff", //  Very light blue (almost white)
  "#deebf7", //  Pale blue
  "#c6dbef", //  Soft blue
  "#9ecae1", //  Sky blue
  "#6baed6", //  Medium light blue
  "#4292c6", //  Medium blue
  "#2171b5", //  Deep sky blue
  "#08519c", //  Strong blue
  "#08306b", //  Dark navy blue
  "#041f4a", //  Very dark blue
  "#021025",  //  Near-black blue
  "#fddbc7",  // Light Pink
  "#f4a582", //  Peach
  "#d6604d", //  Light Red
  "#b2182b", //  Red
  "#67001f"  //  Dark Red
]

// Image bounds from your WRF-generated image
const imageBounds = [
  [-3.236724853515625, 44.73521041870117],
  [43.468475341796875, 111.2647857666015]
];

function updateOverlay(dataLayerName) {
  // Hide the Vertical Height Slider As Required
  if(dataLayerName === "wind_speed"){
    vertSliderControl(1);
  } else if(dataLayerName === "temperature"){
    vertSliderControl(1);
  } else if(dataLayerName === "rainfall"){
    vertSliderControl(0);
  }

  // Get values of the sliders and toggles
  const levVal = document.getElementById("level-slider");
  const tVal = document.getElementById("time-slider");

  const timestampStr = tVal.value;
  const levelStr = levVal.value;

  const imageUrl = `./data/${dataLayerName}/${dataLayerName}_${timestampStr}_${levelStr}.png`;

  // Show spinner
  document.getElementById('loading-spinner').style.display = 'block';

  // Create new overlay with opacity 0
  const newOverlay = L.imageOverlay(imageUrl, imageBounds, {
    opacity: 0
  });

  // Add new overlay *below* the current overlay to allow crossfade
  newOverlay.addTo(map);
  const newImg = newOverlay.getElement();

  // When new image is loaded
  newOverlay.on('load', () => {
    // Ensure image element is accessible
    const newImg = newOverlay.getElement();
    if (newImg) {
      // Smooth fade-in
      newImg.style.transition = 'opacity 0.5s ease-in-out';
      newImg.style.opacity = 0.7;
    }

    // Fade out and remove old overlay
    if (currentOverlay) {
      const oldImg = currentOverlay.getElement();
      if (oldImg) {
        oldImg.style.transition = 'opacity 0.5s ease-in-out';
        oldImg.style.opacity = 0;
      }

      // Remove old overlay after fade out
      setTimeout(() => {
        map.removeLayer(currentOverlay);
        currentOverlay = newOverlay;
      }, 1000); // Match transition time
    } else {
      currentOverlay = newOverlay;
    }

    // Hide spinner
    document.getElementById('loading-spinner').style.display = 'none';
  });

  

  // Update the Legend
  if(dataLayerName === "wind_speed"){
    createDynamicLegend({
      min: 0,
      max: 50,
      steps: 7,
      title: 'Wind Speed (KT)'
    });
  } else if(dataLayerName === "temperature"){
    const temp_vmin_values = [-10,-10,-20,-30,-40,-40,-60,-70,-80,-80]
    const temp_vmax_values = [50,40,30,20,10,10,0,-10,-30,-40]
    const lev_val = parseInt(levelStr)
    if(lev_val < 3){
      createDynamicLegend({ min: temp_vmin_values[lev_val], max: temp_vmax_values[lev_val], steps: 8, title: 'Temperature (°C)', colorScale: temp_rdbu_r });
    } else {
      createDynamicLegend({ min: temp_vmin_values[lev_val], max: temp_vmax_values[lev_val], steps: 8, title: 'Temperature (°C)', colorScale: temp_blues });
    }
    
  } else if(dataLayerName === "rainfall"){
    createDynamicLegend({ min: 0, max: 30, steps: 8, title: 'Rainfall (mm)', colorScale: rain_colors });
  }
  
}


