d3.select("#headersvg")
.append("text")
.attr("y", 30)
.text("Deaths/Missing/Injuries");

d3.select("#headersvg")
.append("text")
.attr("x", 300)
.attr("y", 30)
.style("text-anchor", "middle")
.text("Houses Destroyed/Damaged");

function drawTable(detailData) {
	// filteredData = detailData.filter(d => {
	// 	return (d3.sum([+d.TOTAL_DEATHS,+d.TOTAL_MISSING,+d.TOTAL_INJURIES]) > 0) && (+d.TOTAL_DAMAGE_MILLIONS_DOLLARS > 0)
	// })

	filteredData = detailData.filter(d => {
		return +d.EQ_PRIMARY >= 6
	})
	//console.log(detailData);
	console.log("EQ_PRIMARY>=6: ", filteredData)

	filteredData.sort((a,b) => d3.ascending(+a.YEAR, +b.YEAR))
	//console.log(filteredData);

	let row = d3.select("#detailTableBody")
	.selectAll("tr")
	.data(filteredData)
	.join("tr")
	.attr("class", "row")
	.each(function(d) {
		d.sum0 = +d.TOTAL_DEATHS;
		d.sum1 = d.sum0 + (+d.TOTAL_MISSING);
		d.sum2 = d.sum1 + (+d.TOTAL_INJURIES);

		let rowData = new Array();

		rowData[0] = {
			type: "YEAR",
			value: d.YEAR
		}

		rowData[1] = {
			type: "DAMAGE",
			value: [
				[d.sum0, d.sum1, d.sum2],
				d.TOTAL_DEATHS,
				d.TOTAL_MISSING,
				d.TOTAL_INJURIES,
				d.TOTAL_HOUSES_DESTROYED,
				d.TOTAL_HOUSES_DAMAGED
			]
		}

		rowData[2] = {
			type: "TOTAL_DAMAGE_MILLIONS_DOLLARS",
			value: d.TOTAL_DAMAGE_MILLIONS_DOLLARS
		}

		let tdSelection = d3.select(this).selectAll("td")
		.data(rowData)
		.join("td")
		.attr("class", d => d.type)
		.text(d => {
			if (d.type == "YEAR" || d.type == "TOTAL_DAMAGE_MILLIONS_DOLLARS") {
				return d.value;
			}
		});

		let svgSelection = tdSelection.filter(d => d.type == "DAMAGE")
		.selectAll('svg')
        .data(d => [d])
        .join('svg')
		.attr("width", 400)
		.attr("height", 20)
		//.style("border", "solid 1px #000")
		//.each(d => console.log("|", d));

		
		svgSelection
		.selectAll(".rect1")
		.data(d => [d.value[0], d.value[0], d.value[0]])
		.join("rect")
		.attr("x", (d,i) => {
			if (i == 0) {
				return 0;
			} else {
				return deathScale(d[i-1]);
			}
		})
		.attr("width", (d,i) => {
			if (i == 0) {
				return deathScale(d[0]);
			} else {
				return (deathScale(d[i])-deathScale(d[i-1]))
			}
		})
		.attr("height", 20)
		.style("fill", "orange")
		.style("fill-opacity", (d,i) => 1 - 0.2*i)
		//.each((d,i) => console.log("test", i,d))

		svgSelection.selectAll(".rect2")
		.data(d => [d])
		.join("rect")
		.attr("x", d => {
			//console.log(houseDestroyedScale(d.value[4]))
			return 300-houseDestroyedScale(d.value[4]);
		})
		.attr("width", d => houseDestroyedScale(d.value[4]))
		.attr("height", 20)
		.attr("fill", "#ff7171")
		.style("opacity", 0.6)

		svgSelection.selectAll(".rect3")
		.data(d => [d])
		.join("rect")
		.attr("x", 300)
		.attr("width", d => houseDamagedScale(d.value[5]))
		.attr("height", 20)
		.attr("fill", "#ff7171")
	})
}

function deathScale(data) {
	if (data == 0) {
		return 0;
	} else if (data >= 1) {
		let scale = d3.scaleLog()
		.domain([1, 1050000])
		.range([1, 180]);
		return scale(data);
	} else {
		console.log("nnnnnn????")
	}
}

function houseDestroyedScale(data) {
	if (data == 0) {
		return 0;
	} else if (data >= 1) {
		let scale = d3.scaleLog()
		.domain([1, 5400000])//21000000
		.range([1, 100]);
		return scale(data);
	} else {
		console.log("destroy????")
	}
}

function houseDamagedScale(data) {
	if (data == 0) {
		return 0;
	} else if (data >= 1) {
		let scale = d3.scaleLog()
		.domain([1, 21000000])
		.range([1, 100]);
		return scale(data);
	} else {
		console.log("damage????")
	}
}