function drawBarChart(data) {
	data = d3.nest().key(d => d.COUNTRY).entries(data);
	data.sort((a,b) => {
		return b.values.length - a.values.length;
	})
	//console.log(data);

	let topdata;
	if (data.length > 10) {
		topdata = data.slice(0,10);
	} else {
		topdata = data;
	}
	console.log("byCountry: ", topdata);

	let max = topdata[0].values.length;
	let min = topdata[topdata.length-1].values.length;

	let widthScale = d3.scaleLinear()
	.domain([min, max])
	.range([10, 400])

	let update = svg1.selectAll("rect").data(topdata);
	let enter = update.enter();
	let exit = update.exit();

	enter.append("rect")
	.attr("class", "countrybar")
	.attr("x", 150)
	.attr("y", (d,i) => 60+i*28)
	.attr("width", d => widthScale(d.values.length))
	.attr("height", 16)
	.style("fill", "lightblue")
	//.style("stroke-width", 0.5)
	.on("mouseover", function(d) {
		d3.select(this).style("stroke", "#333");

		tooltip.html("Country: " + d.key + "</br>Earthquakes: " + d.values.length);
        tooltip.style("visibility", "visible");
	})
	.on("mousemove", function() {
		tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX + 10)+"px");
	})
	.on("mouseout", function(d) {
		d3.select(this).style("stroke", "none");

		tooltip.style("visibility", "hidden");
	})
	.on("click", g => {
		circles
		.transition()
		.duration(400)
		.style("opacity", d => (g.key == d.COUNTRY) ? 1 : 0.2);
	});
	
	update
	.transition()
	.duration(400)
	.attr("width", d => {
		return widthScale(d.values.length)
	});

	exit.remove();

	svg1.selectAll("text").remove();

	svg1.selectAll("text")
	.data(topdata)
	.enter()
	.append("text")
	.attr("x", 140)
	.attr("y", (d,i) => 72+i*28)
	.style("text-anchor", "end")
	.style("font-size", 14)
	.text(d => d.key)
}