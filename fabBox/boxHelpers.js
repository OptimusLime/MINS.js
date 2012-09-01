
var bHelpNSS = "BoxHelpers";
var bHelpNS = namespace(bHelpNSS);


bHelpNS.ContainedWorld = function(intervalRate, adaptive, width, height, scale, yGravity, sleep, callbacks ) {


        var b2Vec2 = Box2D.Common.Math.b2Vec2;
        var b2BodyDef = Box2D.Dynamics.b2BodyDef;
        var b2Body = Box2D.Dynamics.b2Body;
        var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
        var b2Fixture = Box2D.Dynamics.b2Fixture;
        var b2World = Box2D.Dynamics.b2World;
        var b2MassData = Box2D.Collision.Shapes.b2MassData;
        var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
        var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
        var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
        var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
        var b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
        var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;


    this.callObject = callbacks.object;
    this.addBodyCallback = callbacks.addBody || function(){};
    this.removeBodyCallback = callbacks.removeBody || function(){};
    this.addJointCallback = callbacks.addJoint || function(){};
    this.removeJointCallback = callbacks.removeJoint || function(){};


    this.intervalRate = parseInt(intervalRate);

    this.simulationRate = 1/parseInt(intervalRate);

    this.adaptive = adaptive;
    this.width = width;
    this.height = height;
    this.scale = scale;

    this.bodiesMap = {};
    this.bodiesList = [];
    this.jointsList = [];
    this.muscles = [];

    this.worldObjects = {};

    this.world = new b2World(
        new b2Vec2(0, (yGravity ===undefined ? 10 : yGravity))    //gravity
        ,  (sleep === undefined  ? true : sleep)                //allow sleep
    );

    this.fixDef = new b2FixtureDef;
    this.fixDef.density = 1.0;
    this.fixDef.friction = 0.5;
    this.fixDef.restitution = 0.2;
    var rad = 0;

    this.interpolation = 0;
    this.lastTime = Date.now();

    var accumulator = 0;


//based on principles in here:
//http://gafferongames.com/game-physics/fix-your-timestep/

    this.update = function() {


        var currentTime = Date.now();
        //# of seconds since last time
        var frameTime = (currentTime - this.lastTime)/1000;

        //maximum frame time, to prevent what is called the spiral of death
        if(frameTime > .25)
            frameTime = .25;

        //we don't need last time anymore, set it to the current time
        this.lastTime = currentTime;

        //we accumulate all the time we haven't rendered things in
        accumulator += frameTime;

        while(accumulator >= this.simulationRate)
        {
            //push the muscles outward a bit

            for(var i=0; i < this.muscles.length; i++){
                var muscle = this.muscles[i];
                muscle.SetLength(muscle.m_length + muscle.amplitude/this.scale*Math.sin(muscle.phase*rad));
            }

            //step the physics world

            this.world.Step(
                this.simulationRate   //frame-rate
                ,  10       //velocity iterations
                ,  10       //position iterations
            );

            this.world.ClearForces();

            //increment the radians for the muscles
            rad += 5*this.simulationRate;

            //decrement the accumulator - we ran a chunk just now!
            accumulator -= this.simulationRate;
        }

        this.interpolation = accumulator/this.simulationRate;
        //console.log("Partial: " +  this.interpolation);
        //console.log(rad*180/Math.PI);

        return (Date.now() - currentTime);
    };

    this.jsonParseMINS = function(jsonDoc, documentType)
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
                entities[nodeObj.id] = (Entity.build({id:nodeObj.id, x: parseFloat(nodeObj.x)/this.scale, y: parseFloat(nodeObj.y)/this.scale, radius: .5 }));
            }
        }
        //push our bodies into the system so that our joints have bodies to connect to
        this.setBodies(entities);

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
                        var dJoint = this.addDistanceJoint(linkObj.a, linkObj.b, {frequencyHz: 3, dampingRatio:.1});
                        //dJoint.SetLength(parseFloat(linkObj.restlength)/this.scale);
                    }

                    break;
                case "muscle":
                    for(var s=0; s < aLinks.length; s++)
                    {
                       var musObj = aLinks[s];
                        //need to add into the muscle object-- concept of rest location?
                        //addMuscleJoint
                        //phase: parseFloat(musObj.phase), amplitude: parseFloat(musObj.amplitude)
                       var mJoint = this.addMuscleJoint(musObj.a, musObj.b, {amplitude: parseFloat(musObj.amplitude)});//, phase: parseFloat(musObj.phase)});//{frequencyHz: 5, dampingRatio:.3 });
                       //mJoint.SetLength(parseFloat(musObj.restlength)/this.scale);
                    }

                    break;
            }

        }




    };

    this.addDistanceJoint = function(body1Id, body2Id, params) {
        var body1 = this.bodiesMap[body1Id];
        var body2 = this.bodiesMap[body2Id];
        var joint = new b2DistanceJointDef();
        joint.Initialize(body1, body2, body1.GetWorldCenter(), body2.GetWorldCenter());
        if (params && params['frequencyHz']) joint.frequencyHz = params['frequencyHz'];
        if (params && params['dampingRatio']) joint.dampingRatio = params['dampingRatio'];
        var wJoint =  this.world.CreateJoint(joint);
        //we push our joint into a list of joints created
        this.jointsList.push(wJoint);
        this.addJointCallback.call(this.callObject, wJoint);

        return wJoint;
    };
    this.addMuscleJoint = function(body1Id, body2Id, params) {
        params = params || {};
        var addedJoint = this.addDistanceJoint(body1Id, body2Id, params);
        addedJoint.phase =  params['phase']|| 1;
        addedJoint.amplitude = params['amplitude'] || 1;
        //we push our muscles onto our muscle list
        this.muscles.push(addedJoint);
        return addedJoint;
    };


    this.setBodies = function(bodyEntities) {
        var bodyDef = new b2BodyDef;
        for(var id in bodyEntities) {
            var entity = bodyEntities[id];
            console.log("Adding entity:");
            console.log(entity);

            if (entity.id == 'ground') {
                bodyDef.type = b2Body.b2_staticBody;
            } else {
                bodyDef.type = b2Body.b2_dynamicBody;
            }

            bodyDef.position.x = entity.x;
            bodyDef.position.y = entity.y;
            bodyDef.userData = entity.id;
            bodyDef.angle = entity.angle;
            var body = this.world.CreateBody(bodyDef);


            if (entity.radius) {
                this.fixDef.shape = new b2CircleShape(entity.radius);
                body.CreateFixture(this.fixDef);
            } else if (entity.polys) {
                for (var j = 0; j < entity.polys.length; j++) {
                    var points = entity.polys[j];
                    var vecs = [];
                    for (var i = 0; i < points.length; i++) {
                        var vec = new b2Vec2();
                        vec.Set(points[i].x, points[i].y);
                        vecs[i] = vec;
                    }
                    this.fixDef.shape = new b2PolygonShape;
                    this.fixDef.shape.SetAsArray(vecs, vecs.length);
                    body.CreateFixture(this.fixDef);
                }
            } else {
                this.fixDef.shape = new b2PolygonShape;
                this.fixDef.shape.SetAsBox(entity.halfWidth, entity.halfHeight);
                body.CreateFixture(this.fixDef);
            }

            //we have to register our body AFTER we create the fixture to go with it!
            this.registerBody(body);

        }
        this.ready = true;
    };

    this.registerBody = function(body) {

        this.bodiesMap[body.GetUserData()] = body;
        this.bodiesList.push(body);
        this.addBodyCallback.call(this.callObject, body);
        return body;
    }
    var sentMessage = false;

    //dealing with the mouse clicks
    this.mouseDownAt = function(x, y) {
        if (!this.mouseJoint) {
            if(!sentMessage){
                console.log("Ignoring mouse click - single warning");
                sentMessage = true;
            }

            var body = null;//this.getBodyAt(x, y);
            if (body) {
                var md = new b2MouseJointDef();
                md.bodyA = this.world.GetGroundBody();
                md.bodyB = body;
                md.target.Set(x, y);
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                this.mouseJoint = this.world.CreateJoint(md);
                body.SetAwake(true);
            }
        } else {
            this.mouseJoint.SetTarget(new b2Vec2(x, y));
        }
    }

    this.isMouseDown = function() {
        return (this.mouseJoint != null);
    }

    this.mouseUp = function() {
        this.world.DestroyJoint(this.mouseJoint);
        this.mouseJoint = null;
    }

    //we need to draw things with d3



};

