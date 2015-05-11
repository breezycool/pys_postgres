$(function() {
    //$("#login").hide();
    var currentId;
    qs = generateQs();
    if (qs.length == 0) {
        alert("no questions! create a question");
    }
    qs.first({
        success: function(object) {
            updateQ(object);
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
    // get id of page; need to store this question id somewhere on the page, this is just hardcoded
    
    
    $('.answer.display').click(function() {
        answerQ(this);
    });
    
    $('#navLeft').click(function() {
        moveQ("left", qs);
    });
    
    $('#navRight').click(function() {
        moveQ("right", qs);
    });





    $('.answer.display').click(function() {
        $('#card').hide();
        $('#minimize').show();
        $('#questionMin').show('scaleddd', 500);
    });

    var pieData = [
    {
        value: 300,
        color:"#F68E55",
        highlight: "#F8A577",
        label: "tenderly"
    },
    {
        value: 50,
        color: "#3BB878",
        highlight: "#62C693",
        label: "anxiously"
    },
    {
        value: 100,
        color: "#00BFF3",
        highlight: "#33CCF5",
        label: "masturbatorily"
    },
    {
        value: 40,
        color: "#855FA8",
        highlight: "#9D7FB9",
        label: "discreetly"
    },
    {
        value: 120,
        color: "#F06EA9",
        highlight: "#F38BBA",
        label: "wut is luv"
    }
    ];

        var pieData2 = [
    {
        value: 300,
        color:"#F68E55",
        highlight: "#F8A577",
        label: "tenderly"
    },
    {
        value: 50,
        color: "#3BB878",
        highlight: "#62C693",
        label: "anxiously"
    },
    {
        value: 100,
        color: "#00BFF3",
        highlight: "#33CCF5",
        label: "masturbatorily"
    },
    {
        value: 40,
        color: "#855FA8",
        highlight: "#9D7FB9",
        label: "discreetly"
    },
    {
        value: 120,
        color: "#F06EA9",
        highlight: "#F38BBA",
        label: "wut is luv"
    }
    ];

    var radarData = {
    labels: ["tenderly", "anxiously", "masturbatorily", "discreetly", "wut is luv"],
    datasets: [
        {
            label: "Male",
            fillColor: "rgba(18,105,250,0.2)",
            strokeColor: "rgba(18,105,250,1)",
            pointColor: "rgba(18,105,250,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 90, 81, 56]
        },
        {
            label: "Female",
            fillColor: "rgba(247,0,94,0.2)",
            strokeColor: "rgba(247,0,94,1)",
            pointColor: "rgba(247,0,94,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 96]
        }
    ]
};


    var ctx = document.getElementById("pieChart").getContext("2d");
    window.myDoughnut = new Chart(ctx).Doughnut(pieData);

    var ctx2 = document.getElementById("radarChart").getContext("2d");
    window.myRadar = new Chart(ctx2).Radar(radarData);
});

// qs returned as a Parse collection
function generateQs() {
    var qs = [];
    var Questions = Parse.Object.extend("Questions");
    var query = new Parse.Query(Questions);
    return query;
}

function answerQ(elmt) {
    // generate map
    ansarr = {};
    ansarr["answer_one"] = "one_answers";
    ansarr["answer_two"] = "two_answers";
    ansarr["answer_three"] = "three_answers";
    ansarr["answer_four"] = "four_answers";
    ansarr["answer_five"] = "five_answers";
    
    var colval = $(elmt).attr('id');
    console.log("selected "+colval);
    var Questions = Parse.Object.extend("Questions");
    var thisq = new Parse.Query(Questions);
    thisq.equalTo("objectId", currentId);
    //console.log("we made it");
    thisq.find({
        success: function(results) {
            // do something
            if (results.length == 1) {
                // should maybe add a mechanism that complains if result is already there
                results[0].add(ansarr[colval], Parse.User.current().id);
                results[0].save()
                console.log("problema risposta a");
            }
            else {
                alert("ci e male qualcosa con questo problema (something went wrong)");
            }
            
        },
        error: function(error) {
            alert("la vostra risponsa non stati registrata");
        }
    });
    moveQ("right");
}

// move either left or right in question display
function moveQ(direction) {
    qs.descending("objectId"); // would be better to sort by location, and date
    qs.find({
        success: function(results) {
            for (var i=0;i<results.length;i++) {
                if (results[i].id == currentId) {
                    if (direction == "left") {
                        var t = i - 1;
                        if (i == 0) {
                            t = results.length - 1;
                        }
                    }
                    else { // if direction == "right"
                        var t = i + 1;
                    if (i == results.length - 1) {
                        t = 0;
                    }
                }
            }
        }
        updateQ(results[t]);
    },
    error: function(error) {
        alert("non potevamo trovare la domanda seguente");
    }
});
}

// update page to refer to newq
function updateQ(newq) {
    $("#question").text(newq.get("question"));
    updateAnswerField("answer_one", newq);
    updateAnswerField("answer_two", newq);
    updateAnswerField("answer_three", newq);
    updateAnswerField("answer_four", newq);
    updateAnswerField("answer_five", newq);
    currentId = newq.id;
    console.log("current id is "+currentId);
}

function updateAnswerField(sel, newq) {
    var id = '#' + sel;
    if (newq.get(sel) != "") {
        $(id).text(newq.get(sel));
        $(id).show();
    }
    else {
        $(id).hide();
        // block question in, perhaps, with purple
       // console.log(sel + " is hidden");
    }
}
