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
	//console.log("byCountry: ", topdata);

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
		d3.select(this)
		.style("stroke", "#333")
		//.style("fill", "orange");

		tooltip.html("Country: " + d.key + "</br>Earthquakes: " + d.values.length);
        tooltip.style("visibility", "visible");
	})
	.on("mousemove", function() {
		tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX + 10)+"px");
	})
	.on("mouseout", function(d) {
		d3.select(this)
		.style("stroke", "none")
		//.style("fill", "lightblue");

		tooltip.style("visibility", "hidden");
	})
	.on("click", function(g) {
		svg1.selectAll("rect")
		.style("fill", "lightblue");

		svg2.selectAll("circle")
		.style("fill", "lightblue");

		d3.select("#itemview").selectAll("rect")
		.style("fill", "lightblue");

		d3.select(this).style("fill", "orange");

		circles
		.transition()
		.duration(400)
		//.style("opacity", d => (g.key == d.COUNTRY) ? 1 : 0.2)
		.style("opacity", d => {
			if (g.key == d.COUNTRY) {
				console.log("hello")
				return 1;
			} else {
				return 0.1;
			}
		});

		let selection = circles.filter(d => d.COUNTRY == g.key);
		let firstcircle = selection._groups[0][0];

		d3.select(firstcircle).each(d => {
			map.panTo([+d.LATITUDE, +d.LONGITUDE]);
		})
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

	svg1.append("text")
	.attr("x", 0)
	.attr("y", 25)
	.style("font-size", 16)
	.style("font-weight", 500)
	.style("font-style", "italic")
	.text("Top 10 Countries with Most Earthquakes")
}