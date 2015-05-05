// Defines default colors for charts
var dataColors = ["#F68E55", "#3BB878", "#00BFF3", "#855FA8", "#F06EA9"];

// Stores all sounds IDs for playing musical data
var soundIDs;

//Defines default options for ChartJS
Chart.defaults.global = {
    animation: true,
    animationSteps: 60,
    animationEasing: "easeOutQuart",
    showScale: true,
    scaleOverride: false,
    scaleSteps: null,
    scaleStepWidth: null,
    scaleStartValue: null,
    scaleLineColor: "rgba(0,0,0,.1)",
    scaleLineWidth: 1,
    scaleShowLabels: true,
    scaleLabel: "<%=value%>",
    scaleIntegersOnly: true,
    scaleBeginAtZero: false,
    scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    scaleFontSize: 12,
    scaleFontStyle: "normal",
    scaleFontColor: "#666",
    responsive: true,
    maintainAspectRatio: true,
    showTooltips: true,
    customTooltips: false,
    tooltipEvents: ["mousemove", "touchstart", "touchmove"],
    tooltipFillColor: "rgba(0,0,0,0.8)",
    tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    tooltipFontSize: 14,
    tooltipFontStyle: "normal",
    tooltipFontColor: "#fff",
    tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    tooltipTitleFontSize: 14,
    tooltipTitleFontStyle: "bold",
    tooltipTitleFontColor: "#fff",
    tooltipYPadding: 6,
    tooltipXPadding: 6,
    tooltipCaretSize: 8,
    tooltipCornerRadius: 6,
    tooltipXOffset: 10,
    tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
    multiTooltipTemplate: "<%= value %>",
    onAnimationProgress: function(){},
    onAnimationComplete: function(){}
}

// for testing
/*var sampleJSON = '{ "answers" : [' +
    '{ "answer":"tenderly" , "frequency": 20 , "maleFrequency": 3, "femaleFrequency": 6, "ageFreqs": [5, 2, 3, 1, 5, 0, 9, 10]},' +
    '{ "answer":"anxiously" , "frequency": 50 , "maleFrequency": 6, "femaleFrequency": 19, "ageFreqs": [0, 2, 3, 1, 2, 1, 5, 2]},' +
    '{ "answer":"masturbatorily" , "frequency": 10 , "maleFrequency": 10, "femaleFrequency": 1, "ageFreqs": [3, 2, 3, 1, 8, 5, 2, 3]},' +
    '{ "answer":"discreetly" , "frequency": 15 , "maleFrequency": 2, "femaleFrequency": 7, "ageFreqs": [0, 2, 3, 4, 5, 7, 1, 4]},' +
    '{ "answer":"wut is luv" , "frequency": 5 , "maleFrequency": 4, "femaleFrequency": 6, "ageFreqs": [10, 2, 3, 1, 5, 4, 2, 0]}]}';
*/
var sampleJSON;

function buildPieChart(data) {
    var dataObject = JSON.parse(data);
    
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Answers');
    data.addColumn('number', 'Frequencies');

    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        data.addRow([value.answer, value.frequency]);
    });

    // Set chart options
    options = {
        'is3D':true,
        'colors': dataColors,
        'backgroundColor': "#f7f7f7"
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('freqData'));
    chart.draw(data, options);
}

function buildGenderChart(data) {
    var dataObject = JSON.parse(data);
    var dataArray = [];
    
    var data = {
        labels: [],
        datasets: [
            {
                label: "Men",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "#F7005E",
                pointColor: "#F7005E",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []
            },
            {
                label: "Women",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "#1269FA",
                pointColor: "#1269FA",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: []
            }
        ]
    };
    
    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        data.labels.push('Answer' + (key+1));
        data.datasets[0].data.push(value.maleFrequency);
        data.datasets[1].data.push(value.femaleFrequency);
    });
    
    // empty for the moment
    var options = {};
    
    var ctx = document.getElementById("genderCanvas").getContext("2d");
    var myRadarChart = new Chart(ctx).Radar(data, options);
    
}

