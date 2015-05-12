/* ------------------------------------------------------------------------------------------*/
// Global Variables
/* ------------------------------------------------------------------------------------------*/
// Defines default colors for charts
var dataColors = ["#F68E55", "#3BB878", "#00BFF3", "#855FA8", "#F06EA9"];
var dataColorsAlt = ["0xF68E55", "0x3BB878", "0x00BFF3", "0x855FA8", "0xF06EA9"];

// Stores all sounds IDs for playing musical data
var soundIDs;

// stores active intervals and timeouts in order to clear when out of scope
var activeIntervals = [];
var activeTimeouts = [];

// for testing only

var sampleJSON1 = '{ "answers" : [' +
'{ "answer":"casey" , "frequency": 34 , "maleFrequency": 10, "femaleFrequency": 24, "ageFreqs": [10, 2, 3, 1, 5, 0, 9, 4]},' +
'{ "answer":"lachie" , "frequency": 65 , "maleFrequency": 16, "femaleFrequency": 49, "ageFreqs": [8, 10, 8, 3, 7, 12, 5, 11]},' +
'{ "answer":"jesse" , "frequency": 30 , "maleFrequency": 29, "femaleFrequency": 1, "ageFreqs": [3, 2, 6, 1, 8, 5, 2, 3]},' +
'{ "answer":"terrence" , "frequency": 25 , "maleFrequency": 12, "femaleFrequency": 13, "ageFreqs": [1, 1, 2, 4, 5, 7, 1, 4]},' +
'{ "answer":"definitely casey" , "frequency": 14 , "maleFrequency": 10, "femaleFrequency": 4, "ageFreqs": [3, 0, 2, 1, 3, 2, 2, 0]}]}';

// for testing only

var sampleJSON2 = '{ "answers" : [' +
'{ "answer":"tenderly" , "frequency": 20 , "maleFrequency": 3, "femaleFrequency": 6, "ageFreqs": [5, 2, 3, 1, 5, 0, 9, 10]},' +
'{ "answer":"anxiously" , "frequency": 50 , "maleFrequency": 6, "femaleFrequency": 19, "ageFreqs": [0, 2, 3, 1, 2, 1, 5, 2]},' +
'{ "answer":"masturbatorily" , "frequency": 10 , "maleFrequency": 10, "femaleFrequency": 1, "ageFreqs": [3, 2, 3, 1, 8, 5, 2, 3]},' +
'{ "answer":"discreetly" , "frequency": 15 , "maleFrequency": 2, "femaleFrequency": 7, "ageFreqs": [0, 2, 3, 4, 5, 7, 1, 4]}]}';

var sampleJSON3 = '{ "answers" : [' +
'{ "answer":"tenderly" , "frequency": 0 , "maleFrequency": 3, "femaleFrequency": 6, "ageFreqs": [5, 2, 3, 1, 5, 0, 9, 10]},' +
'{ "answer":"anxiously" , "frequency": 50 , "maleFrequency": 6, "femaleFrequency": 19, "ageFreqs": [0, 2, 3, 1, 2, 1, 5, 2]}]}';

// define stage for musical representation
var stage;

/* ------------------------------------------------------------------------------------------*/
// Draws a simple pie chart representation of the overall frequencies for each answer
/* ------------------------------------------------------------------------------------------*/
function buildPieChart(data, elID) {
    if (typeof data != 'object')
        var dataObject = JSON.parse(data);
    else
        var dataObject = data;
    
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Answers');
    data.addColumn('number', 'Frequencies');

    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        // force legend to show unselected answers
        data.addRow([value.answer, value.frequency]);
    });

    // Set chart options
    options = {
        'is3D':true,
        'colors': dataColors,
        'backgroundColor': "#f7f7f7",
        sliceVisibilityThreshold: 0
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById(elID));
    chart.draw(data, options);
}

