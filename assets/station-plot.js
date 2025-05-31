let circleLayerGroup = L.layerGroup().addTo(map);
let circlesVisible = true;
let selectedStation = "";
let showStationInformationPanel = 0;


map.createPane('circlePane');
map.getPane('circlePane').style.zIndex = 1200;

function loadStationData() {
  fetch('../data/currwx.json')
    .then(response => response.json())
    .then(data => {
      // Clear previous circles
      circleLayerGroup.clearLayers();

      data['stations'].forEach(point => {
        const wrngType = point.wrng.split(" ")[0];
        let stnFillColor = "green";

        if (wrngType === "CMR") {
          stnFillColor = "yellow";
        } else if (wrngType === "Weather") {
          stnFillColor = "red";
        } else if (wrngType === "Sector") {
          stnFillColor = "orange";
        } else if (wrngType === "Gale") {
          stnFillColor = "purple";
        }

        const circle = L.circle([parseFloat(point.lat), parseFloat(point.lon)], {
          radius: 10000,
          color: stnFillColor,
          fillColor: stnFillColor,
          fillOpacity: 1,
          pane: 'circlePane'
        });

        circle.bindTooltip(point.stn_name, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip'
        });

        circle.on('click', () => {
          // Update Global Variable
          selectedStation = point.stn_name;
          showStationInformationPanel = 1;
          getStationDetails();
        });

        circle.addTo(circleLayerGroup);
      });

      // Ensure visibility state is respected
      if (circlesVisible && !map.hasLayer(circleLayerGroup)) {
        map.addLayer(circleLayerGroup);
      }
    });
    console.log("Station Data Updated!!!")
}

// First load
loadStationData();

// Toggle visibility if needed
function toggleCircles() {
  if (circlesVisible) {
    map.removeLayer(circleLayerGroup);
  } else {
    map.addLayer(circleLayerGroup);
  }
  circlesVisible = !circlesVisible;
}

function getStationDetails(){
  console.log(`station details function called. global: ${showStationInformationPanel}`);
  // Show the Panel
  if(showStationInformationPanel === 0){
    document.getElementById("station-information").style.display = "none";
  } else {
    document.getElementById("station-information").style.display = "block";
  }
  

  fetch('../data/currwx.json')
    .then(response => response.json())
    .then(data => {
      // Hide everything first
      document.getElementById("station-name").style.display = "none";
      document.getElementById("station-advisory").style.display = "none";

      // Show a loading spinner
      document.getElementById("station-loader").style.display = "block";

      data['stations'].forEach(point => {
        if(point.stn_name === selectedStation){
          // Station Name
          document.getElementById("station-name").innerText = point.stn_name;
          // Observation Time
          document.getElementById("station-obs-time").innerText = `${point.dt} ${point.tm}Hr`;
          // Station Advisory
          document.getElementById("station-advisory").innerText = point.wrng;
          const wrngType = point.wrng.split(" ")[0];
          let stnFillColor = "green";
          let stnTextColor = "white";
          if (wrngType === "CMR") {
            stnFillColor = "yellow";
            stnTextColor = "black";
          } else if (wrngType === "Weather") {
            stnFillColor = "red";
            stnTextColor = "white";
          } else if (wrngType === "Sector") {
            stnFillColor = "orange";
            stnTextColor = "white";
          } else if (wrngType === "Gale") {
            stnFillColor = "purple";
            stnTextColor = "white";
          }
          document.getElementById("station-advisory").style.backgroundColor = stnFillColor;
          document.getElementById("station-advisory").style.color = stnTextColor;
          
          // Data Table
          document.getElementById("station-data-winds").innerText = `${point.dir}${point.speed}KT`;
          document.getElementById("station-data-visibility").innerText = `${point.vis}M`;
          document.getElementById("station-data-weather").innerText = `${point.wx}`;
          document.getElementById("station-data-clouds").innerText = `${point.cld}`;
          document.getElementById("station-data-temperature").innerText = `${point.db}°C`;
          document.getElementById("station-data-pressure").innerText = `${point.qnh} hPa`;
          document.getElementById("station-data-trend").innerText = `${point.trend}`;

        }
      });
    })
    .finally(() => {
      // Show everything first
      document.getElementById("station-name").style.display = "block";
      document.getElementById("station-advisory").style.display = "block";

      // Hide the loading spinner
      document.getElementById("station-loader").style.display = "none";
    });
}

function hideStationInformationPanel(){
  showStationInformationPanel = 0;
  document.getElementById("station-information").style.display = "none";
}

// Reload every 1 minutes (60000 ms)
setInterval(loadStationData, 60000);
setInterval(getStationDetails, 60000);