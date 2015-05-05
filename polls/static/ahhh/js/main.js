// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart', 'scatter', 'bar']});

$(function() {

	// prevent default actions on submission of any form
	$('form').submit(function(e) {
		e.preventDefault();
	});

	alreadyAnswered = false; // did the user already answer the curr question?
	currQType = 'near'; // are we looking for near or far questions?
	userID = 1;

/*
	JSONqs = '{"17": {"question": "does our girl Amy like this app?", "answers": [[51, "100%"], [53, "I BE SAYIN HOLLA YEEESSSS"], [54, "it is so breezy, what a great job they have done"], [52, "wow. wow. wow."]]}, "17": {"question": "which of these answers takes your fancy?", "answers": [[59, "this answer"], [57, "this answer"], [58, "this answer"], [56, "this answer"], [55, "this answer"]]}, "18": {"question": "how many numbers are there?", "answers": [[60, "1"], [61, "2"], [62, "3"], [63, "more than 3"]]}, "19": {"question": "how many kids did you kill today?", "answers": [[64, "4"], [65, "less than 4"]]}, "15": {"question": "will you get down with me?", "answers": [[47, "bae, you know it"], [48, "heyellllllll yaaaaaaa"], [49, "mmmmkaeeee"], [50, "try again"]]}}';
	currentQuestions = JSON.parse(JSONqs);
	currentQuestions = formatJSON(currentQuestions);
	currentQuestions = loadQuestion(currentQuestions);
*/


	getQuestions(userID, currQType);

	answeredQuestions = []; // will hold questions user answered

	//getLocation();





});

// prevent submission of form/default action on enter
$(window).keydown(function(event){
	if(event.keyCode == 13) {
		event.preventDefault();
		return false;
	}
});

// AJAX SETUP FOR DJANGO SERVER
function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
           // Does this cookie string begin with the name we want?
           if (cookie.substring(0, name.length + 1) == (name + '=')) {
           	cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
           	break;
           }
       }
   }
   return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
   // these HTTP methods do not require CSRF protection
   return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
	beforeSend: function(xhr, settings) {
		if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
			xhr.setRequestHeader("X-CSRFToken", csrftoken);
		}
	}
});

/* GOOGLE MAPS BEGIN */
var map;

