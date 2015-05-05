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

	$('#clickToAsk').click(function() {
		$('#overlay').show();
		$('#uploadQuestion').show('drop',500);
	});

	$('#overlay').click(function() {
		closeModal();
	});

});

// submit question to backend
function submitQuestion() {
	console.log('hey');
	var question = $('#yourQ').val();
	var ans1 = $('#ans1').val();
	var ans2 = $('#ans2').val();
	var ans3 = $('#ans3').val();
	var ans4 = $('#ans4').val();
	var ans5 = $('#ans5').val();

	allAnswers = [ans1, ans2, ans3, ans4, ans5];
	numAllAns = allAnswers.length;
	realAnswers = [];

	// get rid of empty answers from allAnswers array
	for (var i = 0; i < numAllAns; i++){
		if (allAnswers[i] != '')
			realAnswers.push(allAnswers[i]);
	}

	// save new question to backend
	saveNewQ(question, realAnswers);

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
	$('#uploadQuestion > form')[0].reset();
	numAnswers = 0;
	$('.answer.uploadField').hide();

	$('#numAnsSelect').show();
}