function drawLineChart(data) {
	svg2.selectAll("g").remove();
	svg2.selectAll("text").remove();

	data = d3.nest().key(d => d.YEAR).entries(data);

	data.sort((a,b) => {
		return b.values.length - a.values.length;
	})
	//console.log("byNumber", data);
	
	let threshhold;
	if (data.length >= 10) {
		threshhold = data[9].values.length;
	} else {
		threshhold = data[data.length-1].values.length;
	}
	

	data.sort((a,b) => {
		return (+a.key) - (+b.key);
	})
	//console.log("byYear: ", data);

	let minYear = +data[0].key;
	let maxYear = +data[data.length-1].key;

	let xScale = d3.scaleLinear()
	.domain([minYear, maxYear])
	.range([50, 550]);

	let maxNum = d3.max(data, d => d.values.length);
	let minNum = d3.min(data, d => d.values.length);

	let linearray = data.map(d => {
		return { year: d.key, sum: d.values.length };
	});
	//console.log(linearray);

	let circlearray = data.filter(d => d.values.length >= threshhold)
	.map(d => {
		return { year: d.key, sum: d.values.length };
	})
	//console.log(linearray);

	svg2.append("g")
	.attr("class", "horizon")
	.attr("transform", "translate(0,320)")
	.call(d3.axisBottom(xScale).tickFormat(d => d.toString()));

	let yScale = d3.scaleLinear()
	.domain([0, maxNum])
	.range([320, 60]);

	svg2.append("g")
	.attr("transform", "translate(50,0)")
	.call(d3.axisLeft(yScale));

	let line = d3.line()
	.x(d => xScale(d.year))
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

	let updatecircle = svg2.selectAll("circle").data(circlearray);
	let entercircle = updatecircle.enter();
	let exitcircle = updatecircle.exit();

	entercircle.append("circle")
	.attr("cx", d => xScale(d.year))
	.attr("cy", d => yScale(d.sum))
	.attr("r", 4)
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
		//.style("opacity", d => (g.year == d.YEAR) ? 1 : 0.1)
		.style("opacity", d => {
			if (g.year == d.YEAR) {
				return 1;
			} else {
				return 0.1;
			}
		});

		let selection = circles.filter(d => d.YEAR == g.year);
		let firstcircle = selection._groups[0][0];

		d3.select(firstcircle).each(d => {
			map.panTo([+d.LATITUDE, +d.LONGITUDE]);
		})
	});

	updatecircle.transition().duration(400)
	.attr("cx", d => xScale(d.year))
	.attr("cy", d => yScale(d.sum))
	.attr("r", 4)

	exitcircle.remove();

	svg2.append("text")
	.attr("x", 300)
	.attr("y", 25)
	.style("font-size", 16)
	.style("font-weight", 500)
	.style("font-style", "italic")
	.style("text-anchor", "middle")
	.text("Top 10 Years with Most Earthquakes")
}