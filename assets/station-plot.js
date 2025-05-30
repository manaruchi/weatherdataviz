let circleLayerGroup = L.layerGroup().addTo(map);
let circlesVisible = true;

map.createPane('circlePane');
map.getPane('circlePane').style.zIndex = 1200;  // Higher number = on top


fetch('../data/currwx.json')
    .then(response => response.json())
    .then(data => {
        console.log(data['stations'][4].wrng.split(" ")[0])
        data['stations'].forEach(point => {
          // Values for Station
          let stnFillColor = "green";

          // Get Station Advisory
          if(point.wrng.split(" ")[0] === "CMR"){
            stnFillColor = "yellow";
          } else if(point.wrng.split(" ")[0] === "Weather"){
            stnFillColor = "red";
          } else if(point.wrng.split(" ")[0] === "Sector"){
            stnFillColor = "orange";
          } else if(point.wrng.split(" ")[0] === "Gale"){
            stnFillColor = "purple";
          } 


          const circle = L.circle([parseFloat(point.lat), parseFloat(point.lon)], {
            radius: 10000,
            color: stnFillColor,
            fillColor: stnFillColor,
            fillOpacity: 1,
            pane: 'circlePane'
          });

          // Bind tooltip with custom class
          circle.bindTooltip(point.stn_name, {
            permanent: false,
            direction: 'top',
            className: 'custom-tooltip'
          });

          circle.addTo(circleLayerGroup);
        });
    });

circleLayerGroup.bringToFront()

function toggleCircles() {
    if (circlesVisible) {
    map.removeLayer(circleLayerGroup);
    } else {
    map.addLayer(circleLayerGroup);
    }
    circlesVisible = !circlesVisible;
}