/* ------------------------------------------------------------------------------------------*/
// Name: location.js
// Author: PYS team
// Contents: Defines all functions for dealing with the user's location
// Info: Prepares autocomplete for location using Google's Maps API,
// allows the user to set his/her location manually, gets the user's
// location via HTML5 geolocation, uses this retrieved location and saves
// it, handles error with automatic location retrieval, and allows
// for conversion from latitude and longitude into readable location.
/* ------------------------------------------------------------------------------------------*/
// on document load
$(function() {
    // autocomplete location on typing into #enterLoc div
    autocomplete = new google.maps.places.Autocomplete($('#enterLoc')[0]);

    // detect when autocomplete place changed
    google.maps.event.addListener(autocomplete, 'place_changed', setManLoc);

});


// allow user to set location manually
function setManLoc() {
    if (locationSet)
        return;
    selectedLat = autocomplete.getPlace().geometry.location.lat();
    selectedLng = autocomplete.getPlace().geometry.location.lng();
    fullUserObj.lat = selectedLat;
    fullUserObj.lng = selectedLng;
    saveU(fullUserObj);
    locationSet = true;
    $('progress,#allow').hide();
    $('#overlay').slideUp(300);
}

// try to get the user's geolocation using HTML5 geolcation
function getLocation() {
    $('progress,#allow').show();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(usePosition, locError);
    } else {
        $('progress').hide();
        $('#allow').text('Geolocation is not supported by your browser.')
    }
}

// use the user's geolocation (position)
function usePosition(position) {
    // see if this has been overridden by manual location entry
    if (locationSet)
        return;
    $('progress,#allow').hide();
    $('#overlay').slideUp(300);
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var latlng = new google.maps.LatLng(lat, lng);
    // add lat and lng to user obj, to send to backend
    fullUserObj.lat = lat;
    fullUserObj.lng = lng;
    locationSet = true;
    saveU(fullUserObj);
}


// handle error in getting the user's location
function locError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            $('progress').hide();
            $('#allow > div:first-child').html('We want to make this site as fun and interesting as possible. You need to enable location services to continue.<br><br>');
            $('#manualLoc').show();
            break;
        case error.POSITION_UNAVAILABLE:
            $('progress').hide();
            $('#allow > div:first-child').text('Hmm, your location info is unavailable... Try refreshing the page.<br><br>');
            $('#manualLoc').show();
            break;
        case error.TIMEOUT:
            $('progress').hide();
            $('#allow > div:first-child').text('Oops, your request timed out. Try refreshing the page.<br><br>');
            $('#manualLoc').show();
            break;
        case error.UNKNOWN_ERROR:
            $('progress').hide();
            $('#allow > div:first-child').text('Something went wrong. Try refreshing the page.<br><br>');
            $('#manualLoc').show();
            break;
    }
}

/*  
    use google's maps API to reverse geocode.
    That is, get and return city, given latitude and longitude
    in special google maps format, latlng.
    Also, use this location in user interface
*/
function reverseGeo(latlng) {
    var userLoc = 'USA'; // default, in case of error
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'latLng': latlng
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[2]) {
                // gets location in "City, State" format
                userLoc = results[2].address_components[1].long_name + ', ' + results[2].address_components[3].short_name;
            } else {
                console.log('No results found for user\'s city...');
            }
        } else {
            console.log('Geocoder failed because of: ' + status);
        }

        // update html on poll card
        // must do here because we are waiting for function to finish
        $('#qLoc > span').text(userLoc);
    });
}