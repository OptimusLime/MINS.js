//This is where we define our simple experiment, and do all our simulation logic

var smallNSS = "SmallWorld";
var smallNS = namespace(smallNSS);

var desiredSmallRenderSpeed = 30;
var desiredSmallSimulationSpeed = 30;
var lastFPS = 1000/desiredSmallRenderSpeed;

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(callback){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000/desiredSmallRenderSpeed);
        };
})();




//initialization of our world. Clears everything pretty much
smallNS.SmallWorld = function(sCanvasID, canvasWidth, canvasHeight, scale) {

    this.scale = scale;
    //make sure to save our canvasID for generating html string
    this.canvasID = sCanvasID;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;


    this.initialSmallState = [
        {id: "ground", x: canvasWidth / 2 / scale, y: canvasHeight / scale, halfHeight: 0.5, halfWidth: canvasWidth / scale, color: 'black'}
        //,
        // {id: "ball1", x: 9, y: 2, radius: 0.5},
        // {id: "ball2", x: 11, y: 4, radius: 0.5}
    ];

    //
    this.interruptLoop = false;

    //temp hack
    this.lastObjectID = -1;
    //Set up some mouse variables
    this.canvas = document.getElementById(sCanvasID);

    /* ---- INPUT ----------------------------- */
    this.mouseX;    this.mouseY;    this.isMouseDown;


    //we grab our canvas object really
    this.drawObject = new boxNS.DrawingObject(sCanvasID, scale);

    this.theWorld = new bHelpNS.ContainedWorld(desiredSmallSimulationSpeed, false, canvasWidth, canvasHeight, scale, 20, false,
        {object: this.drawObject, addBody: this.drawObject.addBody, removeBody: this.drawObject.removeBody,
            addJoint: this.drawObject.addJoint, removeJoint: this.drawObject.removeJoint });

    var world = {};
    for (var i = 0; i < this.initialSmallState.length; i++) {
        world[this.initialSmallState[i].id] = Entity.build(this.initialSmallState[i]);
    }
    //this will populate the bodies map -- thereby causing d3 to draw the data on screen
    this.theWorld.setBodies(world);
}

smallNS.smallWorldHtmlString = function(divID, canvasID, width, height)
{
    return '<div id=' + divID + ' class="element width2 height2"><canvas id=' + canvasID + ' width=' + height + ' height=' + height + ' style="border:thick solid #000000;"></canvas></div>';
};

smallNS.SmallWorld.prototype.draw = function() {
    //console.log("d");
    this.drawObject.drawWorld(this.theWorld.interpolation);
}

smallNS.SmallWorld.prototype.update = function(animStart) {
    if (this.isMouseDown) {
        this.theWorld.mouseDownAt(mouseX, mouseY);
    } else if (this.theWorld.isMouseDown()) {
        this.theWorld.mouseUp();
    }

//    console.log('Update?');
    this.theWorld.update();

}

smallNS.SmallWorld.prototype.addEventListeners = function()
{
    this.canvas.addEventListener("mousedown", function(e) {
        this.isMouseDown = true;
        this.handleMouseMove(e);
        document.addEventListener("mousemove", this.handleMouseMove, true);
    }, true);

    this.canvas.addEventListener("mouseup", function() {
        if (!this.isMouseDown) return;
        document.removeEventListener("mousemove", this.handleMouseMove, true);
        this.isMouseDown = false;
        this.mouseX = undefined;
        this.mouseY = undefined;
    }, true);
};


smallNS.SmallWorld.prototype.handleMouseMove = function(e) {
    this.mouseX = (e.clientX - canvas.getBoundingClientRect().left) / this.scale;
    this.mouseY = (e.clientY - canvas.getBoundingClientRect().top) / this.scale;
}

smallNS.SmallWorld.prototype.startLoop = function()
{
    //for a smooth transition, just make the start time be now!
    this.theWorld.lastTime = Date.now();
    this.interruptLoop = false;
    //closure should allow for this variable to be called from the loop. Hoo-ray?
    var smallWorld = this;
//    this.init();
    (function loop(animStart) {
        smallWorld.update(animStart);
        smallWorld.draw();
        if(!smallWorld.interruptLoop)
            requestAnimFrame(loop);
    })();
};

smallNS.SmallWorld.prototype.stopLoop = function()
{
    //this will cause a break in the loop
    this.interruptLoop = true;
}

smallNS.SmallWorld.prototype.toggleTest = function()
{
    console.log('Attmpting toggle');
    //we need our body ID, where do I get that from?

    toggleSelectedBody(lastObjectID, function(responseData)
    {
        //we've received a server response, lets just print it
        console.log('Toggle success');
        console.log(responseData);
        console.log('toggle over and out');

    });
}

smallNS.SmallWorld.prototype.addJSONBody = function(jsonData)
{
        if(!jsonData){
            console.log("No JSON fetched, aborting body add");
            return;
        }
//        console.log("JSON fetched: ");
//        console.log( jsonData);//.InputLocations.concat(jsonData.HiddenLocations));

        //right now, this is a bodyObject with InputLocations, HiddenLocations, and Connections

        //we grab our genomeID
        this.lastObjectID = parseInt(jsonData.GenomeID);

//        console.log('Afterid');

        var inCnt = jsonData.InputLocations.length;
        var hiCnt = jsonData.HiddenLocations.length;

        var data = jsonData.InputLocations.concat(jsonData.HiddenLocations);

        var connections = jsonData.Connections;

        this.theWorld.jsonParseNodeApp(jsonData);

};

smallNS.SmallWorld.prototype.insertBody =  function()
{
    getBody(this.addJSONBody);
}

smallNS.SmallWorld.prototype.pad = function(scale, k) {
    return scale;
//        var range = scale.range();
//        if (range[0] > range[1]) k *= -1;
//        return scale.domain([range[0] - k, range[1] + k].map(scale.invert)).nice();
}