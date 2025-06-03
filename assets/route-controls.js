let addRouteEnabled = 1;
let animatedPolyline = null;
let plottedCircleMarkers = [];
// If this value is more than 0, then whenever user clicks on the map,
// the lat and long box of route plotter will have lat and long value.

// Add the route if name, lat and long are provided
document.getElementById("route_add").addEventListener("click", function (e) {
    const addRouteName = document.getElementById("route_name").value;
    const addRouteLat = parseFloat(document.getElementById("route_lat").value);
    const addRouteLong = parseFloat(document.getElementById("route_lon").value);
    const addRouteFinalRoute = document.getElementById("final-route");
    
    if(addRouteName && addRouteLat && addRouteLong){
        if(addRouteFinalRoute.value === ""){
        addRouteFinalRoute.value += `${addRouteName}(${parseInt(addRouteLat * 100)}/${parseInt(addRouteLong * 100)})`
        } else {
            addRouteFinalRoute.value += `-${addRouteName}(${parseInt(addRouteLat * 100)}/${parseInt(addRouteLong * 100)})`
        }
        document.getElementById("route_name").value = "";
    } else {
        alert("Please Give Point Name, Lat and Long")
    }
    
});

// Plot the Given Route
document.getElementById("route_plot").addEventListener("click", function (e) {
    // Remove Existing Plot
    removeRoutePlot();
    // Get data from Final Route
    const finalRoutefromTextArea = document.getElementById("final-route").value;

    let routesList = [];
    plottedCircleMarkers = [];

    if(finalRoutefromTextArea){
        const routesAfterSplitting = finalRoutefromTextArea.split("-")
        routesAfterSplitting.forEach(rp => {
            routesList.push({name: rp.split("(")[0], lat: parseFloat(rp.split("(")[1].split("/")[0])/100, lng: parseFloat(rp.split("(")[1].split("/")[1].split(")")[0]) / 100})
        })

        const latlngs = routesList.map(p => [p.lat, p.lng]);

        // Draw the polyline with animated marching ants
        animatedPolyline = L.polyline(latlngs, {
            color: 'black',
            weight: 3,
            className: 'ant-path'
        }).addTo(map);

        // Add circle markers and tooltips
        routesList.forEach(point => {
            const routeCircleMarker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            fillColor: "#0078ff",
            color: "#ffffff",
            weight: 2,
            fillOpacity: 1
            })
            .addTo(map)
            .bindTooltip(point.name, { permanent: false, direction: 'top' });

            plottedCircleMarkers.push(routeCircleMarker);
        });

    }
})

function toggleRoutePanel() {
  if(document.getElementById("route-toggle").checked){
    document.getElementById("route-plotter").style.display = "block";
    routeForecastPanelActiveOrNot = 1;
    document.getElementById("station-information").style.display = "none";
  } else {
    document.getElementById("route-plotter").style.display = "none";
    routeForecastPanelActiveOrNot = 0;
    removeRoutePlot();
  }
}

function removeRoutePlot(){
    if(animatedPolyline){
        map.removeLayer(animatedPolyline);
    }
    plottedCircleMarkers.forEach(marker => map.removeLayer(marker));
    plottedCircleMarkers.length = 0; // Clear the array
}