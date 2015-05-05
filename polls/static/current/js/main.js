$(function() {
    // prevent default actions on submission of any form
    $('form').submit(function(e) {
    	e.preventDefault();
    });

    alreadyAnswered = false; // did the user already answer the curr question?
    currQType = 'near'; // are we looking for near or far questions?

    var userID;
    var answeredQuestions;

    // is the user currently on the profile or polls page
    currentPage = 'polls';

    noWorld = true;

    loadComplete = false;


    // for testing locally
    /*
    	JSONqs = '{"17": {"question": "does our girl Amy like this app?", "answers": [[51, "100%"], [53, "I BE SAYIN HOLLA YEEESSSS"], [54, "it is so breezy, what a great job they have done"], [52, "wow. wow. wow."]]}, "17": {"question": "which of these answers takes your fancy?", "answers": [[59, "this answer"], [57, "this answer"], [58, "this answer"], [56, "this answer"], [55, "this answer"]]}, "18": {"question": "how many numbers are there?", "answers": [[60, "1"], [61, "2"], [62, "3"], [63, "more than 3"]]}, "19": {"question": "how many kids did you kill today?", "answers": [[64, "4"], [65, "less than 4"]]}, "15": {"question": "will you get down with me?", "answers": [[47, "bae, you know it"], [48, "heyellllllll yaaaaaaa"], [49, "mmmmkaeeee"], [50, "try again"]]}}';
    	currentQuestions = JSON.parse(JSONqs);
    	currentQuestions = formatJSON(currentQuestions);
    	currentQuestions = loadQuestion(currentQuestions);
    	*/



    //getQuestions(userID, currQType);

    //answeredQuestions = []; // will hold questions user answered

    // Load all sound assets with PreloadJS
    sounds = new createjs.LoadQueue();
    sounds.installPlugin(createjs.Sound);
    sounds.loadManifest([{id:"C3", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+C3.mp3"},
    	{id:"D3", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+D3.mp3"},
    	{id:"E3", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+E3.mp3"},
    	{id:"F3", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+F3.mp3"},
    	{id:"G3", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+G3.mp3"},
    	{id:"A3", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+A3.mp3"},
    	{id:"B3", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+B3.mp3"},
    	{id:"C4", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+C4.mp3"},
    	{id:"D4", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+D4.mp3"},
    	{id:"E4", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+E4.mp3"},
    	{id:"F4", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+F4.mp3"},
    	{id:"G4", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+G4.mp3"},
    	{id:"A4", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+A4.mp3"},
    	{id:"B4", src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+B4.mp3"}]);

soundIDs = ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4"];



});
var currentView = 'freqData'; // tracks current data display for toggling on and off when new data is selected

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {
	'packages': ['corechart', 'bar']
});

// prevent submission of form/default action on enter
$(window).keydown(function(event) {
	if (event.keyCode == 13) {
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

/* GOOGLE MAPS BEGIN
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
GOOGLE MAPS END */


$(document).on('click', '#profile', function() {
	// switch to profile view
	if (currentPage == 'polls') {
		$('#navRight').trigger('click');
		currentPage = 'profile';
		$(this).text('polls');
		$('#card,#minimize,#data,#navLeft,#navRight,#near,#far').hide();
		$('#freqData,#genderData,#ageData,#balls,#music').html('');
		$('#profileHeader, #myQs, #piePreview').show();
		getMyQs();
	}
	// switch to polls view
	else {
		currentPage = 'polls';
		$(this).text('profile');
		$('#myQs,#piePreview,#minimize,#data,#navLeft,#navRight,#profileHeader').hide();
		$('#card,#near,#far').show();
	}
});



$(document).on('click', '#myQs > ul > li', function() {
    // sampleJSON for curr q already loaded from mouseover
    $('#questionMin').text(sampleJSON.question);
    $('#answersMin').html(''); // reset min answers
    console.log('answers to be loaded are:')
    for (var i = 0; i < sampleJSON.answers.length; i++) {
    	$('#answersMin').append('<div><div data-question-id="' + prevqID + '">' + sampleJSON.answers[i].answer + '</div></div>')
    }




    $('#myQs').hide();
    $('#piePreview').hide();
    $('#minimize').show();
    $('#navLeft').show();
    $('#data').show(500);
    $('#dataViews > span').each(function() {
    	if ($(this).hasClass('selected')) {
    		$(this).removeClass('selected');
    	}
    });

    
    window.setTimeout(function() {
    	$('#freqView').trigger('click');
    },500);



});



// click on a question's answer
$(document).on('click', '.liAnswer', function() {
	alreadyAnswered = true;
	window.setTimeout(function() {
		$('#freqView').trigger('click');

	},600)

    $('#navLeft').hide(); // can't go back after answer a new question

    selectedAnswer = $(this).data('answerId');

    currQAns = [];
    currQAns[0] = prevqID;
    currQAns[1] = selectedAnswer;
    currQAns[2] = Date.now(); //also keep track of time answered

    answeredQuestions.push(currQAns);
    console.log('answered Questions is ');
    console.log(answeredQuestions);

    console.log('loading data...');
    sampleJSON = getData(currQAns[1]);
    console.log('data loaded.');

    // update minimized view of question
    $('#questionMin').text(currQuestion);
    $('#answersMin').html(''); // reset min answers
    for (var i = 0; i < currAnswers.length; i++)
    	$('#answersMin').append('<div><div data-question-id="' + prevqID + '" data-answer-id="' + currAnswers[i][0] + '">' + currAnswers[i][1] + '</div></div>')

    $('#card').slideUp(500);
    // highlight selected answer in minimized view
    $('#answersMin > div').each(function() {
    	currAnsID = $(this).children().data('answerId');
    	if (currAnsID == selectedAnswer) {
    		$(this).css('box-shadow', '0 4px 2px -2px #333');
    	}
    });
    $('#minimize').show();
    $('#data').slideDown(500);
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

        saveAnswers(userID, answeredQuestions); // get questions called within this
    }

    $('#locToggle > div').removeClass('selected');
    $(this).addClass('selected');

    $('#minimize,#data,#navLeft,#navRight').hide();
    $('#card').slideDown(500);
});

// click on a data view
$(document).on('click', '#dataViews > span', function() {

    // load new data view
    if (!$(this).hasClass('selected')) {
    	htmlID = $(this).attr('id');
    	switch(htmlID) {
    		case 'freqView':
    		$('#' + currentView).fadeOut(250);
    		$('#freqData').fadeIn(250);
    		buildPieChart(sampleJSON, 'freqData');
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
    		case 'ballPit':
    		$('#' + currentView).fadeOut(250);
    		$('#balls').fadeIn(250);

    		if (noWorld) {
		// initiate physics world
		window.PIXI = globalPIXI;
		globalPHYSICS(worldConfig, [
			initWorld,
			addInteraction,
			startWorld
			]);
		noWorld = false;
	}
	addBodies(globalWorld, globalPhysics, sampleJSON);
	currentView = 'balls';
	break;
	case 'musicView':
	$('#' + currentView).fadeOut(250);
	$('#music').fadeIn(250);
	buildMusicalCircles(sampleJSON);
	currentView = 'music';
	break;       
}

if (htmlID != 'ballPit' && !noWorld)
	clearWorld();

if (htmlID != 'musicView') {
	createjs.Sound.stop();
           // clear all timeouts
           if (activeTimeouts != null) {
           	var length = activeTimeouts.length;
           	for (var i = 0; i < length; i++)
           		clearInterval(activeTimeouts[i]);    
           	activeTimeouts = [];
           }
           
           // clear all intervals
           if (activeIntervals != null) {
           	var length = activeIntervals.length;
           	for (var i = 0; i < length; i++)
           		clearInterval(activeIntervals[i]);    
           	activeIntervals = [];
           }
       }
   }

   $('#dataViews > span').removeClass('selected');
   $(this).addClass('selected');
});


// detect arrow key presses
$(document).on('keydown', function(e) {
	switch (e.keyCode) {
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
    if (alreadyAnswered) {
    	currentQuestions = loadQuestion(currentQuestions);
    	if (currentQuestions == 'empty') {
            //alert('no more qs left from first request!!!');
            console.log('sending more answers and getting questions');
            saveAnswers(userID, answeredQuestions);
        }
    }
    $('#minimize').hide();
    $('#data').slideUp(500);

    $('#card').slideDown(500);
});

// click on left arrow button
$(document).on('click', '#navLeft', function() {
	if (currentPage == 'polls') {
		$('#navLeft').hide();
		$('#navRight').show();
		$('#card').slideUp(500);
		$('#minimize').show();
		$('#data').slideDown(500);
	} else {
		$('#freqData,#genderData,#ageData,#balls,#music').html('');
		$('#myQs').slideDown(500);
		$('#piePreview').slideDown(500);
		$('#minimize').hide();
		$('#navLeft').hide();
		$('#data').slideUp(500);
	}
});

// flag the question
$(document).on('click', '#flag', function() {
	$('#overlay').show();
	$('#flagModal').slideDown(500);
});
$(document).on('click', '#flagModal > div', function() {
	closeModal();
	window.setTimeout(function() {
		$('#card').slideUp(250);
		window.setTimeout(function() {
			currentQuestions = loadQuestion(currentQuestions);
			if (currentQuestions == 'empty') {
                //alert('no more qs left from first request!!!');
                console.log('sending more answers and getting questions');
                saveAnswers(userID, answeredQuestions);
            }

            $('#card').slideDown();
        }, 250)

	}, 300);
	flagQuestion(prevqID, userID);
});


// try to get the user's geolocation
function getLocation() {
	$('progress').show();
	$('#allow').show();
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(usePosition, locError);
	} else {
		$('progress').hide();
		$('#allow').text('Geolocation is not supported by your browser.')
	}
}

// use the user's geolocation
function usePosition(position) {
	$('progress').hide();
	$('#overlay').slideUp(300);
	window.setTimeout(function() {
		loadComplete = true;
	},300)
	$('#allow').hide();
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	var latlng = new google.maps.LatLng(lat, lng);
    // add lat and lng to user obj, to send to backend
    fullUserObj.lat = lat;
    fullUserObj.lng = lng;
    saveU(fullUserObj);
    // fill in user details in navbar
    age = bdayToAge(fullUserObj.birthday);
    $('#age').html(age);
    if (fullUserObj.gender == 'male')
    	$('.fa-mars').show();
    else
    	$('.fa-venus').show();
    reverseGeo(latlng);
}


// handle error in getting the user's location
function locError(error) {
	switch (error.code) {
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
    geocoder.geocode({
    	'latLng': latlng
    }, function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
    		if (results[2]) {
    			userLoc = results[2].formatted_address;
    		} else {
    			console.log('No results found for user\'s city...');
    		}
    	} else {
    		console.log('Geocoder failed because of: ' + status);
    	}

    	$('.fa-map-marker').show();
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
	console.log('in load question');
	console.log(currentQuestions)
	alreadyAnswered = false;
	$('#someQ').html('');
	$('#loader').hide();
	if (currentQuestions.length <= 0)
		return 'empty';
	currQobj = currentQuestions[0];
	currQuestion = currQobj['question'];
	currAnswers = currQobj['answers'];

    // update question on card
    $('#someQ').append('<li id="liQuestion"><span>' + currQuestion + '</span></li>');
    for (var i = 0; i < currAnswers.length; i++)
    	$('#someQ').append('<li class="liAnswer" data-question-id="' + qIDArray[0] + '" data-answer-id="' + currAnswers[i][0] + '"><span>' + currAnswers[i][1] + '</span></li>');

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
    	beforeSend: function() {},
    	success: function(data) {
    		$('#loader').hide();
    		JSONqs = data;
    		currentQuestions = JSON.parse(JSONqs);
    		currentQuestions = formatJSON(currentQuestions);
    		currentQuestions = loadQuestion(currentQuestions);
    		if (currentQuestions.length <= 0) {

    			if (currQType == 'near')
    				var otherQType = 'far';
    			else
    				var otherQType = 'near';

    			$('#card').hide();
    			$('#allDone').html('<div><span style="color:#7D26CD">Congratulations!</span> You\'ve clicked through all of the ' + currQType + ' polls.</div>Change your location query to ' + otherQType + ' (above), ask your own question (below), or explore some other parts of the site!');
    			$('#allDone').show();
    		}
    	},
    	error: function(e) {
    		console.log(e);
    	}
    });
}

function flagQuestion(questionID, userID) {
	$.ajax({
		url: 'flagq/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			user_pk: userID,
			question_pk: questionID
		},
		beforeSend: function() {},
		success: function(data) {
			console.log(data);
		},
		error: function(e) {
			console.log(e);
		}
	});
}

// Get data for display once user has answered question
function getData(answerID) {
	$.ajax({
		url: 'getdata/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			answer_pk: answerID
		},
		beforeSend: function() {},
		success: function(data) {
			sampleJSON = data;
			window.setTimeout(function() {
				$('#freqView').trigger('click');

			},600)
			buildPieChart(sampleJSON, 'freqData');
			$('#dataViews > span').removeClass('selected');
			$('freqView').addClass('selected');
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
		beforeSend: function() {},
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
		beforeSend: function() {},
		success: function(data) {
			console.log(data);
		},
		error: function(e) {
			console.log(e);
		}
	});
}

// save user; that is, either create or update user
function saveU(userObj) {
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
			console.log(data['user_pk']);
			userID = data['user_pk'];
			getQuestions(userID, currQType);
			answeredQuestions = [];
		},
		error: function(e) {
			console.log(e);
		}
	});
}

// get user ID
function getU(userObj) {
	$.ajax({
		url: 'getu/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			fb_id: fullUserObj.id
		},
		beforeSend: function() {},
		success: function(data) {
			console.log('we made it');
			data = JSON.parse(data);
			console.log(data['user_pk']);
			userID = data['user_pk'];
			getQuestions(userID, currQType);
			answeredQuestions = [];
		},
		error: function(e) {
			console.log(e);
		}
	});
}

// get all questions, answers, and data associated with me
function getMyQs() {
	$.ajax({
		url: 'getprofile/',
		type: 'POST',
		data: {
			csrfmiddlewaretoken: csrftoken,
			user_pk: userID
		},
		beforeSend: function() {},
		success: function(data) {
			$('#myQs > ul').html('');
			console.log('success?');
			console.log(JSON.parse(data));
			myQsJSON = JSON.parse(data);
			for (var i = 0; i < myQsJSON.length; i++) {
				$('#myQs > ul').append('<li data-qid="' + myQsJSON[i].qID + '">' + myQsJSON[i].question + '</li>');
			}
			// preview pie chart on mouseover
			$('#myQs > ul > li').on('mouseover', function() {
				// reset
				$('#myQs > ul > li').css('border', 'none');
				$('#myQs > ul > li').css('zoom', '1');

				// focusing on element
				$(this).css('border', 'solid #7D26CD 1px');
				$(this).css('zoom','1.5');

				$('#piePreview').html('');
				console.log('moused over');
				var currQID = $(this).data('qid');
				console.log(myQsJSON);
				// find correct question/poll for which to display data
				for (var i = 0; i < myQsJSON.length; i++) {
					if (myQsJSON[i].qID == currQID) {
						sampleJSON = myQsJSON[i];
						console.log(sampleJSON)

						// see if 0 users have answered
						var totalFreq = 0;
						for (var i = 0; i < sampleJSON.answers.length; i++) {
							totalFreq += sampleJSON.answers[i].frequency;
						}
						if (totalFreq == 0) {
							$('#piePreview').html('no data for this poll yet!');
							break;
						}

						buildPieChart(sampleJSON, 'piePreview');
						break;
					}
				}
			});
		},
		error: function(e) {
			console.log('error?')
			console.log(e);
		}
	});
}


// converts birthday to age
// birthday in form mm/dd/yyyy
function bdayToAge(birthday) {


	var birthDate = new Date(birthday);
	var ageSecs = Date.now() - birthDate.getTime();
    var ageDate = new Date(ageSecs); // expressed in ms from epoch
    var UTCyr = ageDate.getUTCFullYear();
    var epoch = 1970;
    var ageInYrs = Math.abs(UTCyr - epoch);

    return ageInYrs;
}

// close modal question window and overlay
function closeModal() {
	$('#uploadQuestion').slideUp(250);
	$('#flagModal').slideUp(250);
	$('#login').slideUp(250);
	$('#overlay').slideUp(250);
}

// cleanup if user exits early
$(window).on('beforeunload', function() {
	saveAnswers(userID, answeredQuestions);
});