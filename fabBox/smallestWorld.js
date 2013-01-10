//This is where we define our simple experiment, and do all our simulation logic

var smallNSS = "SmallWorld";
var smallNS = namespace(smallNSS);



smallNS.BehaviorTypes = {
    xyCenterOfMass : 0,
    xCenterOfMass : 1,
    yCenterOfMass : 2,
    heatMap10x10 : 3
}

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
smallNS.SmallWorld = function(sCanvasID, canvasWidth, canvasHeight, scale, zombieMode) {

    this.worldID = worldId + 0;

    worldId++;

    this.scale = scale;
    //make sure to save our canvasID for generating html string
    this.canvasID = sCanvasID;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.behaviorType = smallNS.BehaviorTypes.heatMap10x10;

    switch(this.behaviorType)
    {
        case smallNS.BehaviorTypes.xCenterOfMass:
        case smallNS.BehaviorTypes.yCenterOfMass:
        case smallNS.BehaviorTypes.xyCenterOfMass:
            this.behavior = [];
            break;
        case smallNS.BehaviorTypes.heatMap10x10:
            this.behavior = {};
            var xSides = 10;
            var ySides = 10;
            for(var x = 0; x < xSides; x++)
            {
                this.behavior[x] = {};
                for(var y=0; y < ySides;y++)
                {
                    this.behavior[x][y]=0;
                }
            }
            this.behavior.fabCount = 0;
            this.behavior.length = 0;

            break;
    }



    //measure behavior every three frames
    this.behaviorSkipFrames = 5;
    //30 frames/sec, skip 3 frames, = 10 frames a second
    //50 behaviors = 5 seconds
    this.behaviorTotalCount = 75;
    this.frameCount  = 0;

    this.initialSmallState = [
        {id: "ground", x: canvasWidth / 2 / scale, y: canvasHeight / scale, halfHeight: 0.5, halfWidth: 4*canvasWidth / scale, color: 'black'}
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
    //if we start in zombie mode, we won't process any added objects for drawing, nor do we initialize canvas
    this.drawObject = new boxNS.DrawingObject(sCanvasID, canvasWidth, canvasHeight, scale, zombieMode);

    this.drawObject.addBehavior(this.behavior, this.behaviorType);

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
    return '<div id=' + divID + ' class="element width2 height2"><canvas id=' + canvasID + ' width=' + height + ' height=' + height + ' class="canvas"></canvas></div>';
};

smallNS.SmallWorld.prototype.draw = function() {
    //console.log("d");
    this.drawObject.drawWorld(this.theWorld.interpolation, this.theWorld.nodesCenterOfMass());
}

smallNS.SmallWorld.prototype.runSimulationForBehavior = function()
{
    var start = (new Date).getTime();

    var updateDeltaMS = 320;
    this.simulating  = true;

    while(this.behavior.length < this.behaviorTotalCount)
        this.update(updateDeltaMS);

    this.simulating = false;

    /* Run a test. */
    var diff = (new Date).getTime() - start;

    console.log('Eval takes: ' );
    console.log(diff);

    var squishedBehavior;
    switch(this.behaviorType)
    {
        case smallNS.BehaviorTypes.xCenterOfMass:
        case smallNS.BehaviorTypes.yCenterOfMass:
        case smallNS.BehaviorTypes.xyCenterOfMass:
            squishedBehavior = this.behavior;
            break;
        case smallNS.BehaviorTypes.heatMap10x10:
            var xSides = 10, ySides = 10;
            var totalCount = this.behavior.fabCount;
            squishedBehavior = [];

            if(totalCount == 0)
            {
                squishedBehavior = [];
                break;
            }
            //first, let's check the bottom row summation
            var bottomSum = 0;

            for(var x=0; x< xSides; x++)
            {
                bottomSum += this.behavior[x][ySides-1]/totalCount;
            }

//            console.log('Bottom sum: ' + bottomSum);

            var flatten = false;

            if(bottomSum > .75)
                flatten = true;

            //lets flatten our behavior
            for(var x=0; x < xSides;x++)
            {
                for(var y=0; y < ySides; y++)
                {
                    //if you're an asshole, and spend your time on the bottom, we're going to flatten you!
                    //that is, you'll appear like nothing happens on the bottom most layer
                    if(flatten && y == ySides -1)
                        squishedBehavior.push(0);
                    else
                        squishedBehavior.push(this.behavior[x][y]/totalCount);
                }
            }
            break;

    }

    return squishedBehavior;
}

smallNS.SmallWorld.prototype.update = function(updateDeltaMS) {

    if(! this.simulating)
    {
        if (this.isMouseDown) {
            this.theWorld.mouseDownAt(mouseX, mouseY);
        } else if (this.theWorld.isMouseDown()) {
            this.theWorld.mouseUp();
        }
    }

//    console.log('Update?');

   var updateInfo = this.theWorld.update(updateDeltaMS);

//    console.log('Steps in update: ' + updateInfo.stepCount);

    this.calculateBehavior(updateInfo.stepCount);

}

smallNS.SmallWorld.prototype.calculateBehavior = function(stepsTaken)
{
    //we're done with our behavior!
    if(this.behavior.length >= this.behaviorTotalCount)
        return;

    //only grab it when you wants it (depending on frames to skip)
    //so we add our frame count.
    //this tells us how many frames we've seen
    this.frameCount += stepsTaken;

    //we want to take a snapshot every 3 frames for instance
    //if we've only gone two simulation steps, ignore this!
    if(this.frameCount < this.behaviorSkipFrames)
        return;

    //every update, we should calculate behavior, but we keep these separate calls, since it may be expensive in some scenarios
    var com = this.theWorld.nodesCenterOfMass();

    //we actually will assume this body position for multiple frames if there is an accidental skip or something
    while(this.frameCount >= this.behaviorSkipFrames)
    {
        switch(this.behaviorType)
        {
            case smallNS.BehaviorTypes.xyCenterOfMass:
                this.behavior.push({x:com.x, y: com.y});

                break;
            case smallNS.BehaviorTypes.xCenterOfMass:
                this.behavior.push(com.x);

                break;
            case smallNS.BehaviorTypes.yCenterOfMass:
                this.behavior.push(com.y);

            case smallNS.BehaviorTypes.heatMap10x10:

                this.behavior.length++;

                var xSides =10;
                var ySides = 10;
                //this is a bit more complicated, we have to break down where every node is
                //and increment the locations where nodes exist (relative to the center of gravity)
                for(var i=0; i < com.nodeLocations.length; i++)
                {
                    var centeredLoc = {x: com.nodeLocations[i].x - com.x, y: com.nodeLocations[i].y};

                    var xDim = Math.floor((centeredLoc.x/(this.canvasWidth/2) + 1)/2*xSides);
                    var yDim = Math.floor(centeredLoc.y/this.canvasHeight*ySides);

                    //outside of our heatmap, doesn't count!
                    if(xDim < 0 || xDim > xSides-1 || yDim < 0 || yDim > ySides -1)
                        continue;

//                    xDim = Math.max(0,Math.min(xDim, xSides-1));
//                    yDim = Math.max(0,Math.min(yDim, ySides-1));

//                    console.log('Dim found- x: ' + xDim + " y: " + yDim);
//                    console.log('X location: ' + centeredLoc.x + ' halfwidth: ' +
//                        this.canvasWidth/2 + ' div: ' +(centeredLoc.x/(this.canvasWidth/2) + 1)/2 + ' xDim: ' +xDim);

//                    console.log('Y location: ' + centeredLoc.y + ' yHeight: ' +
//                        this.canvasHeight + ' yDim: ' +yDim);

                    this.behavior[xDim][yDim]++;
                    this.behavior.fabCount++;
                }

                break;
        }

        this.frameCount -= this.behaviorSkipFrames;
    }





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

smallNS.SmallWorld.prototype.shouldDraw = function(boolValue)
{
    this.drawObject.turnOffDrawing = !boolValue;

}
smallNS.SmallWorld.prototype.shouldDrawBehavior = function(boolValue)
{

    this.drawObject.drawBehavior = boolValue;
}

smallNS.SmallWorld.prototype.zombieMode = function(boolValue)
{
    this.drawObject.zombieMode = boolValue;
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
        if(!smallWorld)
            return;

        smallWorld.update();
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
