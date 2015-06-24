///////////////////////////////////////////////////////////////////////////
/////// State of the State - Onderwijs Main Code - Scatter plots //////////
///////////////////////////////////////////////////////////////////////////

var mobileScreen = ($(window).width() > 400 ? false : true);

///////////////////////////////////////////////////////////////////////////
///////////////////// Initiate global variables ///////////////////////////
///////////////////////////////////////////////////////////////////////////

var scatterMargin = {left: 50, top: 50, right: 20, bottom: 50},
	scatterWidth = Math.min($(".dataresource.scatterNL").width(),800) - scatterMargin.left - scatterMargin.right,
	scatterHeight = scatterWidth*2/3,
	scatterLegendMargin = {left: 0, top: 10, right: 0, bottom: 10},
	scatterLegendWidth = $(".dataresource.scatterLegend").width() - scatterLegendMargin.left - scatterLegendMargin.right,
	scatterLegendHeight = 310;

//Create and SVG for each element
var svgScatterNL = d3.select(".dataresource.scatterNL").append("svg")
			.attr("width", (scatterWidth + scatterMargin.left + scatterMargin.right))
			.attr("height", (scatterHeight + scatterMargin.top + scatterMargin.bottom));

var svgScatterLegend = d3.select(".dataresource.scatterLegend").append("svg")
			.attr("width", (scatterLegendWidth + scatterLegendMargin.left + scatterLegendMargin.right))
			.attr("height", (scatterLegendHeight + scatterLegendMargin.top + scatterLegendMargin.bottom));			

//Create and g element for each SVG			
var scatterNL = svgScatterNL.append("g").attr("class", "chartNL")
		.attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");
		
var scatterLegend = svgScatterLegend.append("g").attr("class", "legendWrapper")
				.attr("transform", "translate(" + (scatterLegendWidth/2 + scatterLegendMargin.left) + "," + (scatterLegendMargin.top) +")");

///////////////////////////////////////////////////////////////////////////
/////////////////// Scatterplot specific functions ////////////////////////
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
///////////////// Create the legends in the middle ////////////////////////
///////////////////////////////////////////////////////////////////////////
function createScatterLegend() {
	
	var legendRectSize = 15, //dimensions of the colored square
		legendSectorHeight = 25,
		legendMaxWidth = 250; //maximum size that the longest element will be - to center content
					
	//Create container for all rectangles and text 
	var sectorLegendWrapper = scatterLegend.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + 0 + "," + 0 +")");
		  
	//Create container per rect/text pair  
	var sectorLegend = sectorLegendWrapper.selectAll('.scatterLegendSquare')  	
			  .data(sectorColor.range())                              
			  .enter().append('g')   
			  .attr('class', 'scatterLegendSquare') 
			  .attr('width', scatterLegendWidth)
			  .attr('height', legendSectorHeight)
			  .attr("transform", function(d,i) { return "translate(" + 0 + "," + (i * legendSectorHeight) + ")"; })
			  .style("cursor", "pointer")
			  .on("mouseover", sectorSelect(0.02))
			  .on("mouseout", sectorSelect(0.7))
			  .on("click", sectorClick);
	 
	//Non visible white rectangle behind square and text for better UX
	sectorLegend.append('rect')                                     
		  .attr('width', legendMaxWidth) 
		  .attr('height', legendSectorHeight) 			  
		  .attr('transform', 'translate(' + (-legendMaxWidth/2) + ',' + 0 + ')') 		  
		  .style('fill', "white");
	//Append small squares to Legend
	sectorLegend.append('rect')                                     
		  .attr('width', legendRectSize) 
		  .attr('height', legendRectSize) 			  
		  .attr('transform', 'translate(' + (-legendMaxWidth/2) + ',' + 0 + ')') 		  
		  .style('fill', function(d) {return d;});                                 
	//Append text to Legend
	sectorLegend.append('text')                                     
		  .attr('transform', 'translate(' + (-legendMaxWidth/2 + legendRectSize + 8) + ',' + (legendRectSize/2) + ')')
		  .attr("class", "legendText")
		  .style("text-anchor", "start")
		  .attr("dy", ".30em")
		  //.attr("fill", "#949494")
		  .style("font-size", "11px")			  
		  .text(function(d,i) { return sectorColor.domain()[i]; });  	
		
};//function createScatterLegend

