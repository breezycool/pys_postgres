/* ------------------------------------------------------------------------------------------*/
// Name: data.js
// Author: PYS team
// Contents: Defines all functions for drawing data representations  
// Info: There are five data views. The first three are built using Google Charts API.
// This is include the pie chart, gender chart, and age chart. The fourth data representation
// is not included in this file and is coded in ballpit.js. 
// The fifth representation displays the data musically. Read each function for details.
/* ------------------------------------------------------------------------------------------*/
// On document load
$(function() {
    // Load all sound assets with PreloadJS
    sounds = new createjs.LoadQueue();
    sounds.installPlugin(createjs.Sound);
    sounds.loadManifest([{
        id: "jingle",
        src: "https://s3.amazonaws.com/polledyouso/audio/pys-jingle.mp3"
    }, {
        id: "C3",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+C3.mp3"
    }, {
        id: "D3",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+D3.mp3"
    }, {
        id: "E3",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+E3.mp3"
    }, {
        id: "F3",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+F3.mp3"
    }, {
        id: "G3",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+G3.mp3"
    }, {
        id: "A3",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+A3.mp3"
    }, {
        id: "B3",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+B3.mp3"
    }, {
        id: "C4",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+C4.mp3"
    }, {
        id: "D4",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+D4.mp3"
    }, {
        id: "E4",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+E4.mp3"
    }, {
        id: "F4",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+F4.mp3"
    }, {
        id: "G4",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+G4.mp3"
    }, {
        id: "A4",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+A4.mp3"
    }, {
        id: "B4",
        src: "https://s3.amazonaws.com/polledyouso/audio/Doo+-+B4.mp3"
    }]);

    soundIDs = ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4"];

    // hide using jquery instead of css for convenience, because
    // we need this as a table display later
    $('#dataViews').hide();
});

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

// stores current jingle sound source
var currentJingle;

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
        'is3D': true,
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

    var dataArray = [
        ['Gender', 'Men', 'Women']
    ];

    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        dataArray.push([value.answer, value.maleFrequency, value.femaleFrequency]);
    });

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        chartArea: {
            width: '50%'
        },
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
        legend: {
            position: 'none'
        },
        seriesType: "bars",
        colors: dataColors,
    };

    var chart = new google.visualization.ComboChart(document.getElementById('ageData'));
    chart.draw(data, options);
}

