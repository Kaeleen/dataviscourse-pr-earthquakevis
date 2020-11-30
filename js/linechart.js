function drawLineChart(data) {
	svg2.selectAll("g").remove();

	data = d3.nest().key(d => d.YEAR).entries(data);
	data.sort((a,b) => {
		return b.values.length - a.values.length;
	})

	let topdata;
	if (data.length > 10) {
		topdata = data.slice(0,10);
	} else {
		topdata = data;
	}
	console.log("byYear: ", topdata);

	let max = topdata[0].values.length;
	let min = topdata[topdata.length-1].values.length;
	console.log(min, max);

	topdata.sort((a,b) => {
		return (+a.key) - (+b.key);
	})
	console.log(topdata);

	let linearray = topdata.map(d => {
		return { year: d.key, sum: d.values.length }
	})
	console.log(linearray);

	let xScale = d3.scaleLinear()
	.domain([0, 9])
	.range([50, 550]);

	svg2.append("g")
	.attr("class", "horizon")
	.attr("transform", "translate(0,320)")
	.call(d3.axisBottom(xScale));

	svg2.selectAll(".horizon")
	.selectAll("text")
	.style("visibility", "hidden")

	let yScale = d3.scaleLinear()
	.domain([0, max])
	.range([320, 60]);

	svg2.append("g")
	.attr("transform", "translate(50,0)")
	.call(d3.axisLeft(yScale));

	let rScale = d3.scaleLinear()
	.domain([min, max])
	.range([5, 10]);

	let line = d3.line()
	.x((d,i) => xScale(i))
	.y(d => yScale(d.sum));

	let updateline = svg2.selectAll(".line").data([linearray]);
	let enterline = updateline.enter();
	let exitline = updateline.exit();

	enterline.append("path")
	.attr("d", line)
	.attr("class", "line")
	.style("stroke", "lightblue")
	.style("fill", "none");

	updateline
	.transition()
	.duration(400)
	.attr("d", line);

	exitline.remove();

	let updatecircle = svg2.selectAll("circle").data(linearray);
	let entercircle = updatecircle.enter();
	let exitcircle = updatecircle.exit();

	entercircle.append("circle")
	.attr("cx", (d,i) => xScale(i))
	.attr("cy", d => yScale(d.sum))
	.attr("r", d => rScale(d.sum))
	.style("fill", "lightblue")
	.on("mouseover", function(d) {
		d3.select(this).style("stroke", "#333");

		tooltip.html("Year: " + d.year + "</br>Earthquakes: " + d.sum);
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
		.style("opacity", d => (g.year == d.YEAR) ? 1 : 0.1);
	});

	updatecircle.transition().duration(400)
	.attr("cx", (d,i) => xScale(i))
	.attr("cy", d => yScale(d.sum))
	.attr("r", d => rScale(d.sum))

	exitcircle.remove();
}