///////////////////////////////////////////////////////////////////////////
///////////////////// Click functions for legend //////////////////////////
///////////////////////////////////////////////////////////////////////////

//Reset the click event when the user clicks anywhere but the legend
d3.select(".scatterArbeidsmarkt").on("click", resetClick);

//Function to show only the circles for the clicked sector in the legend
function sectorClick(d,i) {
	
	event.stopPropagation();

	//deactivate the mouse over and mouse out events
	d3.selectAll(".scatterLegendSquare")
		.on("mouseover", null)
		.on("mouseout", null);
		
	//Chosen study sector
	var chosen = sectorColor.domain()[i];

	/////////////////// NL ///////////////////	
	//Only show the circles of the chosen sector
	scatterNL.selectAll("circle.NL")
		.style("opacity", 0.7)
		.style("visibility", function(d) {
			if (d.Baan_sector != chosen) return "hidden";
			else return "visible";
		});

	//Make sure the pop-ups are only shown for the clicked on sector
	scatterNL.selectAll(".voronoi.NL")
		.on("mouseover", function(d,i) {
			if(d.Baan_sector != chosen) return null;
			else return showScatterTooltip.call(this, d, i);
		})
		.on("mouseout",  function(d,i) {
			if(d.Baan_sector != chosen) return null;
			else return removeScatterTooltip.call(this, d, i);
		});
	
}//sectorClick

//Show all the cirkels again when clicked outside legend
function resetClick() {	

	//Activate the mouse over and mouse out events of the legend
	d3.selectAll(".scatterLegendSquare")
		.on("mouseover", sectorSelect(0.02))
		.on("mouseout", sectorSelect(0.7));

	/////////////////// NL ///////////////////	
	//Show all circles
	scatterNL.selectAll("circle.NL")
		.style("opacity", 0.7)
		.style("visibility", "visible");

	//Activate all pop-over events
	scatterNL.selectAll(".voronoi.NL")
		.on("mouseover", showScatterTooltip)
		.on("mouseout",  function (d,i) { removeScatterTooltip.call(this, d, i); });

}//resetClick

///////////////////////////////////////////////////////////////////////////
/////////////////// Hover functions of the circles ////////////////////////
///////////////////////////////////////////////////////////////////////////

//Hide the tooltip when the mouse moves away
function removeScatterTooltip (d, i) {

	//Which Beroep is being hovered over
	var element = d3.selectAll(".circle.NL."+d.BeroepClass);
		
	//Fade out the bubble again
	element.style("opacity", 0.7);
	
	//Hide tooltip
	$('.popover').each(function() {
		$(this).remove();
	}); 
  
	//Fade out guide lines, then remove them
	d3.selectAll(".guide")
		.transition().duration(200)
		.style("opacity",  0)
		.remove()
}//function removeScatterTooltip

//Show the tooltip on the hovered over slice
function showScatterTooltip (d, i) {
		
	var cont = '.dataresource.scatterNL',
		chartSVG = scatterNL,
		element = d3.selectAll(".circle.NL."+d.BeroepClass);

	//Define and show the tooltip
	$(element).popover({
		placement: 'auto top',
		container: cont,
		trigger: 'manual',
		html : true,
		content: function() { 
			return "<span style='font-size: 11px; text-align: center;'>" + d.Beroep + "</span>"; }
	});
	$(element).popover('show');

	//Make chosen circle more visible
	element.style("opacity", 1);
	
	//Append lines to bubbles that will be used to show the precise data points
	//vertical line
	chartSVG.append("g")
		.attr("class", "guide")
		.append("line")
			.attr("x1", element.attr("cx"))
			.attr("x2", element.attr("cx"))
			.attr("y1", +element.attr("cy"))
			.attr("y2", (scatterHeight))
			.style("stroke", element.style("fill"))
			.style("opacity",  0)
			.style("pointer-events", "none")
			.transition().duration(400)
			.style("opacity", 0.5);
	//horizontal line
	chartSVG.append("g")
		.attr("class", "guide")
		.append("line")
			.attr("x1", +element.attr("cx"))
			.attr("x2", 0)
			.attr("y1", element.attr("cy"))
			.attr("y2", element.attr("cy"))
			.style("stroke", element.style("fill"))
			.style("opacity",  0)
			.style("pointer-events", "none")
			.transition().duration(400)
			.style("opacity", 0.5);
					
}//function showScatterTooltip
	
