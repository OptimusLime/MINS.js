//This is where we define our simple experiment, and do all our simulation logic


var desiredRenderSpeed = 60;
var desiredSimulationSpeed = 30;
var lastFPS = 1000/desiredRenderSpeed;

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(callback){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000/desiredRenderSpeed);
        };
})();

var SCALE= 30;

var sCanvasID = "physics";
var canvas = document.getElementById(sCanvasID);

var lastObjectID = -1;

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
    {id: "ground", x: canvasWidth / 2 / SCALE, y: canvasHeight / SCALE, halfHeight: 0.5, halfWidth: canvasWidth / SCALE, color: 'black'}
    //,
   // {id: "ball1", x: 9, y: 2, radius: 0.5},
   // {id: "ball2", x: 11, y: 4, radius: 0.5}
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

    createXMLFileReader("files", function(jsonDoc)
    {
        console.log("XML converted to: ");
        console.log(jsonDoc);

        theWorld.jsonParseMINS(jsonDoc);


    });

    //we grab our canvas object really
    drawObject = new boxNS.DrawingObject(sCanvasID, canvasWidth, canvasHeight, SCALE);

    theWorld = new bHelpNS.ContainedWorld(desiredSimulationSpeed, false, canvasWidth, canvasHeight, SCALE, 20, false,
        {object: drawObject, addBody: drawObject.addBody, removeBody: drawObject.removeBody, addJoint: drawObject.addJoint, removeJoint: drawObject.removeJoint });




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
   // distanceJoint = theWorld.addMuscleJoint('ball1', 'ball2', params);




    //we bind the data array - bitch
    //actually, we don't call this anymore because the callbacks inform our drawing procedures
    //drawObject.setWorldObjects({bodies:theWorld.bodiesList, joints:theWorld.jointsList});
}

function draw() {
    //console.log("d");
    drawObject.drawWorld(theWorld.interpolation);
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

function toggleTest()
{
    console.log('Attmpting toggle');
    //we need our body ID, where do I get that from?

    $.ajax({
        url: "http://127.0.0.1:3000/toggle",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({ 'genomeID' : lastObjectID }),
        contentType: "application/json",
        cache: false,
        timeout: 30000,
        complete: function() {
            //called when complete
            console.log('process complete');
        },

        success: function(data) {
            console.log('Toggle success');
            console.log(data);
            console.log('process sucess');
        },

        error: function() {
            console.log('process error');
        }
    });


}


function insertBody()
{
    getBody(function(jsonData)
    {
        if(!jsonData){
            console.log("No JSON fetched, aborting body add");
            return;
        }
        console.log("JSON fetched: ");
        console.log( jsonData);//.InputLocations.concat(jsonData.HiddenLocations));

        //right now, this is a bodyObject with InputLocations, HiddenLocations, and Connections

        //we grab our genomeID
        lastObjectID = parseInt(jsonData.GenomeID);
        var inCnt = jsonData.InputLocations.length;
        var hiCnt = jsonData.HiddenLocations.length;

        var data = jsonData.InputLocations.concat(jsonData.HiddenLocations);

        var connections = jsonData.Connections;

        theWorld.jsonParseNodeApp(jsonData);
        //we need to decide on scale
//        We go from -1 to 1, so we have to add 1 to everything, scale, and place each node





//        var margin = {top: 0, right: 0, bottom: 0, left: 0},
//            width = 960,
//            height = 500;
//
//        var x = pad(d3.scale.linear()
//            .domain(d3.extent(data, function(d, i) { return d.X; }))
//            .range([0, width - margin.left - margin.right]), 40);
//
//        var y = pad(d3.scale.linear()
//            .domain(d3.extent(data, function(d, i) { return d.Y; }))
//            .range([ height - margin.top - margin.bottom,0]), 40);
//
//        var svg = d3.select("body").append("svg").style("border", "1px solid black")
//            .attr("width", width)
//            .attr("height", height)
//            .attr("class", "dot line chart");
//
//
//        svg.selectAll(".dot")
//            .data(data)
//            .enter().append("circle")
//            .style("fill", function(d, i) {
//                return i < inCnt ? "#00f" : "#050";
//            })
//            .attr("class", "dot")
//            .attr("cx", function(d) { return x(d.X); })
//            .attr("cy", function(d) { return y(d.Y); })
//            .attr("r", 12)
//        console.log("Connections: ");
//        console.log(connections);
//
//        svg.selectAll(".line")
//            .data(connections)
//            .enter().append("line")
//            .style("stroke-width", function(d) { return 1.5;})//Math.sqrt(d.value); });
//            .style("stroke", function(d) { return "#000"})
//            .attr("x1", function(c){ return x(c.coordinates[0]); })
//            .attr("y1", function(c){ return y(c.coordinates[1]); })
//            .attr("x2", function(c){ return x(c.coordinates[2]); })
//            .attr("y2", function(c){ return y(c.coordinates[3]); });


    });
}

function pad(scale, k) {
    return scale;
//        var range = scale.range();
//        if (range[0] > range[1]) k *= -1;
//        return scale.domain([range[0] - k, range[1] + k].map(scale.invert)).nice();
}
