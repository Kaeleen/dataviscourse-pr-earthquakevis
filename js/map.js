var map = L.map("map").setView([40, 0], 2);

L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
	maxZoom: 18,
	minZoom: 1,
	attributionControl: false,
	id: 'mapbox/light-v9',
	maxBounds: L.latLngBounds(L.latLng(87.12, 281.26), L.latLng(-87.12, -281.26))
}).addTo(map);
//L.geoJSON(geojsonFeature).addTo(map);

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

	// group by country
	let groupData = d3.nest().key(d => d.COUNTRY).entries(rawdata);
	//console.log(groupData);

	// process data
	for (item of groupData) {
		item.country = item.key;
		item.LONGITUDE = +item.values[0].LONGITUDE;
		item.LATITUDE = +item.values[0].LATITUDE;
		item.number = item.values.length;
		item.detail = item.values;
		item.detail.sort((a,b) => {
			return (+b.EQ_PRIMARY) - (+a.EQ_PRIMARY);
		})
		item.EQ_PRIMARY = +item.detail[0].EQ_PRIMARY;

		delete item.key;
		delete item.values;
		//console.log(item);
	};

	// sort
	groupData.sort((a,b) => {
		return b.number - a.number;
	})
	//console.log(groupData);

	// var transform = d3.geoTransform({point: projectPoint}),
	// path = d3.geoPath().projection(transform);

	drawCircle(rawdata);

	document.getElementById("sel-btn").onclick = function() {
		filter(rawdata);
	};

	map.on("move", moveview);

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
		.attr("r", map.getZoom())
	})
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
	.on("mouseover", () => d3.select(d3.event.target).style("stroke-width", 1))
	.on("mouseout", () => d3.select(d3.event.target).style("stroke-width", 0))
	.on("click", d => {
		console.log(d);

		let textstr = "YEAR: "+d.YEAR+"</br>Magnitude: "+d.EQ_PRIMARY+"</br>Deaths: "+d.TOTAL_DEATHS+"<br/>Injuries:"+d.TOTAL_INJURIES
		+"</br>Detroyed houses: "+d.TOTAL_HOUSES_DESTROYED+"</br>Damaged Houses: "+d.TOTAL_HOUSES_DAMAGED;

		document.getElementById("infobox").innerHTML = textstr;
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