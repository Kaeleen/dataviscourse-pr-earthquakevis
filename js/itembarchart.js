function drawItemBarChart(dim, data) {	
	//console.log("drawluna")
	let svg_number;

	switch (dim) 
	{ 
		case "TOTAL_DEATHS":
			svg_number = 0;
			break;
		case "TOTAL_MISSING":
			svg_number = 1;
			break;
		case "TOTAL_INJURIES":
			svg_number = 2;
			break;
		case "TOTAL_DAMAGE_MILLIONS_DOLLARS":
			svg_number = 3;
			break;
		case "TOTAL_HOUSES_DESTROYED":
			svg_number = 4;
			break;
		case "TOTAL_HOUSES_DAMAGED":
			svg_number = 5;
			break;
	}

	let dim_lower_case = dim.toLowerCase();
	dim_lower_case = dim_lower_case.slice(0,1).toUpperCase() + dim_lower_case.slice(1);

	let svg_dom = d3.select("#itemview").selectAll("svg")._groups[0][svg_number];
	let svg = d3.select(svg_dom);
	//console.log(svg);
	
	svg.selectAll("g").remove();

	data.sort((a,b) => {
		return (+b[dim]) - (+a[dim]);
	})

	let topdata;
	if (data.length > 10) {
		topdata = data.slice(0,10);
	} else {
		topdata = data;
	}
	console.log(dim, topdata, data);

	let max = +topdata[0][dim];
	let min = +topdata[topdata.length-1][dim];
	console.log(dim, min, max)

	let heightScale = d3.scaleLinear()
	.domain([min, max])
	.range([5, 120]);

	svg.append("g")
	.attr("transform", "translate(20,60)")
	.call(d3.axisLeft(heightScale).ticks(4));

	let update = svg.selectAll("rect").data(topdata);
	let enter = update.enter();
	let exit = update.exit();

	enter.append("rect")
	.attr("class", "countrybar")
	.attr("x", (d,i) => 30+i*16)
	.attr("y", d => d[dim] ? 180-heightScale(d[dim]) : 180)
	.attr("width", 10)
	.attr("height", d => d[dim] ? heightScale(d[dim]) : 0)
	.style("fill", "lightblue")
	//.style("stroke-width", 0.5)
	.on("mouseover", function(d) {
		d3.select(this).style("stroke", "#333");

		tooltip.html("Country: " + d.COUNTRY + "</br>Year: " + d.YEAR + "</br>" + dim_lower_case + ": " + d[dim]);
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
		.style("opacity", d => (g.I_D == d.I_D) ? 1 : 0);
	});
	
	update
	.transition()
	.duration(400)
	.attr("y", d => d[dim] ? 180-heightScale(d[dim]) : 180)
	.attr("height", d => d[dim] ? heightScale(d[dim]) : 0)

	exit.remove();

	svg.append("text")
	.attr("x", 0)
	.attr("y", 20)
	.style("font-size", 13)
	.style("font-weight", 500)
	.style("font-style", "italic")
	.text(dim_lower_case)

	svg.selectAll("g").selectAll("text")
	.style("visibility", "hidden");
}