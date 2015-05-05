// Defines default colors for charts
var dataColors = ["#F68E55", "#3BB878", "#00BFF3", "#855FA8", "#F06EA9"];

// Stores all sounds IDs for playing musical data
var soundIDs;

// for testing
var sampleJSON = '{ "answers" : [' +
    '{ "answer":"tenderly" , "frequency": 20 , "maleFrequency": 3, "femaleFrequency": 6, "ageFreqs": [165, 135, 3, 1, 5, 0, 6, 10]},' +
    '{ "answer":"anxiously" , "frequency": 50 , "maleFrequency": 6, "femaleFrequency": 19, "ageFreqs": [0, 2, 3, 1, 5, 1, 5, 2]},' +
    '{ "answer":"masturbatorily" , "frequency": 10 , "maleFrequency": 10, "femaleFrequency": 1, "ageFreqs": [0, 2, 3, 1, 5, 5, 2, 3]},' +
    '{ "answer":"discreetly" , "frequency": 15 , "maleFrequency": 2, "femaleFrequency": 7, "ageFreqs": [0, 2, 3, 1, 5, 7, 1, 5]},' +
    '{ "answer":"wut is luv" , "frequency": 5 , "maleFrequency": 4, "femaleFrequency": 6, "ageFreqs": [0, 2, 3, 1, 5, 4, 7, 0]}]}';

var genderJSON = '{ "genderData" : [' +
    '{ "answer":"tenderly" , "frequency": 20 , "maleFrequency": 3, "femaleFrequency": 6},' +
    '{ "answer":"anxiously" , "frequency": 50 , "maleFrequency": 6, "femaleFrequency": 19},' +
    '{ "answer":"masturbatorily" , "frequency": 10 , "maleFrequency": 10, "femaleFrequency": 1},' +
    '{ "answer":"discreetly" , "frequency": 15 , "maleFrequency": 2, "femaleFrequency": 7},' +
    '{ "answer":"wut is luv" , "frequency": 5 , "maleFrequency": 4, "femaleFrequency": 6}]}';

// array index is age
var genderJSON = '{ "ageData" : [' +
    '{ "answer":"tenderly"},' +
    '{ "answer":"anxiously" , "frequency": 50 , "maleFrequency": 6, "femaleFrequency": 19},' +
    '{ "answer":"masturbatorily" , "frequency": 10 , "maleFrequency": 10, "femaleFrequency": 1},' +
    '{ "answer":"discreetly" , "frequency": 15 , "maleFrequency": 2, "femaleFrequency": 7},' +
    '{ "answer":"wut is luv" , "frequency": 5 , "maleFrequency": 4, "femaleFrequency": 6}]}';

var questionsJSON = '{ "questions" : [' +
    '{ "question":["how are you"]},' +
    '{ "question":["how many fingers am I holding up"]},' +
    '{ "question":["how are you used to loving"]},' +
    '{ "question":["what is my middle name"]},' +
    '{ "question":["do you know how big that is"]},' +
    '{ "question":["how are cats better than dogs"]},' +
    '{ "question":["how many feet am I raising"]},' +
    '{ "question":["how many people are in the world"]},' +
    '{ "question":["just out of curiosity, what is your favorite limb"]},' +
    '{ "question":["how do people communicate"]},' +
    '{ "question":["what is polledyouso"]},' +
    '{ "question":["how do you use polledyouso"]}]}';

var ageGenderJSON = '{ "ages" : [' +
    '{ "age":"Under 18", "maleFrequency": 3, "femaleFrequency": 3},' +
    '{ "age":"18-24", "maleFrequency": 2, "femaleFrequency": 1},' +
    '{ "age":"25-30", "maleFrequency": 4, "femaleFrequency": 0},' +
    '{ "age":"31-40", "maleFrequency": 1, "femaleFrequency": 5},' +
    '{ "age":"41-50", "maleFrequency": 5, "femaleFrequency": 2},' +
    '{ "age":"51-60", "maleFrequency": 3, "femaleFrequency": 4},' +
    '{ "age":"Over 60", "maleFrequency": 1, "femaleFrequency": 2}]}';


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
    
    dataArray.push(['Answer', 'Men', 'Women']);
    
    // Populate chart with answers and their corresponding frequencies
    $.each(dataObject.answers, function(key, value) {
        var temp = [];
        temp.push(value.answer);
        temp.push(value.maleFrequency);
        temp.push(value.femaleFrequency);
        dataArray.push(temp);
    });
    
    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor:'#f7f7f7',
        legend: { position: 'none' },
        colors: dataColors
    };
    
    var chart = new google.charts.Bar(document.getElementById('genderData'));
    chart.draw(data, google.charts.Bar.convertOptions(options));
}

function buildAgeChart(data) {
    var dataObject = JSON.parse(data);
    var dataArray = [];
    
    dataArray.push(['Answers', 'Answer1', 'Answer2', 'Answer3', 'Answer4', 'Answer5']);
    
    // Some raw data (not necessarily accurate)
    var data = google.visualization.arrayToDataTable([
        ['Age Group', 'Answer1', 'Answer2', 'Answer3', 'Answer4', 'Answer5'],
        ['Under 14',  165,      938,         522,             998,           450],
        ['15-17',  135,      1120,        599,             1268,          288],
        ['18-21',  157,      1167,        587,             807,           397],
        ['22-29',  139,      1110,        615,             968,           215],
        ['30-39',  136,      691,         629,             1026,          366],
        ['40-49',  136,      691,         629,             1026,          366],
        ['Above 50',  136,      691,         629,             1026,          366],
    ]);
    
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