let addRouteEnabled = 1;
let animatedPolyline = null;
let plottedCircleMarkers = [];
let routesList = [];
let finalRouteForecast = [];
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

    routesList = [];
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

// WIND & TEMPERATURE FORECAST SECTION

function calculateHoursAfterStart(locations, startTime, totalFlyingTime) {
    const segmentCount = locations.length - 1;
    const segmentTime = totalFlyingTime / segmentCount;

    return locations.map((loc, index) => {
    const rawHours = index * segmentTime;
    const roundedHours = Math.round(rawHours);

    return {
        ...loc,
        hoursAfterStart: roundedHours
    };
    });
}

// Wind and Temperature Interpolation Logic
function interpolateProfile(data, targetAltitudes) {
  return targetAltitudes.map(alt => {
    // Find lower and upper bounding levels
    let lower = null, upper = null;
    for (let i = 0; i < maxLevels; i++) {
      if (data[i].altitude <= alt && alt <= data[i + 1].altitude) {
        lower = data[i];
        upper = data[i + 1];
        break;
      }
    }

    if (!lower || !upper) {
      return { altitude: alt, windSpeed: null, windDir: null, temperature: null };
    }

    const frac = (alt - lower.altitude) / (upper.altitude - lower.altitude);

    // Interpolate wind speed and temperature
    let windSpeed = lower.windSpeed + frac * (upper.windSpeed - lower.windSpeed);
    let temperature = lower.temperature + frac * (upper.temperature - lower.temperature);

    // Interpolate wind direction via u/v components
    const toUV = (speed, dirDeg) => {
      const rad = dirDeg * Math.PI / 180;
      return {
        u: -speed * Math.sin(rad),
        v: -speed * Math.cos(rad)
      };
    };

    const lowerUV = toUV(lower.windSpeed, lower.windDir);
    const upperUV = toUV(upper.windSpeed, upper.windDir);

    const u = lowerUV.u + frac * (upperUV.u - lowerUV.u);
    const v = lowerUV.v + frac * (upperUV.v - lowerUV.v);

    let windDir = (Math.atan2(-u, -v) * 180 / Math.PI + 360) % 360;

    // Round values as requested
    windDir = Math.round(windDir / 10) * 10;
    windSpeed = Math.round(windSpeed / 5) * 5;
    temperature = Math.round(temperature);

    return {
      altitude: alt,
      windSpeed: windSpeed,
      windDir: windDir,
      temperature: temperature
    };
  });
}


document.getElementById("route_forecast").addEventListener("click", async function (e) {
    const timeInputfromHTML = new Date(document.getElementById("startTimeInput").value);
    document.getElementById("loading-spinner").style.display = "block";

    if (routesList.length === 0) {
        alert("Incomplete Input. Please Add Route, Start Time and EET!");
        return;
    }

    const totalFlyingTime = parseInt(document.getElementById("route_eet").value) / 60;
    const initialRouteInformation = calculateHoursAfterStart(routesList, timeInputfromHTML, totalFlyingTime);

    const diffInMs = timeInputfromHTML - startDate;
    const diffInHours = diffInMs / (1000 * 60 * 60) + 5.5;

    let requiredLevelsForForecast = [];
    const requiredLevelsfromHTML = document.getElementById("route_req_levels");
    requiredLevelsfromHTML.value.split(",").forEach(l => {
        requiredLevelsForForecast.push(parseInt(l) * 100);
    });

    finalRouteForecast = [];

    async function buildRouteForecast() {
        for (const r of initialRouteInformation) {
            const currentPointforForecast = [roundedVal(r.lat), roundedVal(r.lng)];
            const inputDataBeforeInterpolation = [];

            try {
                const response = await fetch(`../data/point_data/point_data_${currentPointforForecast[0]}_${currentPointforForecast[1]}.json`);
                const data = await response.json();

                const forecastHourIndex = diffInHours + r.hoursAfterStart;
                const hourlyData = data[forecastHourIndex];

                if (!hourlyData) {
                    console.warn(`No data at hour ${forecastHourIndex} for point`, currentPointforForecast);
                    finalRouteForecast.push(null);
                    continue;
                }

                for (let altitudeCounter = 0; altitudeCounter < maxLevels; altitudeCounter++) {
                    inputDataBeforeInterpolation.push({
                        altitude: hourlyData[`altitude_${altitudeCounter}`] * 3.28084,
                        windSpeed: hourlyData[`wind_speed_${altitudeCounter}`],
                        windDir: hourlyData[`wind_direction_${altitudeCounter}`],
                        temperature: hourlyData[`temperature_${altitudeCounter}`]
                    });
                }

                const pointInterpolationResult = interpolateProfile(inputDataBeforeInterpolation, requiredLevelsForForecast);
                finalRouteForecast.push(pointInterpolationResult);

            } catch (error) {
                console.error("Error processing point", r, error);
                finalRouteForecast.push(null);
            }
        }
    }

    // ✅ Await the forecast building
    await buildRouteForecast();

    // ✅ Now finalRouteForecast is ready
    console.log("Final Route Forecast:", finalRouteForecast);


    const workbook = XLSX.utils.book_new();

    for(var sheetC = 0; sheetC < initialRouteInformation.length; sheetC++){
        const sheetData = []
        finalRouteForecast[sheetC].forEach(d => {
            sheetData.push({altitude: d.altitude, wind_direction: d.windDir, wind_speed: d.windSpeed, temperature: d.temperature})
        })
        
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        
        XLSX.utils.book_append_sheet(workbook, worksheet, initialRouteInformation[sheetC].name);
    }

    XLSX.writeFile(workbook, "forecast_output.xlsx");
    document.getElementById("loading-spinner").style.display = "none";

});




