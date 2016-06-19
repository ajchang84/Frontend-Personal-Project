/* TODO:
  1) Seperate D3 code from jQuery code
  2) Repeated code such as randomizing pokemon 
     should be in seperate helper function
  3) Adhere to single responsiblity principle
*/

$(document).ready(function(){

  // Initialize Radar Chart
  radarChart();

  // Initialize Bar Chart
  var barA = [0,0,0,0,0,0];
  var barB = [0,0,0,0,0,0];
  barChart();

  // Randomly calls pokemon on page load
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

  // Query the Pokemon API for Stats
  function queryPAI(pokemon, val) {
    var stats = `.stats${pokemon}`;
    var sprite = `#sprite${pokemon}`;

    // clear name and type before AJAX call
    $(`${sprite} .name`).text('');
    $(`${sprite} .type`).text('');

    // placeholder gif while Pokemon gif being called
    $(sprite + " img").attr('src', 'assets/images/loading.gif');

    $.ajax({
      method: "GET",
      url: "http://pokeapi.co/api/v1/pokemon/" + val,
      dataType: "json",
      success: function(data){

        // pulls gifs from http://sprites.pokecheck.org for Pokemon 1-649
        if(data.name) {
          if (data.pkdx_id < 10)
            $(sprite + " img").attr('src', `http://sprites.pokecheck.org/i/00${data.pkdx_id}.gif`);
          else if (data.pkdx_id < 100)
            $(sprite + " img").attr('src', `http://sprites.pokecheck.org/i/0${data.pkdx_id}.gif`);
          else if (data.pkdx_id < 650)
            $(sprite + " img").attr('src', `http://sprites.pokecheck.org/i/${data.pkdx_id}.gif`);
          else {
          // Pokemon 649 - 718 has no gifs, must make seperate ajax call
          $sprite = data.sprites[0].resource_uri;
            $.ajax({
              method: "GET",
              url: "http://pokeapi.co" + $sprite,
              dataType: "json",
              success: function(data){
                $(sprite + " img").attr('src', `http://pokeapi.co${data.image}`);
              }
            });
          }

          // attach name and type to pokemon viewer
          $(`${sprite} .name`).text(data.name);
          var types = "";
          data.types.forEach(function(el){
            types += el.name + " ";
          });
          $(`${sprite} .type`).text(types);

          // data array to be used for radar chart
          dataArray = [data.hp, data.sp_atk, data.sp_def, data.speed, data.defense, data.attack];

          // data array to be used for bar chart, seperated by Pokemon
          if (pokemon === 'A')
          barA = [data.hp, data.attack, data.defense, data.sp_atk, data.sp_def, data.speed];
          else if (pokemon === 'B')
          barB = [data.hp, data.attack, data.defense, data.sp_atk, data.sp_def, data.speed];

          // data for scores
          var total = dataArray.reduce(function(p,c){
            return p += c;
          },0);

          // Generate Polygons of Pokemon's Stats
          drawPolygon(dataArray, pokemon);

          // Generate Bars for Pokemon's Stats
          drawBar(barA, barB);

          // Generate Score
          score(total, pokemon);

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

    // initialize
    var verticesA = svgContainer.selectAll('.verticesA')
      .data([0,0,0,0,0,0]).enter()
      .append("svg:circle").classed('verticesA', true)
      .attr("r", 3)
      .attr("cx", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6));})
      .attr("cy", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6));})
      .attr('fill', 'blue');

    var verticesB = svgContainer.selectAll('.verticesB')
      .data([0,0,0,0,0,0]).enter()
      .append("svg:circle").classed('verticesB', true)
      .attr("r", 3)
      .attr("cx", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6));})
      .attr("cy", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6));})
      .attr('fill', 'red');

    var polygonA = svgContainer.selectAll('.polygonsA')
      .data([0,0,0,0,0,0]).enter()
      .append("svg:polygon").classed('polygonsA', true)
      .classed('polygons', true)
      .attr("points", function(d) {
        var verticesString = "";
        [0,0,0,0,0,0].forEach(function(d,i){verticesString += 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6)) + "," + 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6)) + " ";
        });
        return verticesString;
      })
      .attr('fill', 'blue')
      .attr('stroke', 'blue');

    var polygonB = svgContainer.selectAll('.polygonsB')
      .data([0,0,0,0,0,0]).enter()
      .append("svg:polygon").classed('polygonsB', true)
      .classed('polygons', true)
      .attr("points", function(d) {
        var verticesString = "";
        [0,0,0,0,0,0].forEach(function(d,i){verticesString += 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6)) + "," + 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6)) + " ";
        });
        return verticesString;
      })
      .attr('fill', 'red')
      .attr('stroke', 'red');
;
;
  }


  function drawPolygon(data, pokemon) {

    // radar chart container
    var svgContainer = d3.select('#radarChart svg');

    // draw coordinates
    var vertices = svgContainer.selectAll('.vertices' + pokemon)
      .data(data)
      .transition()
      .duration(1000)
      .attr("r", 3)
      .attr("cx", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.sin(i * 2 * Math.PI / 6));})
      .attr("cy", function(d, i) { return 125 * (1 - (parseFloat(Math.max(d, 0)) / 250) * Math.cos(i * 2 * Math.PI / 6));})
      .attr("fill", pokemon === 'A' ? 'blue' : 'red');

    // draw polygons  
    var polygons = svgContainer.selectAll('.polygons' + pokemon)
      .data(data)
      .transition()
      .duration(1000)
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
      .attr("stroke-opacity", 1);

      d3.selectAll('.polygons').on('mouseover', function(d) {
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

  // draw bars
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

  // Score function
  function score(data, pokemon){
    $({someValue: $('#score'+pokemon).text()}).animate({someValue: data}, {
      duration: 1000,
      easing: 'swing',
      step: function() {
        $('#score'+pokemon).text(Math.ceil(this.someValue));
      }
    });
  }

  // Randomize button
  $('#randomize').on('click', function(e){
    queryPAI('A', Math.floor(Math.random()*718));
    queryPAI('B', Math.floor(Math.random()*718));
  })


});




