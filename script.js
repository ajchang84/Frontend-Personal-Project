$(document).ready(function(){

  // Initialize Radar Chart
  radarChart();

  // Initialize Bar Chart
  var barA = [0,0,0,0,0,0];
  var barB = [0,0,0,0,0,0];
  barChart();

  queryPAI('A', Math.floor(Math.random()*718));
  queryPAI('B', Math.floor(Math.random()*718));

  // Form submits for Pokemon A & B
  $('#pokemonA').on('input', function(e){
    e.preventDefault();
    queryPAI('A', $('#pokemonA').val().replace(/[^0-9]/g, ''));
  });

  $('#pokemonB').on('input', function(e){
    e.preventDefault();
    queryPAI('B', $('#pokemonB').val().replace(/[^0-9]/g, ''));
  });

  $('input').on('click', function(e){
    $(this).val('');
  });

  // Query the Pokemon API
  function queryPAI(pokemon, val) {
    var stats = `.stats${pokemon}`;
    var sprite = `#sprite${pokemon}`;
    $(stats).empty();
    $(`${sprite} .name`).text('');
    $(sprite + " img").attr('src', 'loading.gif');
    $.ajax({
      method: "GET",
      url: "http://pokeapi.co/api/v1/pokemon/" + val,
      dataType: "json",
      success: function(data){
        if(data.name) {
          if (data.pkdx_id < 10)
            $(sprite + " img").attr('src', `http://sprites.pokecheck.org/i/00${data.pkdx_id}.gif`);
          else if (data.pkdx_id < 100)
            $(sprite + " img").attr('src', `http://sprites.pokecheck.org/i/0${data.pkdx_id}.gif`);
          else if (data.pkdx_id < 650)
            $(sprite + " img").attr('src', `http://sprites.pokecheck.org/i/${data.pkdx_id}.gif`);
          else {
          $sprite = data.sprites[0].resource_uri;
          // Query for Pokemon Sprite
            $.ajax({
              method: "GET",
              url: "http://pokeapi.co" + $sprite,
              dataType: "json",
              success: function(data){
                $(sprite + " img").attr('src', `http://pokeapi.co${data.image}`);
              }
            });
          }
          $(`${sprite} .name`).text(data.name);

          for (var i = 0; i < data.types.length; i++) {
            $(stats).append('<p class="lead">' + data.types[i].name + '</p>');
          }


          dataArray = [data.hp, data.sp_atk, data.sp_def, data.speed, data.defense, data.attack];

          if (pokemon === 'A')
          barA = [data.hp, data.attack, data.defense, data.sp_atk, data.sp_def, data.speed];
          else if (pokemon === 'B')
          barB = [data.hp, data.attack, data.defense, data.sp_atk, data.sp_def, data.speed];

          // Generate Polygon of Pokemon's Stats
          drawPolygon(dataArray, pokemon);

          // Generate Bars for Pokemon's Stats
          drawBar(barA, barB);

        }
      }
    });
  }

  // Radar Chart Function
  function radarChart() {
    d3.select('#radarChart svg').remove();

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
  }


  function drawPolygon(data, pokemon) {

    // radar chart container
    var svgContainer = d3.select('#radarChart svg');
    svgContainer.selectAll('.vertices' + pokemon).remove();
    svgContainer.selectAll('.polygon-areas' + pokemon).remove();

    // draw coordinates
    var vertices = svgContainer.selectAll('vertices')
      .data(data).enter()
      .append("svg:circle").classed('vertices' + pokemon, true)
      .attr("r", 3)
      .attr("cx", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6));})
      .attr("cy", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6));})
      .attr("fill", pokemon === 'A' ? 'blue' : 'red');

    // draw polygons  
    var polygons = svgContainer.selectAll('polygons')
      .data(data).enter()
      .append("svg:polygon").classed("polygon-areas" + pokemon, true).classed('polygons', true)
      .attr("points", function(d) {
        var verticesString = "";
        data.forEach(function(d,i){verticesString += 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6)) + "," + 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6)) + " ";
        });
        return verticesString;
      })
      .attr("stroke-width", "2px")
      .attr("stroke", pokemon === 'A' ? 'blue' : 'red')
      .attr("fill", pokemon === 'A' ? 'blue' : 'red')
      .attr("fill-opacity", 0.1)
      .attr("stroke-opacity", 1)  
      .on('mouseover', function(d) {
        svgContainer.selectAll(".polygons") // fade all other polygons out
        .transition(250)
          .attr("fill-opacity", 0.1)
          .attr("stroke-opacity", 0.1);
        d3.select(this) // focus on active polygon
        .transition(250)
          .attr("fill-opacity", 0.7)
          .attr("stroke-opacity", 1);
      })
      .on('mouseout', function() {
        d3.selectAll(".polygons")
          .transition(250)
          .attr("fill-opacity", 0.1)
          .attr("stroke-opacity", 1);
      });
    }

  // bar chart on initilization
  function barChart(){
    d3.select('#barChart svg').remove();

    var w = 350;
    var h = 250;

    // draw bar chart container
    var barChart = d3.select('#barChart')
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    // bar chart for left
    barChart.selectAll('rect.A')
      .data([0,0,0,0,0,0])
      .enter()
      .append('rect').classed('A', true)
      .attr('x', 0)
      .attr('y', function(d,i) {
        return i * 35 + 20;
      })
      .attr('width', function(d,i) {return d; })
      .attr('height', 20)
      .attr('fill', 'blue');

    barChart.selectAll('text.A')
      .data([0,0,0,0,0,0])
      .enter()
      .append('text').classed('A', true)
      .text('');

    // bar chart for right
    barChart.selectAll('.B')
      .data([0,0,0,0,0,0])
      .enter()
      .append('rect').classed('B', true)
      .attr('x', function(d) {return w - d;})
      .attr('y', function(d,i) {
        return i * 35 + 20;
      })
      .attr('width', function(d,i) {return d; })
      .attr('height', 20)
      .attr('fill', 'red');

    barChart.selectAll('text.B')
      .data([0,0,0,0,0,0])
      .enter()
      .append('text').classed('B', true)
      .text('');

  }


  function drawBar(dataA, dataB){

    var midPoint = [];
    var total = [];

    for (var i = 0; i < 6; i++) {
      total.push(dataA[i] + dataB[i]);
      midPoint.push(350 * (dataA[i]/total[i]));
    }

    d3.selectAll('text.A')
      .data(dataA)
      .transition()
      .duration(1000)
      .ease('elastic')
      .text(function(d) {return d;})
      .attr('x', function(d,i) {return midPoint[i] - 20;})
      .attr('y', function(d,i) {return i * 35 + 35;})
      .attr("font-family", "sans-serif")
      .attr("font-size", "13px")
      .attr("fill", "white")
      .attr("text-anchor", "middle");

    d3.selectAll('text.B')
      .data(dataB)
      .transition()
      .duration(1000)
      .ease('elastic')
      .text(function(d) {return d;})
      .attr('x', function(d,i) {return 350 - (350 - midPoint[i]) + 20;})
      .attr('y', function(d,i) {return i * 35 + 35;})
      .attr("font-family", "sans-serif")
      .attr("font-size", "13px")
      .attr("fill", "white")
      .attr("text-anchor", "middle");

    d3.selectAll('rect.A')
      .data(midPoint)
      .transition()
      .duration(1000)
      .ease('elastic')
      .attr('width', function(d,i) {return d;});

    d3.selectAll('rect.B')
      .data(midPoint)
      .transition()
      .duration(1000)
      .ease('elastic')
      .attr('x', function(d) {return 350 - (350 - d);})
      .attr('width', function(d,i) {return 350 - d;});

    d3.select('#barChart svg').selectAll('text.cat')
      .data(['Health', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'])
      .enter()
      .append('text').classed('cat', true)
      .text(function(d) {return d;})
      .attr('x', 4)
      .attr('y', function(d,i) {return i * 35 + 17;})
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px");
  }

});