//various entities for easy world creation
function Entity(id, x, y, angle, center, color, strength) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle || 0;
    this.center = center;
    this.color = color || "red";
    this.isHit = false;
    this.strength = strength;
    this.dead = false;
}

var NULL_CENTER = {x:null, y:null};

//builds the various entity types
Entity.build = function(def) {
    if (def.radius) {
        return new CircleEntity(def.id, def.x, def.y, def.angle, NULL_CENTER, def.color, def.strength, def.radius);
    } else if (def.polys) {
        return new PolygonEntity(def.id, def.x, def.y, def.angle, NULL_CENTER, def.color, def.strength, def.polys);
    } else {
        return new RectangleEntity(def.id, def.x, def.y, def.angle, NULL_CENTER, def.color, def.strength, def.halfWidth, def.halfHeight);
    }
};


function CircleEntity(id, x, y, angle, center, color, strength, radius) {
    color = color || 'aqua';
    Entity.call(this, id, x, y, angle, center, color, strength);
    this.radius = radius;
}
CircleEntity.prototype = new Entity();
CircleEntity.prototype.constructor = CircleEntity;

function RectangleEntity(id, x, y, angle, center, color, strength, halfWidth, halfHeight) {
    Entity.call(this, id, x, y, angle, center, color, strength);
    this.halfWidth = halfWidth;
    this.halfHeight = halfHeight;
}
RectangleEntity.prototype = new Entity();
RectangleEntity.prototype.constructor = RectangleEntity;

function PolygonEntity(id, x, y, angle, center, color, strength, polys) {
    Entity.call(this, id, x, y, angle, center, color, strength);
    this.polys = polys;
}
PolygonEntity.prototype = new Entity();
PolygonEntity.prototype.constructor = PolygonEntity;
