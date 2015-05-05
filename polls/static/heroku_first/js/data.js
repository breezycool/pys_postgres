/* ------------------------------------------------------------------------------------------*/
// Global Variables
/* ------------------------------------------------------------------------------------------*/
// Defines default colors for charts
var dataColors = ["#F68E55", "#3BB878", "#00BFF3", "#855FA8", "#F06EA9"];

// Stores all sounds IDs for playing musical data
var soundIDs;

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

// define stage for musical representation
var stage;

/* ------------------------------------------------------------------------------------------*/
// Draws a simple pie chart representation of the overall frequencies for each answer
/* ------------------------------------------------------------------------------------------*/
function buildPieChart(data, elID) {
    console.log('about to parse the folloiwng data')
    console.log(data);
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
    var chart = new google.visualization.PieChart(document.getElementById(elID));
    chart.draw(data, options);
}


/* ------------------------------------------------------------------------------------------*/
// Draws a radar chart using male and female frequencies for each answer
/* ------------------------------------------------------------------------------------------*/
function buildGenderChart(data) {
    var dataObject = JSON.parse(data);
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
    var dataObject = JSON.parse(data);
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
/* ------------------------------------------------------------------------------------------*/
function buildMusicalCircles(data) {
    var canvas = document.getElementById("music");
    stage = new createjs.Stage("music");
    
    var carnival = createjs.Sound.play("carnival", {loop: -1, volume: 0});
    var fx1 = createjs.Sound.play("fx-1", {loop: -1, volume: 0});
    
    var currentFaceContainer = new createjs.Container();
    stage.addChild(currentFaceContainer);
    
    // load face images
    var imagePath = "assets/img/faces/face";
    var images = [];
    for (var i = 0; i < 24; i++) {
        var image = new Image();
        image.src = imagePath + (i + 1) + ".png";
        images[i] = image;
    }

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
        circle.radius = size;
        circle.scale = 1;
        circle.alpha = 1;
        circle.shadow = new createjs.Shadow("#000000", 5, 5, 5);
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
        
        circle.on("mousedown", function() {
            circle.shadow = new createjs.Shadow("#000000", 2, 2, 2);
            fx1.setPosition(0);
            fx1.volume = 1;
            fx1.sourceNode.playbackRate.value = (1 / circle.radius) * 5 + .5;
        });
        
        circle.on("pressup", function() {
            circle.shadow = new createjs.Shadow("#000000", 5, 5, 5); 
            fx1.volume = 0;
        });
        
        // make circle ping and play sound on rollover
        circle.on("rollover", function() {
            createjs.Tween.removeTweens(circle);
            this.scaleX = this.scaleY = this.scale * 1.2;
            //createjs.Sound.play(sound, {pan: circle.x/(canvas.width/2) - 1});
            
            carnival.setPosition(0);
            carnival.volume = 1;
            carnival.sourceNode.playbackRate.value = (1 / circle.radius) * 5 + .5;
            
            // draw bitmap faces above circle
            displayFaces(circle.x, circle.y, circle.radius);
        });

        // scale circle back to normal size on rollout
        circle.on("rollout", function() {
            this.scaleX = this.scaleY = this.scale;
            createjs.Tween.get(circle, {loop: true})
                .to({scaleX: 1.1, scaleY: 1.1}, 500, createjs.Ease.getPowInOut(2))
                .to({scaleX: 1, scaleY: 1}, 500);  
            carnival.volume = 0;
            removeFaces(circle.radius);
        });
        
        function displayFaces(centerX, centerY, r) {
            for (var i = 0; i < r/4; i++) {
                var randImage = images[Math.floor(Math.random() * 24)];
                var bitmap = new createjs.Bitmap(randImage);
                var xOffset = Math.random() * 80 - 40;
                var yOffset = Math.random() * 30 - 15;
                bitmap.regX = bitmap.image.width / 2;
                bitmap.regY = bitmap.image.height / 2;
                bitmap.x = centerX;
                bitmap.y = centerY;
                bitmap.scaleX = bitmap.scaleY = 0.05;
                bitmap.alpha = 0;
                bitmap.shadow = new createjs.Shadow("#000000", 2, 2, 2);
                createjs.Tween.get(bitmap).to({y: centerY - r - 40 + yOffset, x: centerX + xOffset, alpha: 1}, 250);
                createjs.Tween.get(bitmap, {loop: true}).to({rotation: 30}, 250).to({rotation: -30}, 250);
                currentFaceContainer.addChild(bitmap);
            }
        }
        
        function removeFaces(r) {
            for (var i = 0; i < currentFaceContainer.children.length; i++) {
                var currentFace = currentFaceContainer.children[i];
                createjs.Tween.get(currentFace).to({y: currentFace.y + r + 40, alpha: 0}, 150);
            }
            
            setTimeout( function() {
                currentFaceContainer.removeAllChildren();
            }, 50);
        }
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
        buildPieChart(sampleJSON1, 'freqData');
    if ($('#ageView').hasClass('selected'))
        buildAgeChart(sampleJSON1);
    if ($('#genderView').hasClass('selected'))
        buildGenderChart(sampleJSON1);
}