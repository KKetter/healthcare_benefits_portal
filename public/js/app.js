// below used for jquery proof of life
// $( 'h1' ).text( 'jQuery is Working' );

//Get Started form becomes visible to user
$ ('#finderButton').on('click', function(event){
  event.preventDefault();
  console.log('clicked');
  $('#form').removeClass('hide-form');
  $('#form').addClass('show-form');
});

//update css classes to reflect needed styles
//make form visible for testing purposes-make sure form is rendered to begin with