function buildAgeChart(data) {
    var dataObject = JSON.parse(data);
    var dataArray = [];
    
    dataArray.push(['Answers'], 
                   ['Under 14'], ['15-17'], ['18-21'], ['22-29'], ['30-39'], ['40-49'], ['Over 50']);
    
    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        dataArray[0].push('Answer' + (key+1));
        // Under 14
        dataArray[1].push(value.ageFreqs[0]);
        // 15-17
        dataArray[2].push(value.ageFreqs[1]);
        // 18-21
        dataArray[3].push(value.ageFreqs[2]);
        // 22-29
        dataArray[4].push(value.ageFreqs[3]);
        // 30-39
        dataArray[5].push(value.ageFreqs[4]);
        // 40-49
        dataArray[6].push(value.ageFreqs[5]);
        // Over 50
        dataArray[7].push(value.ageFreqs[6]);
        
    });
    
    var data = google.visualization.arrayToDataTable(dataArray);
    
    var options = {
        backgroundColor: "#f7f7f7",
        legend: { position: 'none' },
        seriesType: "bars",
        colors: dataColors
    };

    var chart = new google.visualization.ComboChart(document.getElementById('ageData'));
    chart.draw(data, options);
}

function buildMusicalCircles(data) {
    var canvas = document.getElementById("music");
    stage = new createjs.Stage("music");

    canvas.width = $("#data").width();
    canvas.height = $("#data").height();
    
    createjs.Ticker.setFPS(60);
    stage.enableMouseOver(60);
    createjs.Ticker.addEventListener("tick", stage);
    
    var dataObject = JSON.parse(data);
    var overallFreq = 0;
    $.each(dataObject.answers, function(key, value) {
        overallFreq += value.frequency;
    });
    
    var percentages = [];
    $.each(dataObject.answers, function(key, value) {
        percentages.push(value.frequency/overallFreq);
    });
    
    var i = 0;
    
    // draw a circle for each frequency every 250ms
    var drawCircles = setInterval(function() {
        if (i == percentages.length - 1)
            clearInterval(drawCircles);
        
        var scaledSize = Math.floor(percentages[i] * 120) + 3;
        var soundNumber = soundIDs.length - Math.floor(percentages[i] * soundIDs.length) - 1;
        var sound = soundIDs[soundNumber];
        
        // center each circle by a width that fills the page evenly
        var x = Math.floor(i * canvas.width/percentages.length) + canvas.width/percentages.length/2;
        
        // place circle in center of canvas
        var y = canvas.height/2;
        var percentage = Math.round(percentages[i] * 100);
        drawCircle(scaledSize, dataColors[i], sound, x, y, percentage);
        
        i++;
    }, 250);
    
    // defines process to draw circle and percentage text to canvas
    function drawCircle(size, color, sound, x, y, percentage) {
        var circle = new createjs.Shape();
        circle.graphics.beginFill(color).drawCircle(0, 0, size);
        circle.x = x;
        circle.y = y;
        circle.scale = 1;
        circle.alpha = 1;
        stage.addChild(circle);
        createjs.Tween.get(circle)
            .to({scaleX: 1.2, scaleY: 1.2}, 100, createjs.Ease.getPowInOut(2))
            .to({scaleX: 1, scaleY: 1}, 100);
        createjs.Sound.play(sound, {pan: circle.x/(canvas.width/2) - 1});
        
        // add text indicating percentage of circle
        var scaledFont = size * .4 + 15;
        var text = new createjs.Text(percentage + '%', scaledFont + "px Times New Roman", color);
        text.x = circle.x;
        text.y = circle.y;
        text.regX = text.getBounds().width / 2;
        text.regY = text.getBounds().height / 2;
        text.alpha = 0;
        stage.addChild(text);
        createjs.Tween.get(text).to({y: circle.y - 150, alpha: 1}, 100);
        
        setTimeout(function() {
           createjs.Tween.get(circle, {loop: true})
            .to({scaleX: 1.1, scaleY: 1.1}, 500, createjs.Ease.getPowInOut(2))
            .to({scaleX: 1, scaleY: 1}, 500);     
        }, 250);
        
        // make circle ping and play sound on rollover
        circle.on("rollover", function() {
            this.scaleX = this.scaleY = this.scale * 1.5;
            createjs.Sound.play(sound, {pan: circle.x/(canvas.width/2) - 1});
        });

        // scale circle back to normal size on rollout
        circle.on("rollout", function() {
            this.scaleX = this.scaleY = this.scale;
        });
    }
}

function buildWordTree(data) {
    var dataObject = JSON.parse(data);
    var phrases = [['Phrases']];
    
    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.questions, function(key, value) {
        phrases[key + 1] = value.question;
    });

    wordTreeData = google.visualization.arrayToDataTable(phrases
    );

    wordTreeOptions = {
        wordtree: {
            format: 'implicit',
            word: 'how'
        },
        colors: dataColors,
        backgroundColor: "#f7f7f7",
        width: $("#data").width(),
        height: $("#data").height()
    };

    var chart = new google.visualization.WordTree(document.getElementById('wordTree'));
    chart.draw(wordTreeData, wordTreeOptions);
}