///////////////////////////////////////////////////////////////////////////
//////////////////// Hover function for the legend ////////////////////////
///////////////////////////////////////////////////////////////////////////

//Decrease opacity of non selected study sectors when hovering in Legend	
function sectorSelect(opacity) {
	return function(d, i) {
		var chosen = sectorColor.domain()[i];
		
		scatterNL.selectAll("circle.NL")
			.filter(function(d,i) {return d.Baan_sector != chosen; })
			.transition()
			.style("opacity", opacity);
	  };
}//function sectorSelect

//////////////////////////////////////////////////////
/////////////// Draw the Scatter plot ////////////////
//////////////////////////////////////////////////////
						 
function drawScatter(data, wrapper, width, height, margin) {
							 
	//////////////////////////////////////////////////////
	/////////////////// Initialize Axes //////////////////
	//////////////////////////////////////////////////////

	//Set the new x axis range
	var xScale = d3.scale.linear()
		.range([0, width])
		.domain([0,1])
		.nice();
	//Set new x-axis	
	var xAxis = d3.svg.axis()
		.orient("bottom")
		.ticks(5)
		.tickFormat(numFormatPercent)
		.scale(xScale);	

	//Append the x-axis
	wrapper.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + 0 + "," + height + ")")
		.call(xAxis);
			
	//Set the new y axis range
	var yScale = d3.scale.linear()
		.range([height,0])
		.domain([0,0.75])
		.nice();
		
	var yAxis = d3.svg.axis()
		.orient("left")
		.ticks(4)  //Set rough # of ticks
		.tickFormat(numFormatPercent)
		.scale(yScale);	

	//Append the y-axis
	wrapper.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + 0 + "," + 0 + ")")
			.call(yAxis);

	////////////////////////////////////////////////////////////	
	///////////////////////// Trendline ////////////////////////
	////////////////////////////////////////////////////////////
	
	// Add trendline
	wrapper.append("line")
		.attr("class", "trendline")
		.attr("x1", xScale(0.05))
		.attr("y1", yScale(0.10259))
		.attr("x2", xScale(0.95))
		.attr("y2", yScale(0.46655));
		
	////////////////////////////////////////////////////////////	
	/////////////////// Scatterplot Circles ////////////////////
	////////////////////////////////////////////////////////////	
				
	wrapper.selectAll("circle")
			.data(data.sort(function(a,b) { return b.Perc_Werkenden > a.Perc_Werkenden; })) //Sort so the biggest circles are below
			.enter().append("circle")
				.attr("class", function(d,i) { return "circle NL " + d.BeroepClass; })
				.style("opacity", 0.7)
				.style("fill", function(d) {return sectorColor(d.Baan_sector);})
				.attr("cx", function(d) {return xScale(d.Robotiseringskans);})
				.attr("cy", function(d) {return yScale(d.Perc_Werkzoekenden);})
				.attr("r", function(d) {return rScale(d.Perc_Werkenden);})
				.style("pointer-events", "none");
				
	////////////////////////////////////////////////////////////// 
	//////////////////////// Voronoi ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Initiate the voronoi function
	var voronoi = d3.geom.voronoi()
		.x(function(d) { return xScale(d.Robotiseringskans); })
		.y(function(d) { return yScale(d.Perc_Werkzoekenden); })
		.clipExtent([[0, 0], [width, height]]);

	//Initiate the voronoi group element	
	var voronoiGroup = wrapper.append("g")
		.attr("class", "voronoi");
		
	voronoiGroup.selectAll("path")
		.data(voronoi(data))
		.enter().append("path")
		.attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
		.datum(function(d, i) { return d.point; })
		.attr("class", function(d,i) { return "voronoi NL " + d.BeroepClass; })
		//.style("stroke", "red")
		.on("mouseover", showScatterTooltip)
		.on("mouseout",  function (d,i) { removeScatterTooltip.call(this, d, i); });
		
	//////////////////////////////////////////////////////
	///////////////// Initialize Labels //////////////////
	//////////////////////////////////////////////////////

	//Set up X axis label
	wrapper.append("g")
		.append("text")
		.attr("class", "x axis label")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(" + (width/2) + "," + (height + 40) + ")")
		.style("font-size", "10px")
		.text("Kans op Robotisering");

	//Set up y axis label
	wrapper.append("g")
		.append("text")
		.attr("class", "y axis label")
		.attr("text-anchor", "middle")
		.attr("x", 0)
		.attr("y", 0)
		.attr("dy", "0.35em")
		.attr("transform", "translate(" + 0 + "," + (-margin.top*7/8) + ")")
		.style("font-size", "10px")
		.text("% werkzoekenden t.o.v. werkenden")
		.call(wrap, margin.left*2);
		
	//Set up chart title
	/*
	wrapper.append("g")
		.append("text")
		.attr("class","chartTitle")
		.attr("transform", "translate(" + (width/2) + "," + (-margin.top/2) + ")")
		.style("text-anchor", "middle")
		.style("font-size", "14px")
		.text(chartTitle);*/
		
}// function drawScatter

