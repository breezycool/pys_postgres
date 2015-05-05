$(function() {
    $('table#numAnsSelect td').click(function() {
        numAnswers = $(this).text(); // global
        $('#numAnsSelect').hide();
        $('#numberAnsSelect').val(numAnswers);
        $('#numberAnsSelect').show();
        for (var i = 1; i <= numAnswers; i++) {
            $('#ans' + i).show("slide", { direction: "left" }, 500);
        }
        $('#ans1').focus();
    });

    $('#numberAnsSelect').focusout(function() {
        // user enters new number of fields
        if ($('#numberAnsSelect').val() != numAnswers) {
            numAnswers = $('#numberAnsSelect').val();
            $('.answer.uploadField').hide();
            // user selects invalid number of answers
            if (numAnswers == 69) {
                alert('you dog, you');
                $(this).focus();
                return false;
            }
            else if (numAnswers > 5 || numAnswers < 1) {
                alert('Please select between 1 and 5 answers.');
                $(this).focus();
                return false;
            }
            // user selects valid number of answers
            // show appropriate number of fields
            for (var i = 1; i <= numAnswers; i++) {
                $('#ans' + i).show("drop", 500);
            }
            $('#ans1').focus();
        }
    });

    $('.answer.display').click(function() {
        $("#user_answer").submit();
    })

    $('#clickToAsk').click(function() {
        $('#overlay').show();
        $('#uploadQuestion').show('drop',500);
    });

    $('#overlay').click(function() {
        closeModal();
    });
});

function submitQuestion() {
    closeModal();
    window.setTimeout(function() {
        resetUpload();
    },500);
}

// close modal question window and overlay
function closeModal() {
    $('#uploadQuestion').hide('drop',250);
    $('#overlay').hide('drop', 250);
}

// reset question upload fields
function resetUpload() {
    numAnswers = 0;
    $('.answer.uploadField').hide();
    $('.answer.uploadField').val('');
    $('#numAnsSelect').show();
}   