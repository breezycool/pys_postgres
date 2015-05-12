/* ------------------------------------------------------------------------------------------*/
// Name: main.js
// Author: PYS team
// Contents: Prepares miscellaneous functionality for the UI
// Info: On document load, we prevent normal form features, and prepare
// infinite scroll. Sets up global variables for entire site. Sets up
// safe way to communicate with backend. Sets up handlers for interacting
// with the DOM. Contains other misc. useful functions (i.e. close
// a modal, convert birthday to age, etc).
/* ------------------------------------------------------------------------------------------*/
// on document load...
$(function() {
    // prevent default actions (i.e., refresh pages) on submission of any form
    $('form').submit(function(e) {
        e.preventDefault();
    });
    // prevent submission of form/default action on enter
    $(window).keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    // detect scrolling through all questions/polls loaded on profile page
    // infinite scroll, will be implemented in future (had idea
    // just a few hours before dean's date)
    // $('#myQs').scroll(handleScroll);
});

/**************** begin global variables ****************/
// tracks current data display for toggling on and off
// when new data is selected
var currentView = 'freqData';
// did the user already answer the curr question?
var alreadyAnswered = false
// are we looking for near or far questions?
var currQType = 'near'
// is the user currently on the profile or polls page?
var currentPage = 'polls'
// have we not loaded our physics world yet?
var noWorld = true;
// has the user completely logged in ? (i.e. can overlay now have
// normal properties?)
var loadComplete = false;
// for infinite sroll. number of times we have 
// activated infinite scroll in current mode
var scroller = 0;
// have we obtained the user's location yet?
var locationSet = false;
// have we gone through all the near questions?
var nearDone = false;
// have we gone through all the far questions?
var farDone = false;
// working array of set of questions retrieved from server
var currentQuestions = [];
// default main sorting of my questions on profile page is by asked
var mainQuery = 'asked';
// default primary (after main) sorting is by most recent
var subQuery = 'recent';
// default recent sorting direction is descending
var recentSort = 'desc';
// default popular sorting direction is descending
var popularSort = 'desc';
/**************** end global variables ****************/


// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {
    'packages': ['corechart', 'bar']
});

/* BEGIN CSRF SETUP FOR AJAX CALLS TO SERVER */
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
/* END CSRF SETUP FOR AJAX CALLS TO SERVER */


// detect click of first selection in user selections
$(document).on('click', '#firstSel', function() {
    // switch to profile view
    if (currentPage == 'polls') {
        currentPage = 'profile';
        $(this).text('polls');

        // clean up front end
        $('#navRight').trigger('click');
        $('#allDone').slideUp(500);
        $('#pollSort').slideDown(500);
        $('#card,#minimize,#dataViews,#data,#navLeft,#navRight,#near,#far,#allDone').hide();
        $('#freqData,#genderData,#ageData,#music').html('');
        $('#myQs, #piePreview, #asked, #answered').show();

        saveAnswers(userID, answeredQuestions);
        loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, 0);
    }
    // switch to polls view
    else {
        currentPage = 'polls';
        $(this).text('profile');

        // clean up front end
        $('#pollSort').slideUp(500);
        $('#myQs,#piePreview,#minimize,#dataViews,#data,#navLeft,#navRight,#asked,#answered').hide();
        $('#near,#far').show();
        getQuestions(userID, currQType);
    }
});

// detect click on popular sorting "button"
$(document).on('click', '#popular', function() {
    subQuery = 'popular';
    // change to ascending from descending
    if (popularSort == 'desc') {
        popularSort = 'asc';
        $('#popular > .fa-sort-desc').hide();
        $('#popular > .fa-sort-asc').show();
        loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, 0);
    }
    // change to descending from ascending
    else {
        popularSort = 'desc';
        $('#popular > .fa-sort-asc').hide();
        $('#popular > .fa-sort-desc').show();
        loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, 0);
    }
});

// detect click on recent sorting "button"
$(document).on('click', '#recent', function() {
    subQuery = 'recent';
    // change to ascending from descending
    if (recentSort == 'desc') {
        recentSort = 'asc';
        $('#recent > .fa-sort-desc').hide();
        $('#recent > .fa-sort-asc').show();
        loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, 0);
    }
    // change to descending from ascending
    else {
        recentSort = 'desc';
        $('#recent > .fa-sort-asc').hide();
        $('#recent > .fa-sort-desc').show();
        loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, 0);
    }
});