function initialize() {
	var mapOptions = {
		zoom: 10,
		center: new google.maps.LatLng(40.3679, -74.6543),
		disableDefaultUI: true
	};
	map = new google.maps.Map(document.getElementById('map'),
		mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);
/* GOOGLE MAPS END */

// click on a question's answer
$(document).on('click','.liAnswer', function() {
	alreadyAnswered = true;

	$('#navLeft').hide(); // can't go back after answer a new question

	selectedAnswer = $(this).data('answerId');

	currQAns = [];
	currQAns[0] = prevqID;
	currQAns[1] = selectedAnswer;

	answeredQuestions.push(currQAns);
	console.log('answered Questions is ');
	console.log(answeredQuestions);

	// update minimized view of question
	$('#questionMin').text(currQuestion);
	$('#answersMin').html(''); // reset min answers
	for (var i = 0; i < currAnswers.length; i++)
		$('#answersMin').append('<span data-question-id="' + prevqID + '" data-answer-id="' + currAnswers[i][0] +'">' + currAnswers[i][1] +'</span>')

	$('#card').hide('drop',500);
	// highlight selected answer in minimized view
	$('#answersMin > span').each(function() {
		currAnsID = $(this).data('answerId');
		if (currAnsID == selectedAnswer) {
			$(this).css('box-shadow','0px 3px 7px #333, 0px -3px 7px #333');
		}
	});
	$('#minimize').show('drop', 500);
	$('#navRight').show();
});

// change type of questions we are looking for (near or far?)
$(document).on('click', '#locToggle > div', function() {

	// don't do anything unless we click a new toggle
	if (!$(this).hasClass('selected')) {
		var htmlID = $(this).attr('id');
		if (htmlID == 'near')
			currQType = 'near';
		else
			currQType = 'far';

		getQuestions(userID, currQType);
	}

	$('#locToggle > div').removeClass('selected');
	$(this).addClass('selected');
});

var currentView = 'freqData'; // tracks current data display for toggling on and off when new data is selected

// click on a data view
$(document).on('click', '#dataViews > span', function() {
	// load new data view
	if (!$(this).hasClass('selected')) {
		htmlID = $(this).attr('id');
        switch(htmlID) {
            case 'freqView':
                $('#' + currentView).fadeOut(250);
                $('#freqData').fadeIn(250);
                buildPieChart(sampleJSON);
                currentView = 'freqData';
                break;
            case 'genderView':
                $('#' + currentView).fadeOut(250);
                $('#genderData').fadeIn(250);
                buildGenderChart(sampleJSON);
                currentView = 'genderData';
                break;
            case 'ageView':
                $('#' + currentView).fadeOut(250);
                $('#ageData').fadeIn(250);
                buildAgeChart(sampleJSON);
                currentView = 'ageData';
                break;
            case 'mapView':
                $('#' + currentView).fadeOut(250);
                $('#map').show();
                currentView = 'map';
                break;
            case 'musicView':
                $('#' + currentView).fadeOut(250);
                $('#music').fadeIn(250);
                buildMusicalCircles(sampleJSON);
                currentView = 'music';
                break;       
        }
	}

	$('#dataViews > span').removeClass('selected');
	$(this).addClass('selected');
});

// detect arrow key presses
$(document).on('keydown', function(e) {
	switch(e.keyCode) {
		case 37: // left arrow
		if ($('#navLeft').css('display') != 'none')
			$('#navLeft').trigger('click');
		break;

		case 38: // up arrow
		break;

		case 39: // right arrow
		if ($('#navRight').css('display') != 'none')
			$('#navRight').trigger('click');
		break;

		case 40: // down arrow
		break;

		default:
		return;
	}
});

// click on right arrow button
$(document).on('click', '#navRight', function() {
	$('#navRight').hide();
	$('#navLeft').show(); // just in case you want to go back

	// only load a new question if the curr question has already been answered
	if (alreadyAnswered)
	{
		currentQuestions = loadQuestion(currentQuestions);
		if (currentQuestions == 'empty') {
			//alert('no more qs left from first request!!!');
			console.log('sending more answers and getting questions');
			saveAnswers(userID, answeredQuestions);
		}
	}

	$('#minimize').hide('drop', 500);
	$('#card').show('drop', 500);
});

// click on left arrow button
$(document).on('click', '#navLeft', function() {
	$('#navLeft').hide();
	$('#navRight').show();
	$('#card').hide('drop', 500);
	$('#minimize').show('drop', 500);
});


// try to get the user's geolocation
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(usePosition, locError);
	}
	else {
		$('progress').hide();
		$('#allow').text('Geolocation is not supported by your browser.')
	}
}

// use the user's geolocation
function usePosition(position) {
	$('progress').hide();
	$('#overlay').slideUp(300);
	$('#allow').hide();
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	var latlng = new google.maps.LatLng(lat, lng);
	reverseGeo(latlng);
}







// handle error in getting the user's location
function locError(error) {
	switch(error.code)
	{
		case error.PERMISSION_DENIED:
		$('progress').hide();
		$('#allow').text('We want to make this site as fun and interesting as possible. You need to enable location services to continue.');
		break;
		case error.POSITION_UNAVAILABLE:
		$('progress').hide();
		$('#allow').text('Hmm, your location info is unavailable...');
		break;
		case error.TIMEOUT:
		$('progress').hide();
		$('#allow').text('Oops, your request timed out. Please refresh the page and try again.');
		break;
		case error.UNKNOWN_ERROR:
		$('progress').hide();
		$('#allow').text('Something went wrong. Please refresh the page and try again.');
		break;
	}
}