/* ------------------------------------------------------------------------------------------*/
// Musical Data Representation - Uses CreateJS suite to handle preloading, tweening, canvas
// drawing, and sound manipulation.
// Maps overall frequencies to pitch - Lower frequencies correspond to smaller circles and 
// higher pitches. Higher frequencies correspond to bigger circles and lower pitches.
// A metronome is started at 250 bpm - each note is as likely to beat on the metronome as its
// frequency percentage - For example, a response with 33% will only beat 33% of the time
// with the metronome.
/* ------------------------------------------------------------------------------------------*/
function buildMusicalCircles(data) {
    if (typeof data != 'object')
        var dataObject = JSON.parse(data);
    else
        var dataObject = data;

    var canvas = document.getElementById("music");
    stage = new createjs.Stage("music");
    var currentSound = null;
    var currentSounds = [];

    // stores circle shape, sound, and frequency 
    var circleArray = [];

    // force canvas to occupy full width
    canvas.width = $("#data").width();
    canvas.height = $("#data").height();

    createjs.Ticker.setFPS(60);
    stage.enableMouseOver(60);
    createjs.Ticker.addEventListener("tick", stage);

    var overallFreq = 0;
    $.each(dataObject.answers, function(key, value) {
        overallFreq += value.frequency;
    });

    var percentages = [];
    $.each(dataObject.answers, function(key, value) {
        percentages.push(value.frequency / overallFreq);
    });

    // define counter for interval loop
    var i = 0;

    // draw a circle for each frequency every 250ms
    var drawCircles = setInterval(function() {
        // if counter equals the number of answers stop interval
        if (i == percentages.length - 1)
            clearInterval(drawCircles);

        // ball can have a max radius of 93 and a min radius of 3
        var scaledSize = Math.floor(percentages[i] * 90) + 3;

        // calculate which sound should be played according to percentage
        // a high percentage will have a lower sound
        var soundNumber = soundIDs.length - Math.floor(percentages[i] * soundIDs.length);
        if (soundNumber >= soundIDs.length)
            soundNumber = soundIDs.length - 1;
        var sound = soundIDs[soundNumber];

        // center each circle by a width that fills the page evenly
        var x = Math.floor(i * canvas.width / percentages.length) + canvas.width / percentages.length / 2;

        // place circle in center of canvas
        var y = canvas.height / 2;
        var percentage = Math.round(percentages[i] * 100);
        var tempCircle = drawCircle(scaledSize, dataColors[i], sound, x, y, percentage);
        circleArray.push([tempCircle, sound, percentage]);

        // increment counter
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

        // create a scaling tween to show that the ball is making sound
        createjs.Tween.get(circle)
            .to({
                scaleX: 1.2,
                scaleY: 1.2
            }, 100, createjs.Ease.getPowInOut(2))
            .to({
                scaleX: 1,
                scaleY: 1
            }, 100);

        // add sound to currentSounds in order to fade it later on
        currentSounds.push(createjs.Sound.play(sound, {
            pan: circle.x / (canvas.width / 2) - 1
        }));

        // add text indicating percentage of circle
        // also, scale text according to frequency
        var scaledFont = size * .4 + 15;
        var text = new createjs.Text('~' + percentage + '%', scaledFont + "px Times New Roman", color);
        text.x = circle.x;
        text.y = circle.y;
        text.regX = text.getBounds().width / 2;
        text.regY = text.getBounds().height / 2;
        text.alpha = 0;
        stage.addChild(text);
        createjs.Tween.get(text).to({
            y: circle.y - circle.radius - 30,
            alpha: 1
        }, 100);

        // give each circle a button pressdown effect
        circle.on("mousedown", function() {
            circle.shadow = new createjs.Shadow("#000000", 2, 2, 2);
        });

        // increase shadow on pressup
        circle.on("pressup", function() {
            circle.shadow = new createjs.Shadow("#000000", 5, 5, 5);
        });

        // make circle ping and play sound on rollover
        circle.on("rollover", function() {
            // play sound and pan the sound by an amount equal to the balls placement on the page
            currentSound = createjs.Sound.play(sound, {
                pan: this.x / (canvas.width / 2) - 1
            });
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

    // start metronome once all balls have been displayed
    var rhythmTimeout = setTimeout(startRhythm, 1500);
    activeTimeouts.push(rhythmTimeout);

    // This function starts a metronome that beats every 250 ms
    // Each ball is as likely to beat as its own response frequency
    function startRhythm() {
        // fade all previous sounds
        for (var i = 0; i < currentSounds.length; i++) {
            fadeAudio(currentSounds[i], 350, "out");
        }

        // start metronome
        var rhythm = setInterval(function() {
            for (var i = 0; i < circleArray.length; i++) {
                var random = Math.random() * 100;

                // check if ball should beat according to frequency
                if (circleArray[i][2] >= random) {
                    // immediately fade audio
                    fadeAudio(createjs.Sound.play(circleArray[i][1], {
                        pan: circleArray[i][0].x / (canvas.width / 2) - 1
                    }), 250, "out");
                    createjs.Tween.get(circleArray[i][0])
                        .to({
                            scaleX: 1.1,
                            scaleY: 1.1
                        }, 100, createjs.Ease.getPowInOut(2))
                        .to({
                            scaleX: 1,
                            scaleY: 1
                        }, 100);
                }
            }
        }, 250);

        activeIntervals.push(rhythm);
    }
}

/* ------------------------------------------------------------------------------------------*/
// Special custom function for fading audio in and out
// Scales fade out and fade in according to time specified
/* ------------------------------------------------------------------------------------------*/
function fadeAudio(sound, time, inOrOut) {
    var fadeOutIncrement = 1 / (time / (sound.volume * 5));
    var fadeInIncrement = 1 / (time / 5);
    if (inOrOut == "out") {
        var fade = setInterval(function() {
            if (sound.volume <= 0) {
                sound.volume = 0;
                clearInterval(fade);
            } else sound.volume -= fadeOutIncrement;
        }, 5);
    } else if (inOrOut == "in") {
        var fade = setInterval(function() {
            if (sound.volume >= 1) {
                sound.volume = 1;
                clearInterval(fade);
            } else {
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
// Play and stop jingle - Randomize playback speed every time
/* ------------------------------------------------------------------------------------------*/
function playJingle() {
    var randomPlayback = Math.random() + .5;
    currentJingle = createjs.Sound.play("jingle");
    currentJingle.sourceNode.playbackRate.value = randomPlayback;
}

function stopJingle() {
    if (currentJingle != null)
        fadeAudio(currentJingle, 50, "out");
}

// setup jingle functionality
$(document).on('mouseover', '#logo-image', playJingle);
$(document).on('mouseout', '#logo-image', stopJingle);


/* ------------------------------------------------------------------------------------------*/
// Resize Charts
/* ------------------------------------------------------------------------------------------*/
// call resize function on window resize
window.onresize = resize;

// setup function for resizing all charts
// Note: the physics engine resizes canvas automatically
function resize() {
    if ($('#freqView').hasClass('selected'))
        buildPieChart(loadedJSON, 'freqData');
    if ($('#ageView').hasClass('selected'))
        buildAgeChart(loadedJSON);
    if ($('#genderView').hasClass('selected'))
        buildGenderChart(loadedJSON);
    if ($('#musicView').hasClass('selected')) {
        clearMusic();
        buildMusicalCircles(loadedJSON);
    }
}