var tooltip = d3.select("body")
    .append("div")
    .attr("class", "myTooltip")
    .style("visibility", "hidden")
    .html("a simple tooltip</br>hh");

var map = L.map("map").setView([40, 0], 2);

L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
	maxZoom: 18,
	minZoom: 1,
	attributionControl: false,
	id: 'mapbox/light-v9',
	maxBounds: L.latLngBounds(L.latLng(87.12, 281.26), L.latLng(-87.12, -281.26))
}).addTo(map);
//L.geoJSON(geojsonFeature).addTo(map);

var info = L.control({position: "bottomright"});

info.onAdd = function(map) {
	this._div = L.DomUtil.create("div", "info");
	this.update();
	return this._div;
}

info.update = function(infotext) {
	this._div.innerHTML = infotext ? infotext : "Click a circle";
}

var legend

info.addTo(map);

var svg = d3.select(map.getPanes().overlayPane)
.append("svg")
.attr("height", document.getElementById("map").clientHeight)
.attr("width", document.getElementById("map").clientWidth)
.attr("class", "fixed_svg")
//.style("border", "solid 1px #000")
.append("g")
//.attr("class", "leaflet-zoom-hide");

var rScale = d3.scaleLog()
.domain([1, 465])
.range([3, 14]);

var colors = ["#ffc4a3", "#ff9a76", "#ff9a76", "#bb596b"];
var colorScale = d3.scaleQuantile()
    .domain([0, 3, 4.5, 6, 10])
    .range(colors);

d3.csv("cleanData.csv").then(rawdata => {
	console.log(rawdata);

	// var transform = d3.geoTransform({point: projectPoint}),
	// path = d3.geoPath().projection(transform);

	drawCircle(rawdata);
	drawBarChart(rawdata);
	drawLineChart(rawdata);

	drawItemBarChart("TOTAL_DEATHS", rawdata);
	drawItemBarChart("TOTAL_MISSING", rawdata);
	drawItemBarChart("TOTAL_INJURIES", rawdata);
	drawItemBarChart("TOTAL_DAMAGE_MILLIONS_DOLLARS", rawdata);
	drawItemBarChart("TOTAL_HOUSES_DESTROYED", rawdata);
	drawItemBarChart("TOTAL_HOUSES_DAMAGED", rawdata);

	document.getElementById("sel-tsunami").onclick = function() {
		console.log(this.id, this.checked);

		circles
		.transition()
		.duration(200)
		.attr("r", d => {
			if (this.checked) {
				//console.log(map.getZoom());
				if (d.FLAG_TSUNAMI != "") {
					return map.getZoom();
				} else {
					return 0;
				}
			} else {
				//console.log(map.getZoom());
				return map.getZoom();
			}
			this.checked ? map.getZoom() : 0
		})
	}

	document.getElementById("sel-btn").onclick = function() {
		filter(rawdata);
	};

	document.getElementById("clear-btn").onclick = function() {
		document.getElementById("sel-year-start").value = "";
		document.getElementById("sel-year-end").value = "";
		document.getElementById("sel-eqprimary-start").value = "";
		document.getElementById("sel-eqprimary-end").value = "";

		drawCircle(rawdata);
		drawBarChart(rawdata);
		drawLineChart(rawdata);
		
		drawItemBarChart("TOTAL_DEATHS", rawdata);
		drawItemBarChart("TOTAL_MISSING", rawdata);
		drawItemBarChart("TOTAL_INJURIES", rawdata);
		drawItemBarChart("TOTAL_DAMAGE_MILLIONS_DOLLARS", rawdata);
		drawItemBarChart("TOTAL_HOUSES_DESTROYED", rawdata);
		drawItemBarChart("TOTAL_HOUSES_DAMAGED", rawdata);
	}


	map.on("move", moveview);

	map.on("zoom", function() {
		circles.each(d => {
			let point = map.latLngToLayerPoint([d.LATITUDE, d.LONGITUDE]);
			d.x = point.x;
			d.y = point.y;
			//console.log(d);
		})
		.transition()
		.duration(100)
		.attr("cx", d => d.x)
		.attr("cy", d => d.y)
		.attr("r", d => {
			if (document.getElementById("sel-tsunami").checked) {
				//console.log(map.getZoom());
				if (d.FLAG_TSUNAMI != "") {
					return map.getZoom();
				} else {
					return 0;
				}
			} else {
				//console.log(map.getZoom());
				return map.getZoom();
			}
			this.checked ? map.getZoom() : 0
		});
	});

	/*function projectPoint(x, y) {
		var point = map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}*/
})