//////////////////////////////////////////////////////
/////////////////// Bubble Legend ////////////////////
//////////////////////////////////////////////////////

function bubbleLegend(wrapperVar, scale, sizes, titleName) {

	var legendSize1 = sizes[0],
		legendSize2 = sizes[1],
		legendCenter = 0,
		legendBottom = 50,
		legendLineLength = 25,
		textPadding = 5;
	
	wrapperVar.append("text")
		.attr("class","legendTitle")
		.attr("transform", "translate(" + legendCenter + "," + -14 + ")")
		.attr("x", 0 + "px")
		.attr("y", 0 + "px")
		.attr("dy", "1em")
		.text(titleName)
		.call(wrap, 100);
		
	wrapperVar.append("circle")
        .attr('r', scale(legendSize1))
        .attr('class',"legendCircle")
        .attr('cx', legendCenter)
        .attr('cy', (legendBottom-scale(legendSize1)));
    wrapperVar.append("circle")
        .attr('r', scale(legendSize2))
        .attr('class',"legendCircle")
        .attr('cx', legendCenter)
        .attr('cy', (legendBottom-scale(legendSize2)));;
		
	wrapperVar.append("line")
        .attr('class',"legendLine")
        .attr('x1', legendCenter)
        .attr('y1', (legendBottom-2*scale(legendSize1)))
		.attr('x2', (legendCenter + legendLineLength))
        .attr('y2', (legendBottom-2*scale(legendSize1)));	
	wrapperVar.append("line")
        .attr('class',"legendLine")
        .attr('x1', legendCenter)
        .attr('y1', (legendBottom-2*scale(legendSize2)))
		.attr('x2', (legendCenter + legendLineLength))
        .attr('y2', (legendBottom-2*scale(legendSize2)));
		
	wrapperVar.append("text")
        .attr('class',"legendText")
        .attr('x', (legendCenter + legendLineLength + textPadding))
        .attr('y', (legendBottom-2*scale(legendSize1)))
		.attr('dy', '0.25em')
		.text(Math.round(legendSize1*100) + "%");	
	wrapperVar.append("text")
        .attr('class',"legendText")
        .attr('x', (legendCenter + legendLineLength + textPadding))
        .attr('y', (legendBottom-2*scale(legendSize2)))
		.attr('dy', '0.25em')
		.text(Math.round(legendSize2*100) + "%");	
		
}//bubbleLegend

//////////////////////////////////////////////////////
//////////// Data for the scatter plot ///////////////
//////////////////////////////////////////////////////