/* ------------------------------------------------------------------------------------------*/
// Draws a radar chart using male and female frequencies for each answer
/* ------------------------------------------------------------------------------------------*/
function buildGenderChart(data) {

   if (typeof data != 'object')
    var dataObject = JSON.parse(data);
else
    var dataObject = data;

var dataArray = [['Gender', 'Men', 'Women']];

    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        dataArray.push([value.answer, value.maleFrequency, value.femaleFrequency]);
    });
    
    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        chartArea: {width: '50%'},
        isStacked: true,
        backgroundColor: "#f7f7f7",
        colors: ["#1269FA", "#F7005E"]
    };
    
    var chart = new google.visualization.BarChart(document.getElementById('genderData'));
    chart.draw(data, options);
}

/* ------------------------------------------------------------------------------------------*/
// Draws a Combo Chart to display age groups 
// Plots all frequencies according to set age groups
/* ------------------------------------------------------------------------------------------*/
function buildAgeChart(data) {
    if (typeof data != 'object')
        var dataObject = JSON.parse(data);
    else
        var dataObject = data;
    var dataArray = [];

    dataArray.push(['Answers'], ['Under 14'], ['15-17'], ['18-21'], ['22-29'], ['30-39'], ['40-49'], ['Over 50']);

    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        dataArray[0].push(value.answer);
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
        colors: dataColors,
    };

    var chart = new google.visualization.ComboChart(document.getElementById('ageData'));
    chart.draw(data, options);
}

/* ------------------------------------------------------------------------------------------*/
// Musical Data Representation
// Maps overall frequencies to pitch - Lower frequencies correspond to smaller circles and higher pitches
// Higher frequencies correspond to bigger circles and lower pitches
// A metronome is started at 250 bpm - each note is as likely to beat on the metronome as its
// frequency percentage - For example, a response with 33% will only beat 33% of the time
// with the metronome.
/* ------------------------------------------------------------------------------------------*/
function buildMusicalCircles(data) {
    var canvas = document.getElementById("music");
    stage = new createjs.Stage("music");
    var currentSound = null ;
    var currentSounds = [];
    
    // stores circle shape, sound, and frequency 
    var circleArray = [];
    
    canvas.width = $("#data").width();
    canvas.height = $("#data").height();
    
    createjs.Ticker.setFPS(60);
    stage.enableMouseOver(60);
    createjs.Ticker.addEventListener("tick", stage);
    

    if (typeof data != 'object')
        var dataObject = JSON.parse(data);
    else
        var dataObject = data;

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
        
        var scaledSize = Math.floor(percentages[i] * 90) + 3;
        var soundNumber = soundIDs.length - Math.floor(percentages[i] * soundIDs.length);
        if (soundNumber >= soundIDs.length)
            soundNumber = soundIDs.length - 1;
        var sound = soundIDs[soundNumber];
        
        // center each circle by a width that fills the page evenly
        var x = Math.floor(i * canvas.width/percentages.length) + canvas.width/percentages.length/2;
        
        // place circle in center of canvas
        var y = canvas.height/2;
        var percentage = Math.round(percentages[i] * 100);
        var tempCircle = drawCircle(scaledSize, dataColors[i], sound, x, y, percentage);
        circleArray.push([tempCircle, sound, percentage]);
        
        i++;
    }, 250);

    activeIntervals.push(drawCircles);
    
    // defines process to draw circle and percentage text to canvas
    function drawCircle(size, color, sound, x, y, percentage) {
        var circle = new createjs.Shape();
        circle.graphics.beginFill(color).drawCircle(0, 0, size);
        circle.x = x;
        circle.y = y;
        circle.radius = size;
        circle.scale = 1;
        circle.alpha = 1;
        circle.shadow = new createjs.Shadow("#000000", 5, 5, 5);
        stage.addChild(circle);
        createjs.Tween.get(circle)
            .to({scaleX: 1.2, scaleY: 1.2}, 100, createjs.Ease.getPowInOut(2))
            .to({scaleX: 1, scaleY: 1}, 100);
        
        currentSounds.push(createjs.Sound.play(sound, {pan: circle.x/(canvas.width/2) - 1}));
        
        // add text indicating percentage of circle
        var scaledFont = size * .4 + 15;
        var text = new createjs.Text('~' + percentage + '%', scaledFont + "px Times New Roman", color);
        text.x = circle.x;
        text.y = circle.y;
        text.regX = text.getBounds().width / 2;
        text.regY = text.getBounds().height / 2;
        text.alpha = 0;
        stage.addChild(text);
        createjs.Tween.get(text).to({y: circle.y - circle.radius - 30, alpha: 1}, 100);
        
        // give each circle a button pressdown effect
        circle.on("mousedown", function() {
            circle.shadow = new createjs.Shadow("#000000", 2, 2, 2);
        });
        
        circle.on("pressup", function() {
            circle.shadow = new createjs.Shadow("#000000", 5, 5, 5); 
        });
        
        // make circle ping and play sound on rollover
        circle.on("rollover", function() {
            currentSound = createjs.Sound.play(sound, {pan: this.x/(canvas.width/2) - 1});
            createjs.Tween.removeTweens(circle);
            this.scaleX = this.scaleY = this.scale * 1.2;
        });

        // scale circle back to normal size on rollout
        circle.on("rollout", function() {
            fadeAudio(currentSound, 100, "out");
            this.scaleX = this.scaleY = this.scale;
        });
        
        return circle;
    }
    
    var rhythmTimeout = setTimeout(startRhythm, 1500);
    activeTimeouts.push(rhythmTimeout);
    
    function startRhythm() {
        for (var i = 0; i < currentSounds.length; i++) {
            fadeAudio(currentSounds[i], 350, "out");
        }

        var rhythm = setInterval( function() {
            for (var i = 0; i < circleArray.length; i++) {
                var random = Math.random() * 100;

                if (circleArray[i][2] >= random) {
                    fadeAudio(createjs.Sound.play(circleArray[i][1]), 250, "out");
                    createjs.Tween.get(circleArray[i][0])
                    .to({scaleX: 1.1, scaleY: 1.1}, 100, createjs.Ease.getPowInOut(2))
                    .to({scaleX: 1, scaleY: 1}, 100);
                }
            }
        }, 250);
        
        activeIntervals.push(rhythm);
    }
}

