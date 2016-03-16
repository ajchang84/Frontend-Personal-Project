$(document).ready(function(){

  // Form submits for Pokemon A & B
  $('#pokemonA').on('submit', function(e){
    e.preventDefault();
    queryPAI('A', $('#pokemonA input').val());
  });

  $('#pokemonB').on('submit', function(e){
    e.preventDefault();
    queryPAI('B', $('#pokemonB input').val());
  });

  // Query the Pokemon API
  function queryPAI(pokemon, val) {
    var stats = `.stats${pokemon}`;
    var sprite = `#sprite${pokemon}`;
    $.ajax({
      method: "GET",
      url: "http://pokeapi.co/api/v1/pokemon/" + val,
      dataType: "json",
      success: function(data){
        $(stats).empty();
        $(stats).append('<p> name: ' + data.name + '</p>');
        $(stats).append('<p> hp: ' + data.hp + '</p>');
        $(stats).append('<p> attack: ' + data.attack + '</p>');
        $(stats).append('<p> defense: ' + data.defense + '</p>');
        $(stats).append('<p> special attack: ' + data.sp_atk + '</p>');
        $(stats).append('<p> special defense: ' + data.sp_def + '</p>');
        $(stats).append('<p> speed: ' + data.speed + '</p>');
        $sprite = data.sprites[0].resource_uri;
        for (var i = 0; i < data.types.length; i++) {
          $(stats).append('<p> types: ' + data.types[i].name + '</p>');
        }
        // Generate Radar Chart
        // radarChart([[2,3,4,5,6,7],[3,2,4,5,6,4]]);
        radarChart([20,40,20,20,200,100]);

        // Query for Pokemon Sprite
        $.ajax({
          method: "GET",
          url: "http://pokeapi.co" + $sprite,
          dataType: "json",
          success: function(data){
            $(sprite).css("background", "url(http://pokeapi.co" + data.image +") 50% 50% no-repeat");
          }
        });
      }
    });
  }
  // Radar Chart

  function radarChart(data) {
    d3.select('#radarChart svg').remove();
    // buildCoordinates(data);
    // buildVertices(data);

    // draw svg container
    var svgContainer = d3.select('#radarChart')
      .append('svg')
      .attr('width', 250)
      .attr('height', 250);

    // draw axis lines
    var axis = svgContainer.selectAll('axis')
      .data(['hp','atk', 'def', 'spd', 'sp.d', 'sp.a'])
      .enter()
      .append('line').classed('axes', true)
      .attr('x1', 100)
      .attr('y1', 100)
      .attr('x2', function(d,i) {return 100 * (1 - Math.sin(i * 2 * Math.PI / 6));})
      .attr('y2', function(d,i) {return 100 * (1 - Math.cos(i * 2 * Math.PI / 6));})
      .attr("transform", "translate(25, 25)")
      .attr("stroke", "grey")
      .attr("stroke-width", "1px");

    // draw level lines
    for (var level = 0; level < 5; level++) {
      var levelFactor = 100 * ((level + 1) / 5);
      var levels = svgContainer.selectAll('levels')
        .data([1,2,3,4,5,6])
        .enter()
        .append("svg:line").classed("levels", true)
        .attr("x1", function(d, i) { return levelFactor * (1 - Math.sin(i * 2 * Math.PI / 6)); })
        .attr("y1", function(d, i) { return levelFactor * (1 - Math.cos(i * 2 * Math.PI / 6)); })
        .attr("x2", function(d, i) { return levelFactor * (1 - Math.sin((i + 1) * 2 * Math.PI / 6)); })
        .attr("y2", function(d, i) { return levelFactor * (1 - Math.cos((i + 1) * 2 * Math.PI / 6)); })
        .attr("transform", "translate(" + (125 - levelFactor) + ", " + (125 - levelFactor) + ")")
        .attr("stroke", "gray")
        .attr("stroke-width", "0.5px");
    }

    // draw axis labels
    var labels = svgContainer.selectAll('labels')
      .data(['Health', 'Sp. Atk', 'Sp. Def', 'Speed', 'Def', 'Atk'])
      .enter()
      .append("svg:text").classed("labels", true)
      .text(function(d) { return d; })
      .attr("text-anchor", "middle")
      .attr("x", function(d, i) { return 100 * (1 - 1.2 * Math.sin(i * 2 * Math.PI / 6)); })
      .attr("y", function(d, i) { return 100 * (1 - 1.1 * Math.cos(i * 2 * Math.PI / 6)); })
      .attr("transform", "translate(25, 25)")
      .attr("font-family", "sans-serif")
      .attr("font-size", 11);

    // draw coordinates
    var vertices = svgContainer.selectAll('vertices')
      .data(data).enter()
      .append("svg:circle").classed('vertices', true)
      .attr("r", 2)
      .attr("cx", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6));})
      .attr("cy", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6));})
      .attr("fill", 'blue');

    // draw polygons  
    var polygons = svgContainer.selectAll('polygons')
      .data(data).enter()
      .append("svg:polygon").classed("polygon-areas", true)
      .attr("points", function(d) { // build verticesString for each group
        var verticesString = "";
        data.forEach(function(d,i){verticesString += 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6)) + "," + 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6)) + " ";
        });
        return verticesString;
      })
      .attr("stroke-width", "2px")
      .attr("stroke", "blue")
      .attr("fill", "blue")
      .attr("fill-opacity", 0.1)
      .attr("stroke-opacity", 1)
      .on('mouseover', function(d) {
        svgContainer.selectAll(".polygon-areas") // fade all other polygons out
        .transition(250)
          .attr("fill-opacity", 0.1)
          .attr("stroke-opacity", 0.1);
        d3.select(this) // focus on active polygon
        .transition(250)
          .attr("fill-opacity", 0.7)
          .attr("stroke-opacity", 1);
      })
      .on('mouseout', function() {
        d3.selectAll(".polygon-areas")
          .transition(250)
          .attr("fill-opacity", 0.1)
          .attr("stroke-opacity", 1);
      });

  }






  

  // var RadarChart = {
  //   draw: function(id, data, options) {

  //     var w = 300;
  //     var h = 300;
  //     var config = {
  //       w: w,
  //       h: h,
  //       levels: 5,
  //       levelScale: 0.85,
  //       labelScale: 1.0,
  //       maxValue: 0,
  //       radians: 2 * Math.PI,
  //       polygonAreaOpacity: 0.3,
  //       polygonStrokeOpacity: 1,
  //       polygonPointSize: 4,
  //       legendBoxSize: 10,
  //       translateX: w / 4,
  //       translateY: h / 4,
  //       paddingX: w,
  //       paddingY: h,
  //       colors: d3.scale.category10(),
  //       showLevels: true,
  //       showLevelsLabels: true,
  //       showAxesLabels: true,
  //       showAxes: true,
  //       showLegend: true,
  //       showVertices: true,
  //       showPolygons: true
  //     };

  //     var vis = {
  //       svg: null,
  //       tooltip: null,
  //       levels: null,
  //       axis: null,
  //       vertices: null,
  //       legend: null,
  //       allAxis: null,
  //       total: null,
  //       radius: null
  //     };

  //     render(data);

  //     function render(data) {
  //       d3.select(id).selectAll("svg").remove();
  //       buildVis(data);
  //     }

  //     // update configuration parameters
  //     function updateConfig() {
  //       // adjust config parameters
  //       config.maxValue = Math.max(config.maxValue, d3.max(data, function(d) {
  //         return d3.max(d.axes, function(o) { return o.value; });
  //       }));
  //       config.w *= config.levelScale;
  //       config.h *= config.levelScale;
  //       config.paddingX = config.w * config.levelScale;
  //       config.paddingY = config.h * config.levelScale;
  //     }

  //     function buildVis(data) {
  //       buildVisComponents();
  //       buildCoordinates();
  //     }

  //     function buildVisComponents() {
  //       vis.svg = d3.select(id)
  //         .append('svg')
  //         .attr('width', 250)
  //         .attr('height', 250);
  //       vis.levels = vis.svg.selectAll('.levels')
  //         .append('svg:g').classed('levels', true);
  //       vis.axes = vis.svg.selectAll('.axes')
  //         .append('svg:g').classed('axes', true);
  //       vis.vertices = vis.svg.selectAll('.vertices')
  //         .append('svg:g').classed('vertices', true);
  //     }




  //   }
  // };







  
});