var banen = [
  {
    "Beroep": "Administratieve medewerkers",
    "BeroepClass": "administratieve_medewerkers",
    "Baan_sector": "Administratief personeel",
    "Robotiseringskans": 0.87061,
    "Perc_Werkzoekenden": 0.340792134831461,
    "Perc_Werkenden": 0.0254322046006572
  },
  {
    "Beroep": "Ambachtslieden en drukkerijmedewerkers",
    "BeroepClass": "ambachtslieden_en_drukkerijmedewerkers",
    "Baan_sector": "Ambachtslieden",
    "Robotiseringskans": 0.4492,
    "Perc_Werkzoekenden": 0.248466666666667,
    "Perc_Werkenden": 0.0042863266180883
  },
  {
    "Beroep": "Ander administratief personeel",
    "BeroepClass": "ander_administratief_personeel",
    "Baan_sector": "Administratief personeel",
    "Robotiseringskans": 0.64372,
    "Perc_Werkzoekenden": 0.688787878787879,
    "Perc_Werkenden": 0.0141448778396914
  },
  {
    "Beroep": "Assembleurs",
    "BeroepClass": "assembleurs",
    "Baan_sector": "Overig",
    "Robotiseringskans": 0.80729,
    "Perc_Werkzoekenden": 0.324052631578947,
    "Perc_Werkenden": 0.00271467352478926
  },
  {
    "Beroep": "Assistenten bij de bereiding van levensmiddelen",
    "BeroepClass": "assistenten_bij_de_bereiding_van_levensmiddelen",
    "Baan_sector": "Elementaire beroepen",
    "Robotiseringskans": 0.7998,
    "Perc_Werkzoekenden": 0.321592592592593,
    "Perc_Werkenden": 0.00385769395627947
  },
  {
    "Beroep": "Bedieningspersoneel van stationaire machines en installaties",
    "BeroepClass": "bedieningspersoneel_van_stationaire_machines_en_installaties",
    "Baan_sector": "Overig",
    "Robotiseringskans": 0.71562,
    "Perc_Werkzoekenden": 0.176630769230769,
    "Perc_Werkenden": 0.00928704100585798
  },
  {
    "Beroep": "Bestuurders van voertuigen en bedieningspersoneel van mobiele installaties",
    "BeroepClass": "bestuurders_van_voertuigen_en_bedieningspersoneel_van_mobiele_installaties",
    "Baan_sector": "Overig",
    "Robotiseringskans": 0.60706,
    "Perc_Werkzoekenden": 0.357601769911504,
    "Perc_Werkenden": 0.0322903271895985
  },
  {
    "Beroep": "Boekhoudkundige medewerkers en voorraadbeheerders",
    "BeroepClass": "boekhoudkundige_medewerkers_en_voorraadbeheerders",
    "Baan_sector": "Administratief personeel",
    "Robotiseringskans": 0.84775,
    "Perc_Werkzoekenden": 0.246552727272727,
    "Perc_Werkenden": 0.0392913273324761
  },
  {
    "Beroep": "Bouwarbeiders, m.u.v. elektriciens",
    "BeroepClass": "bouwarbeiders_m_u_v_elektriciens",
    "Baan_sector": "Ambachtslieden",
    "Robotiseringskans": 0.52882,
    "Perc_Werkzoekenden": 0.35720564516129,
    "Perc_Werkenden": 0.0354336333761966
  },
  {
    "Beroep": "Directeuren van grote ondernemingen, beleidvoerende functies, leden van wetgevende lichamen",
    "BeroepClass": "directeuren_van_grote_ondernemingen_beleidvoerende_functies_leden_van_wetgevende_lichamen",
    "Baan_sector": "Leidinggevende functies",
    "Robotiseringskans": 0.07876,
    "Perc_Werkzoekenden": 0.0646263736263736,
    "Perc_Werkenden": 0.0130018574082012
  },
  {
    "Beroep": "Elektriciens en elektronicamonteurs",
    "BeroepClass": "elektriciens_en_elektronicamonteurs",
    "Baan_sector": "Ambachtslieden",
    "Robotiseringskans": 0.42491,
    "Perc_Werkzoekenden": 0.216577464788732,
    "Perc_Werkenden": 0.0101443063294756
  },
  {
    "Beroep": "Huishoudelijke hulpen en schoonmakers",
    "BeroepClass": "huishoudelijke_hulpen_en_schoonmakers",
    "Baan_sector": "Elementaire beroepen",
    "Robotiseringskans": 0.54824,
    "Perc_Werkzoekenden": 0.479563953488372,
    "Perc_Werkenden": 0.0245749392770396
  },
  {
    "Beroep": "Juristen, sociaal-wetenschappers en scheppende en uitvoerende kunstenaars",
    "BeroepClass": "juristen_sociaal_wetenschappers_en_scheppende_en_uitvoerende_kunstenaars",
    "Baan_sector": "Juridisch en culturele (vak)specialisten",
    "Robotiseringskans": 0.13201,
    "Perc_Werkzoekenden": 0.159272401433692,
    "Perc_Werkenden": 0.0398628375482212
  },
  {
    "Beroep": "Klanten bedienend personeel",
    "BeroepClass": "klanten_bedienend_personeel",
    "Baan_sector": "Administratief personeel",
    "Robotiseringskans": 0.46822,
    "Perc_Werkzoekenden": 0.420590277777778,
    "Perc_Werkenden": 0.0205743677668238
  },
  {
    "Beroep": "Leidinggevende functies in het hotel  en restaurantwezen, in de detail- en groothandel en op het gebied van andere diensten",
    "BeroepClass": "leidinggevende_functies_in_het_hotel_en_restaurantwezen_in_de_detail_en_groothandel_en_op_het_gebied_van_andere_diensten",
    "Baan_sector": "Leidinggevende functies",
    "Robotiseringskans": 0.10671,
    "Perc_Werkzoekenden": 0.207107142857143,
    "Perc_Werkenden": 0.0120017145306472
  },
  {
    "Beroep": "Leidinggevende functies op administratief en commercieel gebied",
    "BeroepClass": "leidinggevende_functies_op_administratief_en_commercieel_gebied",
    "Baan_sector": "Leidinggevende functies",
    "Robotiseringskans": 0.13804,
    "Perc_Werkzoekenden": 0.234223076923077,
    "Perc_Werkenden": 0.018574082011716
  },
  {
    "Beroep": "Leidinggevende functies op het gebied van productie en gespecialiseerde diensten",
    "BeroepClass": "leidinggevende_functies_op_het_gebied_van_productie_en_gespecialiseerde_diensten",
    "Baan_sector": "Leidinggevende functies",
    "Robotiseringskans": 0.08334,
    "Perc_Werkzoekenden": 0.119322916666667,
    "Perc_Werkenden": 0.0274324903557651
  },
  {
    "Beroep": "Metaalarbeiders, machinemonteurs e.d.",
    "BeroepClass": "metaalarbeiders_machinemonteurs_e_d",
    "Baan_sector": "Ambachtslieden",
    "Robotiseringskans": 0.61962,
    "Perc_Werkzoekenden": 0.196913513513514,
    "Perc_Werkenden": 0.0264323474782112
  },
  {
    "Beroep": "Onderwijsgevenden",
    "BeroepClass": "onderwijsgevenden",
    "Baan_sector": "Onderwijsgevenden",
    "Robotiseringskans": 0.06365,
    "Perc_Werkzoekenden": 0.0915504087193461,
    "Perc_Werkenden": 0.0524360622946135
  },
  {
    "Beroep": "Ongeschoolde arbeiders in de land- en bosbouw en de visserij",
    "BeroepClass": "ongeschoolde_arbeiders_in_de_land_en_bosbouw_en_de_visserij",
    "Baan_sector": "Elementaire beroepen",
    "Robotiseringskans": 0.82936,
    "Perc_Werkzoekenden": 0.163909090909091,
    "Perc_Werkenden": 0.00314330618659809
  },
  {
    "Beroep": "Specialisten op het gebied van bedrijfsbeheer en administratie",
    "BeroepClass": "specialisten_op_het_gebied_van_bedrijfsbeheer_en_administratie",
    "Baan_sector": "Bedrijfsbeheer (vak)specialisten",
    "Robotiseringskans": 0.22838,
    "Perc_Werkzoekenden": 0.120633196721311,
    "Perc_Werkenden": 0.069724246320903
  },
  {
    "Beroep": "Specialisten op het gebied van de gezondheidszorg",
    "BeroepClass": "specialisten_op_het_gebied_van_de_gezondheidszorg",
    "Baan_sector": "Gezondheidszorg (vak)specialisten",
    "Robotiseringskans": 0.03608,
    "Perc_Werkzoekenden": 0.0454480286738351,
    "Perc_Werkenden": 0.0398628375482212
  },
  {
    "Beroep": "Specialisten op het gebied van informatie- en communicatietechnologie",
    "BeroepClass": "specialisten_op_het_gebied_van_informatie_en_communicatietechnologie",
    "Baan_sector": "IT (vak)specialisten",
    "Robotiseringskans": 0.08693,
    "Perc_Werkzoekenden": 0.0704813278008299,
    "Perc_Werkenden": 0.0344334904986427
  },
  {
    "Beroep": "Technici op het gebied van informatie en communicatie",
    "BeroepClass": "technici_op_het_gebied_van_informatie_en_communicatie",
    "Baan_sector": "IT (vak)specialisten",
    "Robotiseringskans": 0.38481,
    "Perc_Werkzoekenden": 0.203085106382979,
    "Perc_Werkenden": 0.006715245035005
  },
  {
    "Beroep": "Vakspecialisten op het gebied van bedrijfsbeheer en administratie",
    "BeroepClass": "vakspecialisten_op_het_gebied_van_bedrijfsbeheer_en_administratie",
    "Baan_sector": "Bedrijfsbeheer (vak)specialisten",
    "Robotiseringskans": 0.38671,
    "Perc_Werkzoekenden": 0.144696356275304,
    "Perc_Werkenden": 0.0705815116445206
  },
  {
    "Beroep": "Vakspecialisten op het gebied van de gezondheidszorg",
    "BeroepClass": "vakspecialisten_op_het_gebied_van_de_gezondheidszorg",
    "Baan_sector": "Gezondheidszorg (vak)specialisten",
    "Robotiseringskans": 0.2496,
    "Perc_Werkzoekenden": 0.089035,
    "Perc_Werkenden": 0.0285755107872553
  },
  {
    "Beroep": "Vakspecialisten op het gebied van wetenschap en techniek",
    "BeroepClass": "vakspecialisten_op_het_gebied_van_wetenschap_en_techniek",
    "Baan_sector": "Wetenschap en techniek (vak)specialisten",
    "Robotiseringskans": 0.35602,
    "Perc_Werkzoekenden": 0.131574468085106,
    "Perc_Werkenden": 0.02686098014002
  },
  {
    "Beroep": "Vakspecialisten op juridisch, maatschappelijk en cultureel gebied",
    "BeroepClass": "vakspecialisten_op_juridisch_maatschappelijk_en_cultureel_gebied",
    "Baan_sector": "Juridisch en culturele (vak)specialisten",
    "Robotiseringskans": 0.24111,
    "Perc_Werkzoekenden": 0.203688524590164,
    "Perc_Werkenden": 0.0348621231604515
  },
  {
    "Beroep": "Veiligheidswerkers",
    "BeroepClass": "veiligheidswerkers",
    "Baan_sector": "Overig",
    "Robotiseringskans": 0.26725,
    "Perc_Werkzoekenden": 0.199097826086957,
    "Perc_Werkenden": 0.0131447349621374
  },
  {
    "Beroep": "Verkopers",
    "BeroepClass": "verkopers",
    "Baan_sector": "Verkopers en verleners persoonlijke diensten",
    "Robotiseringskans": 0.5252,
    "Perc_Werkzoekenden": 0.256377870563674,
    "Perc_Werkenden": 0.0684383483354765
  },
  {
    "Beroep": "Verleners persoonlijke diensten",
    "BeroepClass": "verleners_persoonlijke_diensten",
    "Baan_sector": "Verkopers en verleners persoonlijke diensten",
    "Robotiseringskans": 0.35062,
    "Perc_Werkzoekenden": 0.228630363036304,
    "Perc_Werkenden": 0.0432918988426918
  },
  {
    "Beroep": "Verzorgend personeel",
    "BeroepClass": "verzorgend_personeel",
    "Baan_sector": "Verzorgend personeel",
    "Robotiseringskans": 0.35653,
    "Perc_Werkzoekenden": 0.249832817337461,
    "Perc_Werkenden": 0.0461494499214173
  },
  {
    "Beroep": "Voedselverwerkende beroepen, houtwerkers, kleermakers en andere ambachtslieden",
    "BeroepClass": "voedselverwerkende_beroepen_houtwerkers_kleermakers_en_andere_ambachtslieden",
    "Baan_sector": "Ambachtslieden",
    "Robotiseringskans": 0.52815,
    "Perc_Werkzoekenden": 0.20409756097561,
    "Perc_Werkenden": 0.0117159594227747
  },
  {
    "Beroep": "Voor de markt producerende geschoolde landbouwers",
    "BeroepClass": "voor_de_markt_producerende_geschoolde_landbouwers",
    "Baan_sector": "Overig",
    "Robotiseringskans": 0.58426,
    "Perc_Werkzoekenden": 0.173822222222222,
    "Perc_Werkenden": 0.0192884697813973
  },
  {
    "Beroep": "Vuilnisophalers en -verwerkers en andere elementaire beroepen",
    "BeroepClass": "vuilnisophalers_en_verwerkers_en_andere_elementaire_beroepen",
    "Baan_sector": "Elementaire beroepen",
    "Robotiseringskans": 0.56913,
    "Perc_Werkzoekenden": 0.141529411764706,
    "Perc_Werkenden": 0.00485783683383341
  },
  {
    "Beroep": "Wetenschappers en ingenieurs",
    "BeroepClass": "wetenschappers_en_ingenieurs",
    "Baan_sector": "Wetenschap en techniek (vak)specialisten",
    "Robotiseringskans": 0.09619,
    "Perc_Werkzoekenden": 0.125357142857143,
    "Perc_Werkenden": 0.0300042863266181
  }
];


