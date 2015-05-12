/* ------------------------------------------------------------------------------------------*/
// Name: profile.js
// Author: PYS team
// Contents: Defines function(s) necessary for profile page
// (i.e. load my questions given certain queries)
// Info: Currently just contains one function for loading polls that
// the user has asked or answered under various queries.
/* ------------------------------------------------------------------------------------------*/
// Load and display all questions associated with user with id myID.
// Questions are loaded by mainQuery (asked/answered), subQuery
// (popular/recent), recDirection (asc/desc), popDirection (asc/desc),
// and scrollIndex (how many 'infinite' scrolls user has gone through)
function loadQFromQuery(myID, mainQuery, subQuery, recDirection, popDirection, scrollIndex) {
    // allow for infinite ajax scroll if we have 
    if (scrollIndex == 0) {
        myQsJSON = [];
        ajaxReady = true;
        QloadComplete = false;
        scroller = 0;
        $('#myQs > ul').html('');
        $('#qLoader').show();
    } else {
        ajaxReady = false;
        $('#qLoader2').show();
    }
    // get questions for user with given queries
    $.ajax({
        url: 'getprofile/',
        type: 'POST',
        data: {
            csrfmiddlewaretoken: csrftoken,
            user_pk: myID,
            main_query: mainQuery, // asked or answereed
            sub_query: subQuery, // primary sorting order
            rec_dir: recDirection, // asc or desc
            pop_dir: popDirection, // asc or desc
            scroll_index: scrollIndex // how many infinite scrolls thus far?
        },
        beforeSend: function() {},
        success: function(data) {
            if (scrollIndex == 0) {
                $('#qLoader').hide();
                $('#myQs').animate({
                    scrollTop: 0
                }, 500);
                $('#qLoader2').remove();
            } else {
                $('#qLoader2').hide();
                ajaxReady = true;
            }
            myQsJSON = myQsJSON.concat(JSON.parse(data));
            // 15 questions loaded each time
            if (myQsJSON.length < (scrollIndex + 1) * 15)
                QloadComplete = true;
            else
                QloadComplete = false;

            for (var i = 0; i < myQsJSON.length; i++) {
                $('#myQs > ul').append('<li data-qid="' + myQsJSON[i].qID + '">' + myQsJSON[i].question + '</li>');
            }

            $('#qLoader2').appendTo('#myQs');

            // preview pie chart on mouseover
            $('#myQs > ul > li').on('mouseover', function() {
                // reset
                $('#piePreview').html('');
                $('#myQs > ul > li').css('border', 'none');
                $('#myQs > ul > li').css('zoom', '1');

                // focusing on element
                $(this).css('border', 'solid #7D26CD 1px');
                $(this).css('zoom', '1.5');

                // find correct question/poll for which to display data
                var currQID = $(this).data('qid');
                for (var i = 0; i < myQsJSON.length; i++) {
                    if (myQsJSON[i].qID == currQID) {
                        loadedJSON = myQsJSON[i];

                        // see if 0 users have answered
                        var totalFreq = 0;
                        for (var i = 0; i < loadedJSON.answers.length; i++) {
                            totalFreq += loadedJSON.answers[i].frequency;
                        }
                        if (totalFreq == 0) {
                            $('#piePreview').html('no data for this poll yet!');
                            $(this).data('existsData', 'false');
                            break;
                        } else {
                            $(this).data('existsData', 'true');
                        }

                        buildPieChart(loadedJSON, 'piePreview');
                        break;
                    }
                }
            });
        },
        error: function(e) {
            console.log(e);
        }
    });
}