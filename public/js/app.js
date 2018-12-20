
// below used for jquery proof of life
// $( 'h1' ).text( 'jQuery is Working' );

// This code depends on jQuery Core and Handlebars.js 

var doctor_uid = '333d4bb6fcf640e18e93b11b00fe09eb'
var resource_url = 'https://api.betterdoctor.com/2016-03-01/doctors/'+ doctor_uid + '?user_key=' + process.env.BETTERDOCTOR_API_KEY;

$.get(resource_url, function (data)


//Get Started form becomes visible to user
$('#finderButton').on('click', function(event){
  event.preventDefault();
  console.log('clicked');
  $('#form').removeClass('hide-form');
  $('#form').addClass('show-form');
});

$ ('#submitButton').on('click', function(event){
  event.preventDefault();
  location.assign('/doctors');
});

