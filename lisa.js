// module aliases
var Engine = Matter.Engine,
    Events = Matter.Events,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices;

// function
var scaleVelocity = function(speed, body) {
    if (body.isStatic) return;
    Body.setVelocity(
        body, 
        Vector.mult(Vector.normalise(body.velocity), speed)
    )
}

// create an engine and world
var engine = Engine.create();
var world = engine.world;
world.gravity.y = 0;

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1080,
        height: 1080,
        background: '#FF0FFF',
        // wireframes: false,
        showInternalEdge: false,
        showPositions: true
      }
});

// paramters
var xCenter = 1080/2;
var yCenter = 1080/2;

var SPEED = 2.99;

// create wall
var upperHeight = 250;
var radius = 250;
var numInterval = 100;
var interval = 4*radius / numInterval;
var xx = new Array(numInterval+1);
for (var i=0;i<=numInterval;i++) {
    xx[i] = -2*radius + i*interval;
}
var uyy = Array.from(xx, x=>-Math.sqrt(Math.pow(radius, 2) - Math.pow(Math.abs(x)-radius, 2)));

var lowerHeight = 3*upperHeight;
var lyy = Array.from(xx, x=>lowerHeight*Math.sqrt(1-Math.sqrt(Math.abs(x)/(2*radius))));

xx.push(xx[xx.length-1]);
xx.push(xx[0]);
uyy.push(-(upperHeight+1));
uyy.push(-(upperHeight+1));
lyy.push(lowerHeight+1);
lyy.push(lowerHeight+1);

var upath = '';
var lpath = '';
var upoints = [];
var lpoints = [];
for (var i=0;i<xx.length;i++) {
    // upath = xx[i].toString + ' ' + uyy[i].toString + ' ';
    upoints.push(Vector.create(xx[i], uyy[i]));
    lpoints.push(Vector.create(xx[i], lyy[i]));
};

//// Emitter
class Emitter {
    constructor(r=14, inter = 2000) {
        var _this = this;
        this.x = xCenter; 
        this.y = 340;
        this.r = r;
        this.inter = inter;
        this.start = function (speed) {
            this.timer = setInterval(function () {
                var box = Bodies.circle(_this.x, _this.y, _this.r, {
                    frictionAir: 0,
                    frictionStatic: 0,
                    restitution: 1,
                    render: {
                        // fillStyle: '#EE3F4D'
                        strokeStyle: '#0FFFFF',
                        sprite: {
                            texture: 'texture.png'
                        }
                    }
                    
                });
                var initVelocity = Vector.create(Math.random()-0.5, Math.random()-0.5);
                Body.setVelocity(box, Vector.mult(Vector.normalise(initVelocity), speed));
                World.add(world, box);
            }, this.inter);
        };
        this.end = function () {
            clearInterval(this.timer);
        };
    }
}
var emitter = new Emitter();
emitter.start(SPEED);


var ubody = Bodies.fromVertices(xCenter, 84, upoints, 
    {
        density:0,
        frictionStatic:0,
        isStatic:true, 
        restitution:1,
        render:{
            fillStyle: '#0FFFFF'
        }
    },
    true);
var lbody = Bodies.fromVertices(xCenter+12, 700, lpoints, 
    {
        density:0,
        frictionStatic:0,
        isStatic:true,
        restitution:1,
        render:{
            fillStyle: '#FFFFFF'
        }
    },
    true);
    


// add all of the bodies to the world
World.add(world, [ubody, lbody]);

// add events
Events.on(engine, 'collisionEnd', function(event) {
    var pairs = event.pairs;

    // change object colours to show those starting a collision
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        scaleVelocity(SPEED, pair.bodyA)
        scaleVelocity(SPEED, pair.bodyB)
    }
});

Events.on(render, 'afterRender', function(event){
    var canvasData = render.canvas.toDataURL("image/png");
    var ajax = new XMLHttpRequest();
    ajax.open("POST",'sever.php',false);
    ajax.setRequestHeader('Content-Type', 'text/plain');
    ajax.send(canvasData);
})





// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);