// detect click on any of the loaded questions in profile view
$(document).on('click', '#myQs > ul > li', function() {
    // if there's no data for this poll yet, add attention grabbing effect
    if ($(this).data('existsData') == 'false') {
        $('#piePreview').effect("pulsate", {
            times: 2
        });
        return;
    }
    // loadedJSON for current question is already loaded from mouseover event
    // show question and answers in data view
    $('#questionMin').text(loadedJSON.question);
    $('#answersMin').html(''); // reset min answers
    for (var i = 0; i < loadedJSON.answers.length; i++) {
        $('#answersMin').append('<div><div data-question-id="">' + loadedJSON.answers[i].answer + '</div></div>')
    }

    // clean up front end
    $('#myQs,#piePreview,#pollSort').hide();
    $('#minimize,#navLeft,#dataViews').show();
    $('#data').show(500);
    $('#dataViews > span').each(function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
    });

    // automatically show simple pie chart first in all data views
    window.setTimeout(function() {
        $('#freqView').trigger('click');
    }, 500);
});



// detect click on a question's answer
$(document).on('click', '.liAnswer', function() {
    alreadyAnswered = true;
    // automatically show simple pie chart first in all data views
    window.setTimeout(function() {
        $('#freqView').trigger('click');
    }, 600)

    $('#navLeft').hide(); // can't go back after answer a new question

    selectedAnswer = $(this).data('answerId');

    // details about how the user answered the question
    currQAns = [];
    currQAns[0] = prevqID;
    currQAns[1] = selectedAnswer;
    currQAns[2] = Date.now(); //also keep track of time answered

    answeredQuestions.push(currQAns);

    var myResponse = $(this).text();
    loadedJSON = getData(currQAns[1], myResponse);

    // update minimized view of question
    $('#questionMin').text(currQuestion);
    $('#answersMin').html(''); // reset min answers
    for (var i = 0; i < currAnswers.length; i++)
        $('#answersMin').append('<div><div data-question-id="' + prevqID + '" data-answer-id="' + currAnswers[i][0] + '">' + currAnswers[i][1] + '</div></div>')

    // highlight selected answer in minimized view
    $('#answersMin > div').each(function() {
        currAnsID = $(this).children().data('answerId');
        if (currAnsID == selectedAnswer) {
            $(this).css('box-shadow', '0 4px 2px -2px #333');
        }
    });

    // clean up front-end
    $('#card').slideUp(500);
    $('#minimize,#dataViews,#navRight').show();
    $('#data').slideDown(500);
});

// change type of questions we are looking for (near or far?)
$(document).on('click', '#mainToggle > div', function() {

    // don't register clicks on already clicked element
    if ($(this).hasClass('selected'))
        return;

    // in polls; toggle between near/far
    if (currentPage == 'polls') {
        var htmlID = $(this).attr('id');
        if (htmlID == 'near') {
            currQType = 'near';
            $('#far').removeClass('selected');
            $('#near').addClass('selected')
        } else {
            currQType = 'far';
            $('#near').removeClass('selected');
            $('#far').addClass('selected');
        }

        // stop music from playing
        if (currentView == 'music')
            clearMusic();

        // save answers and get questions (latter called within former)
        saveAnswers(userID, answeredQuestions);
        // clean up front end
        $('#minimize,#dataViews,#data,#navLeft,#navRight').hide();

    }
    // in profile; toggle between asked/answered
    else {
        var htmlID = $(this).attr('id');
        if (htmlID == 'asked') {
            mainQuery = 'asked';
            $('#asked').addClass('selected');
            $('#answered').removeClass('selected');
            $('#navLeft').trigger('click');
            $('#piePreview').html('');
            loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, 0);
        } else {
            mainQuery = 'answered';
            $('#answered').addClass('selected');
            $('#asked').removeClass('selected');
            $('#navLeft').trigger('click');
            $('#piePreview').html('');
            loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, 0);
        }
    }
});

