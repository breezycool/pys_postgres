var globalWorld; // defines a variable for dealing with the physics world globally
var globalPhysics;
var renderer;

/* ------------------------------------------------------------------------------------------*/
// Draws a ballpit using a javascript physics engine
// Code taken from example on PhysicsJS documentation: http://wellcaffeinated.net/PhysicsJS/
/* ------------------------------------------------------------------------------------------*/
require.config({
      baseUrl: 'http://wellcaffeinated.net/PhysicsJS/assets/scripts/vendor/',
      packages: [
        {
          name: 'physicsjs',
          location: 'physicsjs-current',
          main: 'physicsjs-full.min'
        }
      ]
});

var colors = [
  ['0xF68E55', '0x0d394f']
  ,['0x3BB878', '0x561414']
  ,['0x00BFF3', '0x79231b']
  ,['0x6c71c4', '0x393f6a']
  ,['0x58c73c', '0x30641c']
  ,['0xcac34c', '0x736a2c']
];

function initWorld(world, Physics) {
    globalWorld = world;
    globalPhysics = Physics;
    // bounds of the window
    var viewWidth = $("#data").width(),
    viewHeight = $("#data").height(),
    ballsBounds = Physics.aabb(0, 0, $("#data").width(), $("#data").height()),
    edgeBounce,
    styles = {
        'circle': {
            fillStyle: colors[0][0],
            lineWidth: 1,
            strokeStyle: colors[0][1]
        }
        ,'rectangle': {
            fillStyle: colors[1][0],
            lineWidth: 1,
            strokeStyle: colors[1][1]
        }
        ,'convex-polygon': {
            fillStyle: colors[2][0],
            lineWidth: 1,
            strokeStyle: colors[2][1]
        }
    };

    // create a renderer
    renderer = Physics.renderer('pixi', { el: 'balls', styles: styles });
    // add the renderer
    world.add(renderer);
    // render on each step
    world.on('step', function () {
    world.render();
    });

    // constrain objects to these bounds
    edgeBounce = Physics.behavior('edge-collision-detection', {
    aabb: ballsBounds
    ,restitution: 0.2
    ,cof: 0.8
    });

    // resize events
    window.addEventListener('resize', function () {

    // as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
    ballsBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
    // update the boundaries
    edgeBounce.setAABB(ballsBounds);

    }, true);

    // add behaviors to the world
    world.add([
    Physics.behavior('constant-acceleration')
    ,Physics.behavior('body-impulse-response')
    ,Physics.behavior('body-collision-detection')
    ,Physics.behavior('sweep-prune')
    ,edgeBounce
    ]);  
}

function startWorld( world, Physics ){
    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });
}

//
// Add some interaction
//
function addInteraction( world, Physics ){
  // add the mouse interaction
  world.add(Physics.behavior('interactive', { el: world.renderer().container }));
  // add some fun extra interaction
  var attractor = Physics.behavior('attractor', {
    order: 0,
    strength: 0.002
  });

  world.on({
    'interact:poke': function( pos ){
      world.wakeUpAll();
      attractor.position( pos );
      world.add( attractor );
    }
    ,'interact:move': function( pos ){
      attractor.position( pos );
    }
    ,'interact:release': function(){
      world.wakeUpAll();
      world.remove( attractor );
    }
  });
}

// helper function (bind "this" to Physics)
function makeBody( obj ){ 
  return this.body( obj.name, obj );
}

