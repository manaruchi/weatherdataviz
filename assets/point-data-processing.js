let currentMarker = null;
let selectedLat = null;
let selectedLon = null;

function getPointData(){
    if(selectedLat){
    // Show the panel first
    document.getElementById('point-data-container').style.display = 'block';

    // Get values of the sliders and toggles
    const levVal_pt = document.getElementById("level-slider");
    const tVal_pt = document.getElementById("time-slider");
    const toggleInput_pt = document.getElementById("wind-toggle");

    // Container in which value will be seen
    const pointOutputContainer = document.getElementById("point-data-container");
    var outputText = "";

    fetch(`../data/point_data/point_data_${selectedLat}_${selectedLon}.json`)
        .then(response => response.json())
        .then(data => {
            if(selectedLayerKey === "rainfall"){
                pointOutputContainer.innerHTML = `<p class="point-data-variable-name">Rainfall</p><p class="point-data-variable-value">${data[parseInt(tVal_pt.value)].rainfall}MM</p>`
            } else if(selectedLayerKey === "temperature") {
                if(parseInt(levVal_pt.value) === 0){
                    pointOutputContainer.innerHTML = `<p class="point-data-variable-name">Temperature</p><p class="point-data-variable-value">${data[parseInt(tVal_pt.value)].temperature}°C</p>`
                } else {
                    pointOutputContainer.innerHTML = `<p class="point-data-variable-name">Temperature</p><p class="point-data-variable-value">${data[parseInt(tVal_pt.value)][`temperature_${levelCorrespondingToPressure(parseInt(levVal_pt.value))}`]}°C</p>`
                }
            } else if(selectedLayerKey === "wind_speed") {
                if(parseInt(levVal_pt.value) === 0){
                    pointOutputContainer.innerHTML = `<p class="point-data-variable-name">Winds</p><p class="point-data-variable-value">${data[parseInt(tVal_pt.value)]['wind_direction_surface'].toString().padStart(3, '0')}/${Math.round(data[parseInt(tVal_pt.value)]['wind_speed_surface']).toString().padStart(2, '0')}KT</p>`
                } else {
                    pointOutputContainer.innerHTML = `<p class="point-data-variable-name">Winds</p><p class="point-data-variable-value">${data[parseInt(tVal_pt.value)][`wind_direction_${levelCorrespondingToPressure(parseInt(levVal_pt.value))}`].toString().padStart(3, '0')}/${Math.round(data[parseInt(tVal_pt.value)][`wind_speed_${levelCorrespondingToPressure(parseInt(levVal_pt.value))}`]).toString().padStart(2, '0')}KT</p>`
                }
            }


            // Show wind data if wind toggle is on.
            if(toggleInput_pt.checked){
                if(selectedLayerKey !== "wind_speed"){
                    if(parseInt(levVal_pt.value) === 0){
                        pointOutputContainer.innerHTML += `<p class="point-data-variable-name">Winds</p><p class="point-data-variable-value">${data[parseInt(tVal_pt.value)]['wind_direction_surface'].toString().padStart(3, '0')}/${Math.round(data[parseInt(tVal_pt.value)]['wind_speed_surface']).toString().padStart(2, '0')}KT</p>`
                    } else {
                        pointOutputContainer.innerHTML += `<p class="point-data-variable-name">Winds</p><p class="point-data-variable-value">${data[parseInt(tVal_pt.value)][`wind_direction_${levelCorrespondingToPressure(parseInt(levVal_pt.value))}`].toString().padStart(3, '0')}/${Math.round(data[parseInt(tVal_pt.value)][`wind_speed_${levelCorrespondingToPressure(parseInt(levVal_pt.value))}`]).toString().padStart(2, '0')}KT</p>`

                    }
                }
            }

            pointOutputContainer.innerHTML += `<span id="point-data-close-button" onclick="hidePointDataPanel()">×</span>`
        })

        
    } else {
         document.getElementById('point-data-container').style.display = 'none';
    }

    
}

function levelCorrespondingToPressure(x){
    // Returns value of Z-level out of 32 levels as per the value
    // of the level Slider
    correspondingLevels = [0, 6, 11, 14, 16, 21, 24, 28, 31]
    return correspondingLevels[x-1]
}

// Function to round value of Lat and Long to nearest 5 degree lat long
// as the point files we have generated is for 5 degree intervals
function roundedVal(num) {
    return Math.round(num / 5) * 5;
}

// Handle the OnClick Event on Map
map.on('click', function(e) {
    // e.latlng contains the latitude and longitude of the clicked point
    const clicked_lat = e.latlng.lat;
    const clicked_lon = e.latlng.lng;

    // Update the global variables
    selectedLat = roundedVal(clicked_lat.toFixed(2))
    selectedLon = roundedVal(clicked_lon.toFixed(2))

    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    currentMarker = L.marker([clicked_lat, clicked_lon]).addTo(map);
    getPointData();

    // If the meteogram is already visible, then update the map.
    if(document.getElementById('meteogram-container').style.display !== 'none'){
        plotMeteogram();
    }

    // If add Route point is enabled, change the values of the lat and long boxes as well.
    if(addRouteEnabled > 0){
        document.getElementById("route_lat").value = clicked_lat.toFixed(2)
        document.getElementById("route_lon").value = clicked_lon.toFixed(2)
    }
});

// Handle the doubleClick Event on Map
map.on('dblclick', function(e) {
    document.getElementById('meteogram-container').style.display = 'block';
    plotMeteogram();
});


// Hide and Reset when close button is clicked
function hidePointDataPanel(){
    selectedLat = null;
    selectedLon = null;
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    document.getElementById('point-data-container').style.display = 'none';
}