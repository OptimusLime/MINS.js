



function containedWorld(intervalRate, adaptive, width, height, scale, yGravity, sleep ) {

    (function() {

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


    })();


    this.intervalRate = parseInt(intervalRate);
    this.adaptive = adaptive;
    this.width = width;
    this.height = height;
    this.scale = scale;

    this.bodiesMap = {};

    this.world = new b2World(
        new b2Vec2(0, (yGravity ===undefined ? 10 : yGravity))    //gravity
        ,  (sleep === undefined  ? true : sleep)                //allow sleep
    );

    this.fixDef = new b2FixtureDef;
    this.fixDef.density = 1.0;
    this.fixDef.friction = 0.5;
    this.fixDef.restitution = 0.2;


    this.addDistanceJoint = function(body1Id, body2Id, params) {
        var body1 = this.bodiesMap[body1Id];
        var body2 = this.bodiesMap[body2Id];
        var joint = new b2DistanceJointDef();
        joint.Initialize(body1, body2, body1.GetWorldCenter(), body2.GetWorldCenter());
        if (params && params['frequencyHz']) joint.frequencyHz = params['frequencyHz'];
        if (params && params['dampingRatio']) joint.dampingRatio = params['dampingRatio'];
        return this.world.CreateJoint(joint);
    }


   this.mouseDownAt = function(x, y) {
        if (!this.mouseJoint) {
            var body = this.getBodyAt(x, y);
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






}