//
// Add bodies to the world
//
function addBodies(world, Physics, data){
    world.unpause();
    
    // calculate how many objects to make for each answer
    var dataObject = JSON.parse(data);
    var dataArray = [];
    var overallFreq = 0;
    var numAnswers = 0;
    
    $.each(dataObject.answers, function(key, value) {
        dataArray.push(value.frequency);
        overallFreq += value.frequency;
        numAnswers++;
    });
    
    var v = Physics.geometry.regularPolygonVertices;
    var bodies = [];
    
    // draw circles for first answer
    var numCircles = Math.floor(dataArray[0]/overallFreq  * 50);
    for (var i = 0; i < numCircles; i++) {
        var randX = Math.random() * 100 + 50;
        var randY = Math.random() * 100 + 50;
        var randVX = Math.random() * 6 - 3;
        bodies.push({ name: 'circle', restitution: 0.9,  styles: {
            fillStyle: '0xF68E55',
            lineWidth: 1
        },
        x: randX, y: randY, vx: randVX, radius: 20 });
    }
    
    // draw squares for second answer
    var numSquares = Math.floor(dataArray[1]/overallFreq  * 50);
    for (var i = 0; i < numSquares; i++) {
        var randX = Math.random() * 200 + $('#data').width() * 2/numAnswers;
        var randY = Math.random() * 200 + 50;
        var randVX = Math.random() * 6 - 3;
        bodies.push({ name: 'rectangle', restitution: 0.9, styles: {
            fillStyle: '0x3BB878',
            lineWidth: 1
        },
        x: randX, y: randY, vx: randVX, width: 40, height: 40 });
    }
    
    // check for at least three answers, then draw pentagons
    if (numAnswers > 2) {
        var numPents = Math.floor(dataArray[2]/overallFreq  * 50);
        for (var i = 0; i < numPents; i++) {
            var randX = Math.random() * 200 + $('#data').width() * 3/numAnswers;
            var randY = Math.random() * 200 + 150;
            var randVX = Math.random() * 6 - 3;
            bodies.push({ name: 'convex-polygon', restitution: 0.9, styles: {
                fillStyle: '0x00BFF3',
                lineWidth: 1
            },
            x: randX, y: randY, vx: randVX, vertices: v( 5, 20 )});
        }
    }   
    
    // check at least four answers, then draw triangles
    if (numAnswers > 3) {
        var numTri = Math.floor(dataArray[3]/overallFreq  * 50);
        for (var i = 0; i < numTri; i++) {
            var randX = Math.random() * 200 + $('#data').width() * 4/numAnswers;
            var randY = Math.random() * 200 + 50;
            var randVX = Math.random() * 6 - 3;
            bodies.push({ name: 'convex-polygon', restitution: 0.9, styles: {
                fillStyle: '0x855FA8',
                lineWidth: 1
            },
            x: randX, y: randY, vx: randVX, vertices: v( 3, 20 )});
        }
    }
    // check at least five answers, then draw octagons
    if (numAnswers > 4) {
        var numOcts = Math.floor(dataArray[4]/overallFreq  * 50);
        for (var i = 0; i < numOcts; i++) {
            var randX = Math.random() * 200 + $('#data').width() * 5/numAnswers;
            var randY = Math.random() * 200 + 50;
            var randVX = Math.random() * 6 - 3;
            bodies.push({ name: 'convex-polygon', restitution: 0.9, styles: {
                fillStyle: '0xF06EA9',
                lineWidth: 1
            },
            x: randX, y: randY, vx: randVX, vertices: v( 8, 20 )});
        }
    }

    // functional programming FTW
    world.add( bodies.map(makeBody.bind(Physics)) );
}

//
// Load the libraries with requirejs and create the simulation
//
require([
  'physicsjs',
  'pixi'
], function( Physics, PIXI ){
    window.PIXI = PIXI;

    var worldConfig = {
        // timestep
        timestep: 6,
        // maximum number of iterations per step
        maxIPF: 4,
        // default integrator
        integrator: 'verlet',
        // is sleeping disabled?
        sleepDisabled: false,
        // speed at which bodies wake up
        sleepSpeedLimit: 0.1,
        // variance in position below which bodies fall asleep
        sleepVarianceLimit: 2,
        // time (ms) before sleepy bodies fall asleep
        sleepTimeLimit: 500
    };

    Physics( worldConfig, [
        initWorld,
        addInteraction,
        startWorld
    ]);

});

function clearWorld() {
    globalWorld.pause();
    globalWorld.remove(globalWorld.getBodies());
}