function filter(rawdata) {
	let x1 = +document.getElementById("sel-year-start").value;

	if (x1 == "") {
		x1 = 1700;
	}

	let x2 = +document.getElementById("sel-year-end").value;

	if (x2 == "") {
		x2 = 2020;
	}

	let y1 = +document.getElementById("sel-eqprimary-start").value;

	if (y1 == "") {
		y1 = 1.6;
	}

	let y2 = +document.getElementById("sel-eqprimary-end").value;

	if (y2 == "") {
		y2 = 9.5;
	}

	console.log("year:", x1, "-", x2);
	console.log("magnitude:", y1, "-", y2)

	filterdata = rawdata.filter(d => d.YEAR>=x1 && d.YEAR<=x2 && d.EQ_PRIMARY>=y1 && d.EQ_PRIMARY<=y2);
	console.log("select results: ", filterdata);

	drawCircle(filterdata);
	drawBarChart(filterdata);
	drawLineChart(filterdata);
	
	drawItemBarChart("TOTAL_DEATHS", filterdata);
	drawItemBarChart("TOTAL_MISSING", filterdata);
	drawItemBarChart("TOTAL_INJURIES", filterdata);
	drawItemBarChart("TOTAL_DAMAGE_MILLIONS_DOLLARS", filterdata);
	drawItemBarChart("TOTAL_HOUSES_DESTROYED", filterdata);
	drawItemBarChart("TOTAL_HOUSES_DAMAGED", filterdata);


	//drawBar
}

function drawCircle(data) {
	svg.selectAll("circle").remove();

	circles = svg.selectAll("circle")
	.data(data)
	.enter()
	.append("circle")
	.each(d => {
		//console.log(d);
		let point = map.latLngToLayerPoint([d.LATITUDE, d.LONGITUDE]);
		d.x = point.x;
		d.y = point.y;
	})
	.attr("cx", d => d.x)
	.attr("cy", d => d.y)
	.attr("r", map.getZoom()*1.1/*d => rScale(d.number)*/)
	.attr("class", "point")
	.style("fill", d => colorScale(d.EQ_PRIMARY))
	.each(d => {
		let name = d.COUNTRY;
		name = name.toLowerCase();
		name = name.slice(0,1).toUpperCase() + name.slice(1);
		d.COUNTRY = name;
	})
	.on("mouseover", d => {
		d3.select(d3.event.target).style("stroke-width", 1);

		tooltip.html("Country: " + d.COUNTRY + "</br>Magnitude: " + (d.EQ_PRIMARY ? d.EQ_PRIMARY : "N/A"));
        tooltip.style("visibility", "visible");
	})
	.on("mousemove", () => {
		tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX + 10)+"px");
	})
	.on("mouseout", () => {
		d3.select(d3.event.target).style("stroke-width", 0);

		tooltip.style("visibility", "hidden");
	})
	.on("click", d => {
		console.log(d);

		let textstr = "Country: " + d.COUNTRY
			+ "</br>Longitude: " + d.LONGITUDE
			+ "</br>Latitude: " + d.LATITUDE
			+ "</br>Year: " + d.YEAR
			+ "</br>Magnitude: " + d.EQ_PRIMARY
			+ "</br>Deaths: " + (d.TOTAL_DEATHS ? d.TOTAL_DEATHS : "N/A")
			+ "<br/>Injuries:" + (d.TOTAL_INJURIES ? d.TOTAL_INJURIES : "N/A")
			+ "<br/>Missing: " + (d.TOTAL_MISSING ? TOTAL_MISSING : "N/A")
			+ "</br>Detroyed Houses: " + (d.TOTAL_HOUSES_DESTROYED ? d.TOTAL_HOUSES_DESTROYED : "N/A")
			+ "</br>Damaged Houses: " + (d.TOTAL_HOUSES_DAMAGED ? d.TOTAL_HOUSES_DAMAGED : "N/A")

		info.update(textstr);
		//document.getElementById("infobox").innerHTML = textstr;
	});


}

function moveview() {
	var panes = document.getElementsByClassName('leaflet-pane leaflet-map-pane')[0];
    var transform = panes.style.transform.slice(12, -1);
    var offsetX = +transform.split(",")[0].replace("px", ""),
        offsetY = +transform.split(",")[1].replace("px", "")
    //console.log(offsetX, offsetY);
    var fixed_svg = document.getElementsByClassName("fixed_svg")[0];
    fixed_svg.style.left = -offsetX + "px";
    fixed_svg.style.top = -offsetY + "px";
    svg.attr("transform", "translate(" + offsetX + "," + offsetY + ")");
}