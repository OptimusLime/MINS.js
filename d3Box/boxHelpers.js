
var bHelpNSS = "BoxHelpers";
var bHelpNS = namespace(bHelpNSS);


bHelpNS.ContainedWorld = function(intervalRate, adaptive, width, height, scale, yGravity, sleep ) {


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

    this.intervalRate = parseInt(intervalRate);
    this.adaptive = adaptive;
    this.width = width;
    this.height = height;
    this.scale = scale;

    this.bodiesMap = {};
    this.bodiesList = [];

    this.worldObjects = {};

    this.world = new b2World(
        new b2Vec2(0, (yGravity ===undefined ? 10 : yGravity))    //gravity
        ,  (sleep === undefined  ? true : sleep)                //allow sleep
    );

    this.fixDef = new b2FixtureDef;
    this.fixDef.density = 1.0;
    this.fixDef.friction = 0.5;
    this.fixDef.restitution = 0.2;

    this.update = function() {
        var start = Date.now();
        var stepRate = (this.adaptive) ? (now - this.lastTimestamp) / 1000 : (1 / this.intervalRate);

        this.world.Step(
            stepRate   //frame-rate
            ,  10       //velocity iterations
            ,  10       //position iterations
        );
        this.world.ClearForces();

        return (Date.now() - start);
    };

    /*      console.log("Bo list");

     for (var b = this.world.GetBodyList(); b; b = b.m_next) {
     if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
     console.log(b.GetPosition());
     }
     }

     console.log("--");*/

    this.addDistanceJoint = function(body1Id, body2Id, params) {
        var body1 = this.bodiesMap[body1Id];
        var body2 = this.bodiesMap[body2Id];
        var joint = new b2DistanceJointDef();
        joint.Initialize(body1, body2, body1.GetWorldCenter(), body2.GetWorldCenter());
        if (params && params['frequencyHz']) joint.frequencyHz = params['frequencyHz'];
        if (params && params['dampingRatio']) joint.dampingRatio = params['dampingRatio'];
        return this.world.CreateJoint(joint);
    };


    this.setBodies = function(bodyEntities) {
        var bodyDef = new b2BodyDef;

        for(var id in bodyEntities) {
            var entity = bodyEntities[id];

            if (entity.id == 'ground') {
                bodyDef.type = b2Body.b2_staticBody;
            } else {
                bodyDef.type = b2Body.b2_dynamicBody;
            }

            bodyDef.position.x = entity.x;
            bodyDef.position.y = entity.y;
            bodyDef.userData = entity.id;
            bodyDef.angle = entity.angle;
            var body = this.registerBody(bodyDef);

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

        }
        this.ready = true;
    };

    this.registerBody = function(bodyDef) {
        var body = this.world.CreateBody(bodyDef);
        this.bodiesMap[body.GetUserData()] = body;
        this.bodiesList.push(body);
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
