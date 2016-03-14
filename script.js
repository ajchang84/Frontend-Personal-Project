$(document).ready(function(){

  $('#pokemonA').on('submit', function(e){
    e.preventDefault();
    queryPAI('A', $('#pokemonA input').val());
  });

  $('#pokemonB').on('submit', function(e){
    e.preventDefault();
    queryPAI('B', $('#pokemonB input').val());
  });

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

});



