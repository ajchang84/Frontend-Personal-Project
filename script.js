$(document).ready(function(){

  $('form').on('submit', function(e){

    e.preventDefault();
    $.ajax({
      method: "GET",
      url: "http://pokeapi.co/api/v1/pokemon/" + $('input').val(),
      dataType: "json",
      success: function(data){
        $('.data').empty();
        $('.data').append('<p> name: ' + data.name + '</p>');
        $('.data').append('<p> special attack: ' + data.sp_atk + '</p>');
        $('.data').append('<p> special defense: ' + data.sp_def + '</p>');
        $('.data').append('<p> hp: ' + data.hp + '</p>');
        $('.data').append('<p> speed: ' + data.speed + '</p>');
        $('.data').append('<p> attack: ' + data.attack + '</p>');
        $('.data').append('<p> defense: ' + data.defense + '</p>');
        $sprite = data.sprites[0].resource_uri;
        $('#pokemonA img').attr("src", data.sprites[0].resource_uri.image);
        for (var i = 0; i < data.types.length; i++) {
        $('.data').append('<p> types: ' + data.types[i].name + '</p>');
        }
      },
      // error: function ajaxFailure(data){
      //   $('ul').append('<li>' + console.log(data.Error) + '</li>');
      // // },
      // data: {
      //   s: $('#movie').val()
      // }
    });
  });

  // // $('ul').on('click', 'a', function(e){
  // //   e.preventDefault();
  // //   $('img').attr('src', $(this).attr('href'));
  // });

});



