//This is where we define our simple experiment, and do all our simulation logic

var smallNSS = "SmallWorld";
var smallNS = namespace(smallNSS);



smallNS.BehaviorTypes = {
    xyCenterOfMass : 0,
    xCenterOfMass : 1,
    yCenterOfMass : 2,
    heatMap10x10 : 3,
    nodeMovements : 4
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

    //we say what kind of behavior we want, then create that object -- should be a function in the future
    this.behaviorType = smallNS.BehaviorTypes.heatMap10x10;
    this.behavior = {};
    this.behavior.frameCount = 0;




    switch(this.behaviorType)
    {
        case smallNS.BehaviorTypes.xCenterOfMass:
        case smallNS.BehaviorTypes.yCenterOfMass:
        case smallNS.BehaviorTypes.xyCenterOfMass:
            this.behavior.points = [];
            break;
        case smallNS.BehaviorTypes.nodeMovements:

            console.log('Making node movement map');
            this.behavior.heatMap = {};

            //determines the effects of structural differences in the behavior metric.
            this.noNodeMultiplier = .2;

            var xSides = 9;
            var ySides = 9;

            var moveDirections = 9;

            for(var x = 0; x < xSides; x++)
            {
                this.behavior.heatMap[x] = {};
                for(var y=0; y < ySides;y++)
                {
                    this.behavior.heatMap[x][y] = {};
                    this.behavior.heatMap[x][y].bCount = 0;
                    for(var w =0; w < moveDirections; w ++)
                    {
                        this.behavior.heatMap[x][y][w] = 0;
                    }
                }
            }

//            this.behavior.heatMap.fabCount = 0;

            break;

        case smallNS.BehaviorTypes.heatMap10x10:
            console.log('Making heatmap');
            this.behavior.heatMap = {};

            var xSides = 10;
            var ySides = 10;
            for(var x = 0; x < xSides; x++)
            {
                this.behavior.heatMap[x] = {};
                for(var y=0; y < ySides;y++)
                {
                    this.behavior.heatMap[x][y]=0;
                }
            }

            this.behavior.heatMap.fabCount = 0;


            break;
    }



    //measure behavior every three frames
    this.behaviorSkipFrames = 5;
    this.beginEvaluation = true;
    //go for about a second?
    this.waitToStartFrames = 45;

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

    this.theWorld = new bHelpNS.ContainedWorld(desiredSmallSimulationSpeed, false, canvasWidth, canvasHeight, scale, 15, false,
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

smallNS.SmallWorld.prototype.runSimulationForBehavior = function(props)
{
    var start = (new Date).getTime();

    var updateDeltaMS = 320;
    this.simulating  = true;

    var updateCount = 0;
    console.log('Eval '+ props.genomeID +' takes:');
//    console.log('Eval Start');
//    console.log('behavior begining: ' + this.behavior.frameCount);

    while(this.behavior.frameCount < this.behaviorTotalCount)
    {
        updateCount++;
       this.update(updateDeltaMS, props);
        if(updateCount > 500){
            console.log('Making 5 hundo updates');
            updateCount = 0;
        }
    }

//    console.log('behavior complete: ' + this.behaviorTotalCount);
    this.simulating = false;

    /* Run a test. */
    var diff = (new Date).getTime() - start;

//    console.log('Eval takes: ' + diff);
    console.log(diff);


    return smallNS.SmallWorld.AdjustBehavior(this.behavior, this.behaviorType);

}

smallNS.SmallWorld.AdjustBehavior = function(behavior, behaviorType)
{

    behavior.fitness = behavior.largestCOMDistance;

    //we create our objects, the first is fitness, but we'll also have
    //novelty, and genomic diversity
    behavior.objectives = [];
    behavior.objectives.push(behavior.fitness);

    switch(behaviorType)
    {
        case smallNS.BehaviorTypes.xCenterOfMass:
        case smallNS.BehaviorTypes.yCenterOfMass:
        case smallNS.BehaviorTypes.xyCenterOfMass:
            //no adjustments to make, all data should be in behavior.points
           return behavior;

        case smallNS.BehaviorTypes.heatMap10x10:
            //number of sides sent in for adjustment
            //along with our heat map
            behavior.heatMap = smallNS.SmallWorld.heatMapAdjustments(behavior.heatMap, 10,10);

            //now flatten the behavior into a list of points
            behavior.points = smallNS.SmallWorld.flattenHeatMap(behavior.heatMap,10,10);
            return behavior;

        case smallNS.BehaviorTypes.nodeMovements:

            behavior.points = smallNS.SmallWorld.flattenNodeMovements(behavior.heatMap,9,9,9);

            return behavior;

    }
}
smallNS.SmallWorld.heatMapAdjustments = function(heatMapBehavior, xSides, ySides)
{
    var totalCount = heatMapBehavior.fabCount;
    var adjustedBehavior = {};
    adjustedBehavior.fabCount = totalCount;

    if(totalCount == 0)
        return heatMapBehavior;

    //first, let's check the bottom row summation
    var bottomSum = 0;

    for(var x=0; x< xSides; x++)
    {
        bottomSum += heatMapBehavior[x][ySides-1]/totalCount;
        bottomSum += heatMapBehavior[x][ySides-2]/totalCount;
    }

    var flatten = false;
    if(bottomSum > .75)
    {
        flatten = true;
    }

    //lets flatten our behavior
    for(var x=0; x < xSides;x++)
    {
        adjustedBehavior[x] = {};

        for(var y=0; y < ySides; y++)
        {
            //if you're an asshole, and spend your time on the bottom, we're going to flatten you!
            //that is, you'll appear like nothing happens on the bottom most layer
            if(flatten && y == ySides -1){
                adjustedBehavior[x][y] = 0;
            }
            //if you're in the second row and you're flattened, we take away your juice too (close to 0)
            else if(flatten && y == ySides-2)
                adjustedBehavior[x][y] = .25*heatMapBehavior[x][y];
            else
            {
               adjustedBehavior[x][y] = heatMapBehavior[x][y];
            }
        }
    }

    return adjustedBehavior;

}
smallNS.SmallWorld.flattenHeatMap = function(heatMap, xSides, ySides)
{
    var flatten = [];
    var totalCount = heatMap.fabCount;
    if(totalCount == 0)
    {
        for(var i=0; i < xSides*ySides; i++)
            flatten.push(0);

        return flatten;
    }

    for(var x=0; x < xSides;x++)
    {
        for(var y=0; y < ySides; y++)
        {
            flatten.push(heatMap[x][y]/totalCount);
        }
    }
    return flatten;
}
smallNS.SmallWorld.flattenNodeMovements = function(heatMap, xSides, ySides, moveDirections)
{
    var flatten = [];

//    var totalCount = heatMap.fabCount;
//    if(totalCount == 0)
//    {
//        for(var i=0; i < xSides*ySides*moveDirections; i++)
//            flatten.push(0);
//
//        return flatten;
//    }

    for(var x=0; x < xSides;x++)
    {
        for(var y=0; y < ySides; y++)
        {
            var totalCount = heatMap[x][y].bCount;

            if(totalCount ==0)
            {
                var flatten = [];
                for(var i=0; i < xSides*ySides*moveDirections; i++)
                    flatten.push(0);

                return flatten;
            }

            for(var w =0; w < moveDirections; w++)
            {
               flatten.push(heatMap[x][y][w]/totalCount);
            }
        }
    }
    return flatten;
}

smallNS.SmallWorld.prototype.update = function(updateDeltaMS, props) {

//    if(typeof updateDeltaMS != 'number' && props != undefined)
//    {
//        props = updateDeltaMS;
//        updateDeltaMS = undefined;
//    }
    try{

    if(! this.simulating)
    {
        if (this.isMouseDown) {
            this.theWorld.mouseDownAt(mouseX, mouseY);
        } else if (this.theWorld.isMouseDown()) {
            this.theWorld.mouseUp();
        }
    }

//    console.log('Update?');

//        console.log('Update the world');
     var updateInfo = this.theWorld.update(updateDeltaMS, props);

//    console.log('Steps in update: ' + updateInfo.stepCount);

//        if(!props.visual)
//            console.log('Update the behavior');


        this.calculateBehavior(updateInfo.stepCount);

//        if(!props.visual)
//             console.log('Done the behavior');
    }

    catch(e)
    {
        console.log('Major error: ');
        console.log(e);
        console.log(e.message);
//        console.log(e.getStackTrace());
        throw e;
    }

}

smallNS.SmallWorld.prototype.calculateBehavior = function(stepsTaken)
{
    //we're done with our behavior!
    if(this.behavior.frameCount >= this.behaviorTotalCount)
        return;

    //only grab it when you wants it (depending on frames to skip)
    //so we add our frame count.
    //this tells us how many frames we've seen
    this.frameCount += stepsTaken;


    //need to make sure we don't start evaluating until a certain number of frames occurs (i.e. the object is falling from the skies!)
    if(this.beginEvaluation && this.frameCount < this.waitToStartFrames)
        return;
    else if(this.beginEvaluation && this.frameCount >= this.waitToStartFrames)
    {
        this.frameCount -= this.waitToStartFrames;
        this.beginEvaluation = false;
    }

    //we want to take a snapshot every 3 frames for instance
    //if we've only gone two simulation steps, ignore this!
    if(this.frameCount < this.behaviorSkipFrames)
        return;

    //every update, we should calculate behavior, but we keep these separate calls, since it may be expensive in some scenarios
    var com = this.theWorld.nodesCenterOfMass();

    var startCom = this.behavior.startingCOM;
    var dist = {x: (startCom.x - com.x)*(startCom.x - com.x), y: (startCom.y - com.y)*(startCom.y - com.y)};

    if(!this.behavior.largestCOMDistance)
        this.behavior.largestCOMDistance = 0.000001;

    //we check to see the largest distance accumulated so far from the start
    //we can use this in fitness or local competition calculates
    this.behavior.largestCOMDistance =  Math.max(this.behavior.largestCOMDistance, Math.sqrt(dist.x));

//    console.log('Rec dist: ');
//    console.log(this.behavior.largestCOMDistance);

    //we actually will assume this body position for multiple frames if there is an accidental skip or something
    while(this.frameCount >= this.behaviorSkipFrames)
    {
        //update framecount on behavior for all behavior types!
        this.behavior.frameCount++;
        switch(this.behaviorType)
        {
            case smallNS.BehaviorTypes.xyCenterOfMass:
                this.behavior.points.push({x:com.x, y: com.y});

                break;
            case smallNS.BehaviorTypes.xCenterOfMass:
                this.behavior.points.push(com.x);

                break;
            case smallNS.BehaviorTypes.yCenterOfMass:
                this.behavior.points.push(com.y);
                break;


            case smallNS.BehaviorTypes.nodeMovements:

                //we don't have a difference in node locations, skip it!
                if(!com.lastNodeLocations)
                    break;

                var killEverything = 0;

                var xSides =9;
                var ySides = 9;
                var moveDirections = 9;
                //this is a bit more complicated, we have to break down where every node is
                //and increment the locations where nodes exist (relative to the center of gravity)
                for(var i=0; i < xSides*ySides; i++)
                {
                    if(i >= com.nodeLocations.length)
                    {
                        var xIx = Math.floor(i%xSides);//Math.floor((centeredLoc.x/(this.canvasWidth/2) + 1)/2*xSides);
                        var yIx = Math.floor(i/ySides);//Math.floor(centeredLoc.y/this.canvasHeight*ySides);

                        for(var w =0; w < moveDirections; w++)
                            this.behavior.heatMap[xIx][yIx][w] = -1*this.noNodeMultiplier;

                        //i don't think we mess with fabCounts
//                        this.behavior.heatMap.fabCount++;

                        //on to the next please!
                        continue;
                    }
//                    var prevCentered = {x: com.lastNodeLocations[i].x - com.x, y: com.lastNodeLocations[i].y - com.y};
//                    var centeredLoc = {x: com.nodeLocations[i].x - com.x, y: com.nodeLocations[i].y-com.y};

                    var difference = {x: com.nodeLocations[i].x - com.lastNodeLocations[i].x, y: com.nodeLocations[i].y - com.lastNodeLocations[i].y};

                    if(isNaN(difference.x) || isNaN(difference.y)) //|| isNaN(prevCentered.x) || isNaN(prevCentered.y))
                    {
                        continue;
                    }

                    var xDim = Math.floor(i%xSides);//Math.floor((centeredLoc.x/(this.canvasWidth/2) + 1)/2*xSides);
                    var yDim = Math.floor(i/ySides);//Math.floor(centeredLoc.y/this.canvasHeight*ySides);


                    if(difference.x == 0 && difference.y == 0)
                    {
                        this.behavior.heatMap[xDim][yDim][moveDirections-1]++;
                        this.behavior.heatMap.fabCount++;
                        continue;
                    }

                    var angle = Math.atan2(difference.y, difference.x);

                    //angle between -pi and pi,

                    //find out where we are in fractional terms -- i.e. 45 degrees = pi/4 = 1/8 of 2PI -- implies first index in array of 8
                    angle = (angle + Math.PI)/(2*Math.PI);
                    //you shouldn't select the last index ever, but you can get up to
                    //i.e. if i have 8 divisions, angle*8 goes from 0 to 8 -- but in reality, we have indexes from 0 to 7.
                    //it only can be eight if we equal exactly PI, so we just make sure not to do that by accident.
                    var ix = Math.max(0, Math.min(moveDirections-2,  Math.floor(angle*(moveDirections-1))));

                    try
                    {

                       this.behavior.heatMap[xDim][yDim][ix]++;
                       this.behavior.heatMap[xDim][yDim].bCount++;

                    }
                    catch(e)
                    {
                        console.log('Printing com error: ');
                        console.log(e.message);
                        throw e;
                    }

                }

                break;

            case smallNS.BehaviorTypes.heatMap10x10:

                var killEverything = 0;

                var xSides =10;
                var ySides = 10;
                //this is a bit more complicated, we have to break down where every node is
                //and increment the locations where nodes exist (relative to the center of gravity)
                for(var i=0; i < com.nodeLocations.length; i++)
                {
                    var centeredLoc = {x: com.nodeLocations[i].x - com.x, y: com.nodeLocations[i].y};

                    if(isNaN(centeredLoc.x) || isNaN(centeredLoc.y))
                    {
//                        console.log('skip a lot ' + i);
                        //don't process
                        continue;
//                        killEverything = true;
//
//                        for(var x = 0; x <xSides; x++ )
//                            for(var y=0; y < ySides; y++)
//                               this.behavior.heatMap[x][y] = 0;
//
//                        console.log('Everything died');
//
//                        break;
                    }

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
                    try
                    {
                    this.behavior.heatMap[xDim][yDim]++;
                    this.behavior.heatMap.fabCount++;
                    }
                    catch(e)
                    {
                        console.log('Printing com: ');
                        this.theWorld.nodesCenterOfMass(true);
                        console.log('Center: ' + centeredLoc.x);
                        console.log('Canvas width: ' + this.canvasWidth);
                        console.log('Com :'); console.log(com);
                        console.log('Xdim: ' + xDim + ' yDim: ' + yDim);
//                        console.log('Node loc: ');
//                        console.log(com.nodeLocations);
//                        console.log('Node behavior');
//                        console.log(this.behavior.heatMap);
                        console.log(e.message);
                        throw e;
                    }

                }

                break;
        }

        this.behavior.lastNodeLocations = com;

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
smallNS.SmallWorld.prototype.shouldDrawBehavior = function(boolValue, showRawBehavior)
{

    this.drawObject.drawBehavior = boolValue;
    this.drawObject.showRawBehavior = (showRawBehavior) ? true : false;

}

smallNS.SmallWorld.prototype.zombieMode = function(boolValue)
{
    this.drawObject.zombieMode = boolValue;
}

smallNS.SmallWorld.prototype.freezeLoop = function(boolValue)
{
    this.refuseStartLoop = boolValue;
    if(boolValue)
        this.stopLoop();

}
smallNS.SmallWorld.prototype.startLoop = function()
{
    if(this.refuseStartLoop)
        return;

    var props = {visual: true};

    //for a smooth transition, just make the start time be now!
    this.theWorld.lastTime = Date.now();
    this.interruptLoop = false;
    //closure should allow for this variable to be called from the loop. Hoo-ray?
    var smallWorld = this;
//    this.init();
    (function loop(animStart) {
        if(!smallWorld)
            return;

        smallWorld.update(undefined, {visual:true});
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
        this.behavior.startingCOM = this.theWorld.nodesCenterOfMass();

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
};
smallNS.SmallWorld.prototype.jsonParseMINS = function(jsonDoc, documentType)
{
    //The structure of the json is as follows

    //All the bodies are inside of nodes
    //should all be of type "mass" or "node"

    //so let's create our bodies
    var oNodes = jsonDoc.model.nodes;

    var entities = {};
    for(var nodeType in oNodes)
    {
        //node type doesn't matter as much as our documentType

        var aBodies = oNodes[nodeType];

        for(var b=0; b < aBodies.length; b++)
        {
            var nodeObj = aBodies[b];
            entities[nodeObj.id] = (Entity.build({id:nodeObj.id,
                x: (parseFloat(nodeObj.x)- this.canvasWidth/1.3)/this.scale,
                y: (this.canvasHeight -parseFloat(nodeObj.y))/this.scale - this.canvasHeight/(2*this.scale),
                vx: parseFloat(nodeObj.vx)/this.scale,
                vy: parseFloat(nodeObj.vy)/this.scale,
                radius: .5

            }));
        }
    }
    //push our bodies into the system so that our joints have bodies to connect to
    this.theWorld.setBodies(entities);

    var oLinks = jsonDoc.model.links;
    for(var linkType in oLinks)
    {
        //link type matters for generating muscles or distance joints

        var aLinks = oLinks[linkType];

        switch(linkType)
        {
            case "spring":
                for(var l=0; l < aLinks.length; l++)
                {
                    var linkObj = aLinks[l];
                    //need to add the spring object info -- so springyness and what have you
                    //maybe also the rest length? Does that matter?
                    var dJoint = this.theWorld.addDistanceJoint(linkObj.a, linkObj.b, {frequencyHz: 15, dampingRatio:.1});

                    dJoint.SetLength(parseFloat(linkObj.restlength)/this.scale);
                }

                break;
            case "muscle":
                for(var s=0; s < aLinks.length; s++)
                {
                    var musObj = aLinks[s];
                    //need to add into the muscle object-- concept of rest location?
                    //addMuscleJoint
                    //phase: parseFloat(musObj.phase), amplitude: parseFloat(musObj.amplitude)
                    var mJoint = this.theWorld.addMuscleJoint(musObj.a, musObj.b, {amplitude: 1.6*parseFloat(musObj.amplitude), phase: parseFloat(musObj.phase)});//, frequencyHz: 15, dampingRatio:.1 });

                    var aCenter = this.theWorld.bodiesMap[musObj.a].GetWorldCenter();
                    var bCenter =  this.theWorld.bodiesMap[musObj.b].GetWorldCenter();
                    console.log('A center: ' + aCenter);
                    console.log('B center: ' + bCenter);

                    console.log('Dist dif: ' + 14*Math.sqrt(Math.pow(aCenter.x- bCenter.x,2) + Math.pow(aCenter.y - bCenter.y, 2) ));
                    console.log('Amp: ' + parseFloat(musObj.amplitude) + ' Rest: ' +  parseFloat(musObj.restlength));

                    mJoint.SetLength(parseFloat(musObj.restlength)/this.scale);
                }

                break;
        }

    }
    this.behavior.startingCOM = this.theWorld.nodesCenterOfMass();
};