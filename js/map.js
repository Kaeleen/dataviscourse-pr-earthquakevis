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

var colorScale = d3.scaleLinear()
.domain([0, 10])
.range(["yellow", "red"]);


let groupData;

d3.csv("cleanData.csv").then(data => {
	groupData = d3.nest().key(d => d.COUNTRY).entries(data);
	//console.log(groupData);

	for (item of groupData) {
		item.country = item.key;
		item.lng = +item.values[0].LONGITUDE;
		item.lat = +item.values[0].LATITUDE;
		item.number = item.values.length;
		item.detail = item.values;
		item.detail.sort((a,b) => {
			return (+b.EQ_PRIMARY) - (+a.EQ_PRIMARY);
		})
		item.magnitude = +item.detail[0].EQ_PRIMARY;

		delete item.key;
		delete item.values;
		//console.log(item);
	};

	groupData.sort((a,b) => {
		return b.number - a.number;
	})
	console.log(groupData);

	var transform = d3.geoTransform({point: projectPoint}),
	path = d3.geoPath().projection(transform);

	var circles = svg.selectAll("circle")
	.data(groupData)
	.enter()
	.append("circle")
	.each(d => {
		//console.log(d);
		let point = map.latLngToLayerPoint([d.lat, d.lng]);
		d.x = point.x;
		d.y = point.y;
	})
	.attr("cx", d => d.x)
	.attr("cy", d => d.y)
	.attr("r", d => rScale(d.number))
	.attr("class", "point")
	.style("fill", d => colorScale(d.magnitude))
	.on("mouseover", () => d3.select(d3.event.target).style("stroke-width", 1))
	.on("mouseout", () => d3.select(d3.event.target).style("stroke-width", 0))
	.on("click", d => {
		console.log(d);
		document.getElementById("table_wrapper").style.display = "block";
		drawTable(d.detail);
	});

	map.on("zoomend", reset);
	map.on("move", moveview);

})


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

	function reset() {
		//console.log("reset", map.getBounds());
	circles.each(d => {
		let point = map.latLngToLayerPoint([d.lat, d.lng]);
		d.x = point.x;
		d.y = point.y;
		//console.log(d);
	})
	.transition()
	.duration(100)
	.attr("cx", d => d.x)
	.attr("cy", d => d.y)
}

function projectPoint(x, y) {
	var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	this.stream.point(point.x, point.y);
}