/* ------------------------------------------------------------------------------------------*/
// Special Function for fading audio in and out
/* ------------------------------------------------------------------------------------------*/
function fadeAudio(sound, time, inOrOut) {
    var fadeOutIncrement = 1/(time/(sound.volume * 5));
    var fadeInIncrement = 1/(time/5);
    if (inOrOut == "out") {
        var fade = setInterval( function() {
            if (sound.volume <= 0) {
                sound.volume = 0;
                clearInterval(fade);
            }
            else sound.volume -= fadeOutIncrement;
        }, 5);
    }
    else if(inOrOut == "in") {
        var fade = setInterval( function() {
            if (sound.volume >= 1) {
                sound.volume = 1;
                clearInterval(fade);
            }
            else {
                sound.volume += fadeInIncrement;
            }
        }, 5);   
    }   
}

/* ------------------------------------------------------------------------------------------*/
// Stop all sound and clear animations on music view when another view is selected
/* ------------------------------------------------------------------------------------------*/
function clearMusic() {
    createjs.Sound.stop();

    // remove all animations and drawings on canvas
    if (stage != null) {
        stage.removeAllChildren();
        stage.clear();
    }   

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

/* ------------------------------------------------------------------------------------------*/
// Resize Charts
/* ------------------------------------------------------------------------------------------*/
// call resize function on window resize
window.onresize = resize;

// setup function for resizing all charts 
function resize() {
    if ($('#freqView').hasClass('selected'))
        buildPieChart(sampleJSON, 'freqData');
    if ($('#ageView').hasClass('selected'))
        buildAgeChart(sampleJSON);
    if ($('#genderView').hasClass('selected'))
        buildGenderChart(sampleJSON);
    if ($('#musicView').hasClass('selected')) {
        clearMusic();
        buildMusicalCircles(sampleJSON);
    }
    // physics engine resizes canvas automatically
}