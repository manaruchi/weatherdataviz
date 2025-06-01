function plotMeteogram(){
    const chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";
    const containerWidth = chartDiv.getBoundingClientRect().width;

    fetch(`../data/point_data/point_data_${selectedLat}_${selectedLon}.json`)
    .then(response => response.json())
    .then(mainData => {
        // Show the Loader
        document.getElementById('loading-spinner2').style.display = 'block';

        let data = [];
        // Add the data points
        mainData.forEach(d => {
            data.push({time: d.time, dryBulb: d.temperature, rainfall: d.rainfall})
        });

        const parseTime = d3.timeParse("%Y-%m-%d %H:%M:00");
        data.forEach(d => d.time = parseTime(d.time));

        const margin = { top: 30, right: 70, bottom: 30, left: 70 },
            width = containerWidth - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        const svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.time))
            .range([0, width]);

        const yLeft = d3.scaleLinear()
            .domain([
                d3.min(data, d => d.dryBulb) - 1,
                d3.max(data, d => d.dryBulb) + 1
            ])
            .range([height, 0]);

        const yRight = d3.scaleLinear()
            .domain([0, Math.max(1, d3.max(data, d => d.rainfall) * 1.2)])
            .range([height, 0]);

        const xAxis = d3.axisBottom(x)
            .ticks(d3.timeHour.every(6))
            .tickFormat(d3.timeFormat("%H:%M"));

        const yAxisLeft = d3.axisLeft(yLeft);
        const yAxisRight = d3.axisRight(yRight);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svg.append("g")
            .call(yAxisLeft);

        svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(yAxisRight);

        // Axis labels
        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", `translate(${-45},${height/2}) rotate(-90)`)
            .style("text-anchor", "middle")
            .text("Degree Centigrade (°C)");

        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", `translate(${width + 50},${height/2}) rotate(90)`)
            .style("text-anchor", "middle")
            .text("Millimeters (mm)");

        // Line for dry bulb temperature
        const lineDry = d3.line()
            .x(d => x(d.time))
            .y(d => yLeft(d.dryBulb));

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", lineDry)
            .attr("stroke", "red")
            .attr("fill", "none");

        // Dots for dry bulb temperature
        const dryDots = svg.selectAll(".dot-dry")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot dot-dry")
            .attr("cx", d => x(d.time))
            .attr("cy", d => yLeft(d.dryBulb))
            .attr("r", 4)
            .attr("fill", "red");

        // Bars for rainfall
        const barWidth = 15;
        const barsRainfall = svg.selectAll(".bar-rainfall")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar bar-rainfall")
            .attr("x", d => x(d.time) - barWidth / 2)
            .attr("y", d => yRight(d.rainfall))
            .attr("width", barWidth)
            .attr("height", d => height - yRight(d.rainfall))
            .attr("fill", "blue")
            .attr("opacity", 0.8)
            .style("cursor", "pointer");

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("display", "none");

        const hoverLine = svg.append("line")
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "4")
            .attr("y1", 0)
            .attr("y2", height)
            .style("display", "none");

        const bisectTime = d3.bisector(d => d.time).left;

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mousemove", function(event) {
                const [mx] = d3.pointer(event);
                const x0 = x.invert(mx);
                const i = bisectTime(data, x0, 1);
                const d0 = data[i - 1];
                const d1 = data[i];
                const d = (!d0 || !d1) ? (d0 || d1) : (x0 - d0.time > d1.time - x0 ? d1 : d0);
                showHover(event, d);
            })
            .on("mouseout", () => hideHover());

        function showHover(event, d) {
            hoverLine.style("display", null)
                .attr("x1", x(d.time))
                .attr("x2", x(d.time));

            tooltip.style("display", "block")
                .html(`
                    <strong>Time:</strong> ${d3.timeFormat("%Y-%m-%d %H:%M")(d.time)}<br/>
                    <strong>Dry Bulb:</strong> ${d.dryBulb}°C<br/>
                    <strong>Rainfall:</strong> ${d.rainfall} mm
                `);
            moveTooltip(event);

            dryDots.transition().duration(30).attr("r", c => c === d ? 7 : 4);
            barsRainfall.transition().duration(30)
                .style("opacity", c => c === d ? 1 : 0.4)
                .attr("stroke", c => c === d ? "black" : "none")
                .attr("stroke-width", c => c === d ? 2 : 0);
        }

        function moveTooltip(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }

        function hideHover() {
            tooltip.style("display", "none");
            hoverLine.style("display", "none");
            dryDots.transition().duration(200).attr("r", 4);
            barsRainfall.transition().duration(200)
                .style("opacity", 0.8)
                .attr("stroke", "none");
        }

        // Legend
        const legendData = [
            { name: "Dry Bulb Temp", color: "red" },
            { name: "Rainfall", color: "blue" }
        ];

        const legend = svg.append("g")
            .attr("transform", `translate(${width / 2 - 100}, -30)`);

        legend.selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 140)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => d.color);

        legend.selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", (d, i) => i * 140 + 24)
            .attr("y", 14)
            .attr("color", "white")
            .text(d => d.name);
    })
    .finally(() => {
        document.getElementById('loading-spinner2').style.display = 'none';
    }
        
    );
}


function hideMeteogramPanel(){
    document.getElementById('meteogram-container').style.display = 'none';
}

function showTab(tabId) {

  // Update active tab button
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Activate the current tab
  document.getElementById(`tab-button-${tabId}`).classList.add('active');
}