// use google's maps API to reverse geocode
// that is, get and return city, given latitude and longitude
// Also, use this location in user interface
function reverseGeo(latlng) {
	var userLoc = 'USA'; // default, in case of error
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[2]) {
				userLoc = results[2].formatted_address;
			}
			else {
				console.log('No results found for user\'s city...');
			}
		}
		else {
			console.log('Geocoder failed because of: ' + status);
		}

		$('#location > span').text(userLoc);
	});
}

// put every json object into array
function formatJSON(currentQuestions) {
	var JSONarray = [];
	qIDArray = [];

	for (var key in currentQuestions)
		if (currentQuestions.hasOwnProperty(key)) {
			qIDArray.push(key);
			JSONarray.push(currentQuestions[key]);
		}
		console.log('qid array is initailly like this');
		console.log(qIDArray);
		currentQuestions = JSONarray;

		return currentQuestions;
	}

// display a question from the JSON questions
function loadQuestion(currentQuestions) {
	alreadyAnswered = false;
	$('#someQ').html('');
	$('#loader').hide();
	if (currentQuestions.length <= 0)
		return 'empty';
	currQobj = currentQuestions[0];
	currQuestion = currQobj['question'];
	currAnswers = currQobj['answers'];
	
	// update question on card
	$('#someQ').append('<li id="liQuestion"><span>' + currQuestion +'</span></li>');
	for (var i = 0; i < currAnswers.length; i++)
		$('#someQ').append('<li class="liAnswer" data-question-id="' + qIDArray[0] +'" data-answer-id="' + currAnswers[i][0] + '"><span>' + currAnswers[i][1] + '</span></li>');

	var numQs = currentQuestions.length;
	var numIds = qIDArray.length;
	console.log('splicing qid array...');
	prevqID = qIDArray[0];
	qIDArray = qIDArray.splice(1, numIds);
	currentQuestions = currentQuestions.splice(1, numQs);
	return currentQuestions;
}

// Call the backend to retrieve 30 questions from database.
// Store these locally in JSON
function getData(questionID) {

	// prepare UI to get new question
	$('#loader').show();
	$('#someQ').html('');

	$.ajax({
		url: 'getq/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			question_pk: u,
			type: questionType
		},
		beforeSend: function() {
		},
		success: function(data) {
			$('#loader').hide();
			JSONqs = data;
			currentQuestions = JSON.parse(JSONqs);
			currentQuestions = formatJSON(currentQuestions);
			currentQuestions = loadQuestion(currentQuestions);
		},
		error: function(e) {
			console.log(e);
		}
	});
}

// Call the backend to retrieve 30 questions from database.
// Store these locally in JSON
function getQuestions(userID, questionType) {

	// prepare UI to get new question
	$('#loader').show();
	$('#someQ').html('');

	$.ajax({
		url: 'getq/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			user_pk: userID,
			type: questionType
		},
		beforeSend: function() {
		},
		success: function(data) {
			$('#loader').hide();
			JSONqs = data;
			currentQuestions = JSON.parse(JSONqs);
			currentQuestions = formatJSON(currentQuestions);
			currentQuestions = loadQuestion(currentQuestions);
		},
		error: function(e) {
			console.log(e);
		}
	});
}

// Send <= 30 answers from the user to the database
// call getQuestions() to get another set of questions
function saveAnswers(userID, answeredQuestions) {
	$.ajax({
		url: 'savea/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			user_pk: userID,
			answer_pks: JSON.stringify(answeredQuestions)
		},
		beforeSend: function() {
		},
		success: function(data) {
			console.log(data);
			answeredQuestions = [];
			getQuestions(userID, currQType); // get more questions
		},
		error: function(e) {
			console.log(e);
		}
	});
}

// save new question to backend
function saveNewQ(submittedQ, submittedAns) {
	$.ajax({
		url: 'saveq/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			user_pk: userID,
			question_text: submittedQ,
			answers: JSON.stringify(submittedAns)
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
}


