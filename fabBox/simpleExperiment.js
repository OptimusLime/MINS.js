//This is where we define our simple experiment, and do all our simulation logic

var lastFPS = 1000/60;
var desiredFPS = 1000/60;

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(callback){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, desiredFPS);
        };
})();

var SCALE= 30;

var sCanvasID = "physics";
var canvas = document.getElementById(sCanvasID);

var canvasWidth = 640;
var canvasHeight = 480;
canvas.style.width = canvasWidth + "px";
canvas.style.height = canvasHeight + "px";
canvas.style.border = "thick solid #000000";

var drawObject;
var running = true;
var theWorld;
var rad =0;
var distanceJoint;

var initialState = [
    {id: "ground", x: canvasWidth / 2 / SCALE, y: canvasHeight / SCALE, halfHeight: 0.5, halfWidth: canvasWidth / SCALE, color: 'black'},
    {id: "ball1", x: 9, y: 2, radius: 0.5},
    {id: "ball2", x: 11, y: 4, radius: 0.5}
];

//initialization of our world. Clears everything pretty much
function init() {

    /*
    var testSVG = d3.select("#tests")
        .style("width", "640px")
        .style("height", "480px")
        .style("border", "thick solid #000000")
        .append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight);


    var fakeData = [10, 30, 60, 120, 240];

    var circs = testSVG.selectAll("circles")
        .data(fakeData)
        .enter()
        .append("circle")
        .attr("cx", function(d){return d;})
        .attr("cy", function(d){return d;})
        .attr("r", function(d){return d;});
    */

    //we grab our canvas object really
    drawObject = new boxNS.DrawingObject(sCanvasID, canvasWidth, canvasHeight, SCALE);

    theWorld = new bHelpNS.ContainedWorld(60, false, canvasWidth, canvasHeight, SCALE, 10, false);

    var world = {};
    for (var i = 0; i < initialState.length; i++) {
        world[initialState[i].id] = Entity.build(initialState[i]);
    }
    //this will populate the bodies map -- thereby causing d3 to draw the data on screen
    theWorld.setBodies(world);



    //custom stuff here
    var dampingRatio = parseInt(document.getElementById('damping-ratio').value);
    var frequencyHz = parseInt(document.getElementById('frequency-hz').value);
    params = {};
    if (dampingRatio != 0) params['dampingRatio'] = dampingRatio;
    if (frequencyHz != 0) params['frequencyHz'] = frequencyHz;
    //console.log(params);
    distanceJoint = theWorld.addMuscleJoint('ball1', 'ball2', params);

    //we bind the data array - bitch
    drawObject.setWorldObjects({bodies:theWorld.bodiesList, joints:theWorld.jointsList});
}

function draw() {
    //console.log("d");
    drawObject.drawWorld();
}

function update(animStart) {
    if (isMouseDown) {
        theWorld.mouseDownAt(mouseX, mouseY);
    } else if (theWorld.isMouseDown()) {
        theWorld.mouseUp();
    }

    //if(distanceJoint)
    //    distanceJoint.SetLength(distanceJoint.GetLength() +.1*Math.sin(rad));


    //console.log(distanceJoint.GetLength());

    //rad += .1;

    theWorld.update();

}

/* ---- INPUT ----------------------------- */
var mouseX, mouseY, isMouseDown;

canvas.addEventListener("mousedown", function(e) {
    isMouseDown = true;
    handleMouseMove(e);
    document.addEventListener("mousemove", handleMouseMove, true);
}, true);

canvas.addEventListener("mouseup", function() {
    if (!isMouseDown) return;
    document.removeEventListener("mousemove", handleMouseMove, true);
    isMouseDown = false;
    mouseX = undefined;
    mouseY = undefined;
}, true);

function handleMouseMove(e) {
    mouseX = (e.clientX - canvas.getBoundingClientRect().left) / SCALE;
    mouseY = (e.clientY - canvas.getBoundingClientRect().top) / SCALE;
}

window.onload = function() {
    init();

    (function loop(animStart) {
        update(animStart);
        draw();
        requestAnimFrame(loop);
    })();
};