// detect click on a data view
$(document).on('click', '#dataViews > span', function() {

    // load new data view
    if (!$(this).hasClass('selected')) {
        htmlID = $(this).attr('id');
        switch (htmlID) {
            // frequency
            case 'freqView':
                $('#' + currentView).fadeOut(250);
                $('#freqData').fadeIn(250);
                buildPieChart(loadedJSON, 'freqData');
                currentView = 'freqData';
                break;
                // gender
            case 'genderView':
                $('#' + currentView).fadeOut(250);
                $('#genderData').fadeIn(250);
                buildGenderChart(loadedJSON);
                currentView = 'genderData';
                break;
                // age
            case 'ageView':
                $('#' + currentView).fadeOut(250);
                $('#ageData').fadeIn(250);
                buildAgeChart(loadedJSON);
                currentView = 'ageData';
                break;
                // ball pit
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
                addBodies(globalWorld, globalPhysics, loadedJSON);
                currentView = 'balls';
                break;
                // music
            case 'musicView':
                $('#' + currentView).fadeOut(250);
                $('#music').fadeIn(250);
                buildMusicalCircles(loadedJSON);
                currentView = 'music';
                break;
            default:
                break;
        }

        // keep physics world and music fresh
        if (htmlID != 'ballPit' && !noWorld)
            clearWorld();
        if (htmlID != 'musicView')
            clearMusic();
    }

    $('#dataViews > span').removeClass('selected');
    $(this).addClass('selected');
});


// detect left/right arrow key presses; link them to nav left/nav right
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

// detect click on right arrow button
$(document).on('click', '#navRight', function() {
    $('#navRight').hide();
    $('#navLeft').show(); // just in case you want to go back

    // only load a new question if the curr question has already been answered
    if (alreadyAnswered) {
        currentQuestions = loadQuestion(currentQuestions);
        if (currentQuestions == 'empty') {
            saveAnswers(userID, answeredQuestions);
        }
    }

    // clean up front end
    $('#minimize,#dataViews').hide();
    $('#data').slideUp(500);
    $('#card').slideDown(500);

    if (currentView == 'music')
        clearMusic();
});

// detect click on left arrow button
$(document).on('click', '#navLeft', function() {
    // currently looking at polls
    if (currentPage == 'polls') {
        $('#navLeft').hide();
        $('#navRight').show();
        $('#card').slideUp(500);
        $('#allDone').slideUp(500);
        $('#minimize,#dataViews').show();
        $('#data').slideDown(500);
        if (currentView == 'music') {
            var rebuild = setTimeout(function() {
                buildMusicalCircles(loadedJSON);
            }, 750);
            activeTimeouts.push(rebuild);
        }
    }
    // currently on profile page
    else {
        $('#freqData,#genderData,#ageData,#music').html('');
        $('#minimize,#dataViews,#navLeft').hide();
        $('#data').slideUp(500);
        $('#myQs,#piePreview,#pollSort').slideDown(500);
        clearMusic();
    }
});

// detect click on flag "button"; display modal
$(document).on('click', '#flag', function() {
    $('#overlay').show();
    $('#flagModal').slideDown(500);
});

// detect click on "yes, I want to flag" (Flag question)
$(document).on('click', '#flagModal > div', function() {
    closeModal();
    // timeouts to look pretty
    window.setTimeout(function() {
        $('#card').slideUp(250);
        window.setTimeout(function() {
            currentQuestions = loadQuestion(currentQuestions);
            if (currentQuestions == 'empty')
                saveAnswers(userID, answeredQuestions);
            $('#card').slideDown();
        }, 250)

    }, 300);
    flagQuestion(userID, prevqID);
});

// converts birthday to age representation in years
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
    $('#uploadQuestion,#flagModal,#login,#overlay').slideUp(250);
}

// handle scrolling all loaded questions on profile page; infinite scroll;
// had this idea a few hours before dean's date and will implement in 
// future properly. BUT, commenting it out so it doesn't mess it up.
// You may note that there is some infinite scroll code in the
// loadQFromQuery function in profile.js.
/*
function handleScroll() {
    var el = $('#myQs')[0];
    // leave function if in the middle of ajax, or no polls left to load
    if (!ajaxReady || QloadComplete) return;
    // if we've reached the bottom of the element...
    if (el.scrollTop > (el.scrollHeight - el.offsetHeight - 100)) {
        scroller++;
        loadQFromQuery(userID, mainQuery, subQuery, recentSort, popularSort, scroller);
        ajaxReady = false;
    }
}
*/

// cleanup if user exits early (submit all current answers to questions)
$(window).on('beforeunload', function() {
    saveAnswers(userID, answeredQuestions);
});