///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Draw plots ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var rScale = d3.scale.sqrt()
				.range([0, (mobileScreen ? 12 : 20)])
				.domain([0, 0.1]);

var sectorColor = d3.scale.ordinal()
					.range(["#EFB605", "#E79B01", "#E35B0F", "#DD092D", "#C50046", "#A70A61", "#892E83", "#604BA2", "#2D6AA6", "#089384", "#25AE64", "#7EB852","#C4C4C4"])
					.domain(["Administratief personeel", "Ambachtslieden", "Leidinggevende functies", "Elementaire beroepen", "Juridisch en culturele (vak)specialisten", "Onderwijsgevenden", "Bedrijfsbeheer (vak)specialisten", "Gezondheidszorg (vak)specialisten", "IT (vak)specialisten", "Wetenschap en techniek (vak)specialisten", "Verkopers en verleners persoonlijke diensten", "Verzorgend personeel", "Overig"]);
	
	
// Create scatter plot
drawScatter(data = banen, wrapper = scatterNL, width = scatterWidth, height = scatterHeight, margin = scatterMargin);

///////////////////////////////////////////////////////////////////////////
////////////////////////// Initialize Legend //////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Draw the legend
createScatterLegend();

//Create a wrapper for the circle legend				
var legendCircle = scatterNL.append("g").attr("class", "legendWrapper")
				.attr("transform", "translate(" + 50 + "," + 10 +")");

legendCircle.append("text")
	.attr("class","legendTitle")
	.attr("transform", "translate(" + 0 + "," + -14 + ")")
	.attr("x", 0 + "px")
	.attr("y", 0 + "px")
	.attr("dy", "1em")
	.text("Elke cirkel is een Beroep")
	.call(wrap, 90);
legendCircle.append("circle")
	.attr('r', rScale(0.06))
	.attr('class',"legendCircle")
	.attr('cx', 0)
	.attr('cy', (50-rScale(0.06)))
	
//Create g element for bubble size legend
var bubbleSizeLegend = scatterNL.append("g").attr("class", "legendWrapper")
				.attr("transform", "translate(" + 140 + "," + 10 +")");
//Draw the bubble size legend
bubbleLegend(bubbleSizeLegend, rScale, legendSizes = [0.02, 0.06], legendName = "Relatieve aandeel werkenden");	


