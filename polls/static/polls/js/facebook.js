/* ------------------------------------------------------------------------------------------*/
// Name: facebook.js
// Author: PYS team
// Contents: Implements PolledYouSo's login system using Facebook.
// Info: Allows app to check if user is logged in, and reacts to this
// by creating a user or signing him/her in.
/* ------------------------------------------------------------------------------------------*/
// Deals with change in user's login status, given response from FB.
function statusChangeCallback(response) {
    $('#loginLoader').hide();
    $('#login').css('background', '#7D26CD');
    $('#mainName').show();
    // See if user is connected
    if (response.status === 'connected') {
        $('#login').hide();
        usrConnected();
    }
    // logged into FB, but app not authorized
    else if (response.status === 'not_authorized') {} else {}
}

// Initializes facebook API
window.fbAsyncInit = function() {
    FB.init({
        appId: '410388515807590',
        cookie: true, // enable cookies to allow the server to access 
        // the session
        xfbml: true, // parse social plugins on this page
        version: 'v2.2' // use version 2.2
    });

    // immediately check login status of user
    FB.getLoginStatus(function(response) {
        // statusChangeCallback(response);
        $('#loginLoader').hide();
        $('#login').css('background', '#7D26CD');
        $('#mainName').show();
        if (response.status != 'connected') {
            $('#overlay').show();
            $('#login').show();
            return;
        }
        usrConnected();
    });
};

// log into PolledYouSo through facebook
function facebookLogin() {
    FB.login(function(response) {
        // response from login
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });

    }, {
        // extended permissions
        scope: 'user_about_me,user_birthday,user_location',
        return_scopes: true,
    });
}

// logout of FB when user clicks logout button
$(document).on('click', '#logout', function() {
    if (currentView == 'music')
        clearMusic();
    FB.logout(function(response) {
        locationSet = false;
        $('#overlay,#login').slideDown(500);
    })
});

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.3&appId=410388515807590";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// User has connected to PolledYouSo with FB. Create user/sign user in.
function usrConnected() {
    $('#login').hide();
    $('#data,#dataViews,#minimize').hide();
    FB.api('/me', function(response) {
        // global user obj
        fullUserObj = {
            id: response.id,
            name: response.name,
            gender: response.gender,
            birthday: response.birthday,
            email: response.email
        };
        myAge = bdayToAge(fullUserObj.birthday);
        myGender = fullUserObj.gender;

        FB.api('/me/picture?width=180&height=180', function(response) {
            var proPic = response.data.url.split('https://')[1];

            $('#myPic').attr('src', 'http://' + proPic);
            $('#myName').text(fullUserObj.name.split(' ')[0]);

        });
        getLocation();
    });
}

// Save user (create or update) with details defined in userObj.
function saveU(userObj) {
    loadComplete = true;
    $.ajax({
        url: 'saveu/',
        type: 'POST',
        data: {
            csrfmiddlewaretoken: csrftoken,
            info: JSON.stringify(fullUserObj)
        },
        beforeSend: function() {},
        success: function(data) {
            data = JSON.parse(data);
            userID = data['user_pk'];
            getQuestions(userID, currQType);
            answeredQuestions = [];
        },
        error: function(e) {
            console.log(e);
        }
    });
}