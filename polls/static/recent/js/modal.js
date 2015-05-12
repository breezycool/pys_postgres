function modal() {
  var id = '#dialog';
  
    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();

    //Set heigth and width to mask to fill up the whole screen
    $('#mask').css({'width':maskWidth,'height':maskHeight});
    
    //transition effect   
    $('#mask').fadeIn(1000);  
    $('#mask').fadeTo("slow",0.8);  

    //Get the window height and width
    var winH = $(window).height();
    var winW = $(window).width();

    //Set the popup window to center
    $(id).css('top',  winH/2-$(id).height()/2);
    $(id).css('left', winW/2-$(id).width()/2);

    //transition effect
    $(id).fadeIn(2000);   
    
    //close_modal();
  }

  function create_usr()
  {
    var login_info;

    FB.api('/me', function(response) {
      login_info = JSON.stringify(response);
    });

/*
    $.ajax({
      url: 'saveu/',
      type: 'POST',
      data: {
        csrfmiddlewaretoken: csrftoken,
        info: login_info,
      },
      beforeSend: function() {
      },
      success: function(data) {
        console.log(data);
      },
      error: function(e) {
        console.log(e);
      }
    });
*/

}

function show_logout(){
  $('#log-out').show();
}

function hide_logout(){
  $('#log-out').hide();
}

function closeMyModal() {
    //if close button is clicked
  //$('.window .close').click(function (e) {
    //Cancel the link behavior
    //e.preventDefault();
    
    $('#mask').hide();
    $('.window').hide();
  //});  
}