/* ------------------------------------------------------------------------------------------*/
// Name: askQuestion.js
// Author: PYS team
// Contents: Contains functions for submitting a poll/question.
// Info: Allows user to interact with 'submit a poll' modal,
// submit a question, have that question undergo some minor error checks,
// and then have that question sent to the backend.
/* ------------------------------------------------------------------------------------------*/
// detect click on certain amount of number of answers
$(document).on('click', 'table#numAnsSelect td', function() {

    numAnswers = $(this).text();
    $('table#numAnsSelect td').removeClass('selected');
    $(this).addClass('selected');
    $('#numberAnsSelect').val(numAnswers);
    $('#numberAnsSelect').show();
    $('.answer').hide();

    // display selected answer fields
    for (var i = 1; i <= numAnswers; i++) {
        $('#ans' + i).show();
    }

    $('input[type=submit]').slideDown(500);
    $('#ans1').focus();
});

// detect click on 'submit a poll'
$(document).on('click', '#clickToAsk', function() {
    $('#overlay').show();
    $('#uploadQuestion').slideDown(500);
    $('#yourQ').focus();
});

// detect click on overlay (how to close a closeable modal)
$(document).on('click', '#overlay', function() {
    if (!loadComplete)
        return;
    closeModal();
});

// submit question to backend
function submitQuestion() {
    $('table#numAnsSelect td').removeClass('selected');
    var question = $('#yourQ').val().toLowerCase();
    var ans1 = $('#ans1').val();
    var ans2 = $('#ans2').val();
    var ans3 = $('#ans3').val();
    var ans4 = $('#ans4').val();
    var ans5 = $('#ans5').val();

    //allAnswers = [ans1, ans2, ans3, ans4, ans5];
    allAnswers = [];

    for (var i = 0; i < numAnswers; i++)
        allAnswers.push($('#ans' + (i + 1)).val());

    realAnswers = [];

    // get rid of empty answers from allAnswers array
    for (var i = 0; i < allAnswers.length; i++) {
        if (allAnswers[i] != '')
            realAnswers.push(allAnswers[i].toLowerCase());
    }

    question = trimWS(question);

    // add question mark to question if need be
    var lastQchar = question.substr(question.length - 1);
    if (lastQchar != '?')
        question += '?';

    for (var i = 0; i < realAnswers.length; i++)
        realAnswers[i] = trimWS(realAnswers[i]);

    if (question.length <= 1) {
        alert('Please enter a non-empty question');
        return false;
    }

    if (realAnswers.length < 2) {
        alert('Please enter at least 2 non-empty answers.');
        return false;
    }

    // save new question to backend
    saveNewQ(question, realAnswers);


}

// trim whitespace of string1
function trimWS(string1) {
    var returnStr = string1;
    // replace multiple spaces with one space
    returnStr = returnStr.replace(/\s{2,}/g, ' ');

    // gets rid of white space at beginning and end
    returnStr = returnStr.trim();

    return returnStr;
}

// reset question upload fields
function resetUpload() {
    $('#uploadQuestion > form')[0].reset();
    numAnswers = 0;
    $('.answer.uploadField').hide();
    $('#numAnsSelect').show();
}

// Save new question/poll to backend. Question/poll to be saved
// is submittedQ, and answers we are submitting is submittedAns
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
            $('.uploadField').hide();
            $('#checkmark').show();
            window.setTimeout(function() {
                closeModal();
                window.setTimeout(function() {
                    $('#checkmark').hide();
                    $('.uploadField').show();
                    resetUpload();
                },500);
            }, 500);
        },
        error: function(e) {
            console.log(e);
        }
    });
}