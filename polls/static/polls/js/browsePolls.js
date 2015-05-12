/* ------------------------------------------------------------------------------------------*/
// Name: browsePolls.js
// Author: PYS team
// Contents: Defines all functions for browsing other user's polls on
// main "polls" page of site. 
// Info: Contains functions for retrieving questions from database,
// formatting them correctly, loading them onto the UI, retrieving the
// data associated with a given question, including your own response in
// this data, saving your answers to a bunch of questions, and flagging
// a question if it is inappropriate.
/* ------------------------------------------------------------------------------------------*/
// Given current user's userID and desired questionType (near/far),
// get 30 questions from the database and store these locally in JSON.
function getQuestions(userID, questionType) {
    // prepare UI to get new question
    $('#loader').show();
    $('#someQ').html('');

    // call django url and pass it necessary data
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
            // handle case when there are no questions left
            if (currentQuestions.length <= 0) {
                if (currQType == 'near') {
                    var otherQType = 'far';
                    nearDone = true;
                } else {
                    var otherQType = 'near';
                    farDone = true;
                }

                $('#card').hide();
                $('#allDone').html('<div><span style="color:#7D26CD">Congratulations!</span> You\'ve clicked through all of the ' + currQType + ' polls.</div>Change your location query to ' + otherQType + ' (above), ask your own question (below), or explore some other parts of the site!');
                if (currentPage == 'polls')
                    $('#allDone').show();
            }
            // show new question
            else {
                $('#allDone').hide();
                if (currentPage == 'polls')
                    $('#card').show();
                currentQuestions = loadQuestion(currentQuestions);
            }

        },
        error: function(e) {
            console.log(e);
        }
    });
}

// transform input currentQuestions into array, and return it
function formatJSON(currentQuestions) {
    var JSONarray = [];
    qIDArray = [];

    for (var key in currentQuestions)
        if (currentQuestions.hasOwnProperty(key)) {
            qIDArray.push(key);
            JSONarray.push(currentQuestions[key]);
        }
    currentQuestions = JSONarray;

    return currentQuestions;
}

// display a question from the JSON questions, currentQuestions
// return 'empty' if currentQuestions is empty; otherwise,
// delete question we just loaded and return new currentQuestions
function loadQuestion(currentQuestions) {
    alreadyAnswered = false;

    $('#someQ').html('');
    $('#loader').hide();

    if (currentQuestions.length <= 0)
        return 'empty';

    // load current question, which is the first element in the
    // working array of loaded questions from server
    currQobj = currentQuestions[0];

    // get and show location of question
    var latlng = new google.maps.LatLng(currQobj['lat'], currQobj['lng']);
    reverseGeo(latlng);

    // update question on card
    currQuestion = currQobj['question'];
    currAnswers = currQobj['answers'];
    $('#someQ').append('<li id="liQuestion"><span>' + currQuestion + '</span></li>');
    for (var i = 0; i < currAnswers.length; i++)
        $('#someQ').append('<li class="liAnswer" data-question-id="' + qIDArray[0] + '" data-answer-id="' + currAnswers[i][0] + '"><span>' + currAnswers[i][1] + '</span></li>');

    var numQs = currentQuestions.length;
    var numIds = qIDArray.length;
    prevqID = qIDArray[0];
    // splice id array, because we've been through this question
    qIDArray = qIDArray.splice(1, numIds);
    // splice questions array for same reason
    currentQuestions = currentQuestions.splice(1, numQs);
    return currentQuestions;
}

// Get data for display once user has answered question with answer
// that has is myResponse and has id answerID
function getData(answerID, myResponse) {
    $.ajax({
        url: 'getdata/',
        type: 'POST',
        data: {
            csrfmiddlewaretoken: csrftoken,
            answer_pk: answerID
        },
        beforeSend: function() {},
        success: function(data) {
            loadedJSON = data;
            loadedJSON = appendResponse(JSON.parse(loadedJSON), myResponse)
            window.setTimeout(function() {
                $('#freqView').trigger('click');
            }, 600)
            buildPieChart(loadedJSON, 'freqData');
            $('#dataViews > span').removeClass('selected');
            $('freqView').addClass('selected');
        },
        error: function(e) {
            console.log(e);
        }
    });
}

// append my response, myResponse, to the current poll to the current 
// data shown. Takes in JSONobj (current poll), return JSON string
function appendResponse(JSONobj, myResponse) {
    var myData = JSONobj;
    for (var i = 0; i < JSONobj.answers.length; i++) {
        if (myData.answers[i].answer == myResponse) {
            // update frequency
            myData.answers[i].frequency++;
            // update gender frequency
            if (myGender == 'male')
                myData.answers[i].maleFrequency++;
            else
                myData.answers[i].femaleFrequency++;

            /* update age frequency
             age buckets are:
             array index --> range for age
             0 --> [0,14]
             1 --> [15,17]
             2 --> [18, 21]
             3 --> [22, 29]
             4 --> [30, 39]
             5 --> [40, 49]
             6 --> [50, age of oldest human alive]
             */
            if (myAge <= 14)
                myData.answers[i].ageFreqs[0]++;
            else if (myAge <= 17)
                myData.answers[i].ageFreqs[1]++;
            else if (myAge <= 21)
                myData.answers[i].ageFreqs[2]++;
            else if (myAge <= 29)
                myData.answers[i].ageFreqs[3]++;
            else if (myAge <= 39)
                myData.answers[i].ageFreqs[4]++;
            else if (myAge <= 49)
                myData.answers[i].ageFreqs[5]++;
            else
                myData.answers[i].ageFreqs[6]++;

            break;
        }
    }

    return JSON.stringify(myData);
}

// User with id userID sends <= 30 answeredQuestions to the database.
// Call getQuestions() to get another set of questions
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
            answeredQuestions = [];
            getQuestions(userID, currQType); // get more questions
        },
        error: function(e) {
            console.log(e);
        }
    });
}

// Flag question (i.e. deem it inappropriate) with question ID questionID. 
// No longer displays flagged question to users after a certain amount 
// of users flag it (method for this in backend, which is called through ajax).
// Pass in current user's userID.
function flagQuestion(userID, questionID) {
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
        },
        error: function(e) {
            console.log(e);
        }
    });
}