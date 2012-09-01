//Class for drawing box2D objects - using fabric and cavnas/SVG -- should get us some benefits where possible

var boxNSS = "BoxDrawing";
var boxNS = namespace(boxNSS);
var b2Math = Box2D.Common.Math.b2Math,
    b2Joint = Box2D.Dynamics.Joints.b2Joint,
    b2PulleyJoint = Box2D.Dynamics.Joints.b2PulleyJoint,
    b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2Shape = Box2D.Collision.Shapes.b2Shape,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;

boxNS.DrawingObject = function(sDrawElementName, iWidth, iHeight, scale)
{
    //for creating IDs for our drawing objects
    this.idCount = 0;

    //do we actually want to draw using the fabricJS library - can toggle
    this.turnOffDrawing = false;
    //create fabric object, render only when we call
    //and disable global selection (i.e. drag rectangle)
    this.fabricCanvas = new fabric.Canvas(sDrawElementName, { renderOnAddition: false});
    this.fabricCanvas.selection = false;

    //we set the scale, and then initialize the drawObjects
    this.drawScale = scale || 1;
    this.drawObjects = {bodies:{}, joints:{}};
};

//some helpers for the class

boxNS.DrawingObject.prototype.peekNextID = function()
{
    return this.idCount;
};
boxNS.DrawingObject.prototype.getNextID = function()
{
    return this.idCount++;
};

//for scaling a vector
boxNS.DrawingObject.scalePoint = function(p, drawScale, modifyInPlace)
{
    if(!modifyInPlace)
        return new b2Vec2(p.x*drawScale, p.y*drawScale);
    else
    {
        p.x *= drawScale; p.y*=drawScale;
        return p;
    }

};

//for adding in world objects all at once (you can do this one at a time if you prefer
//in the future, I think it would be best to do this individually
boxNS.DrawingObject.prototype.setWorldObjects = function(aWorldObjects)
{

    //for now, we use this as an opportunity to add an object
    //in reality, we're going to make a hook where we get a callback when a physics object is inserted or removed
    for(var j=0; j < aWorldObjects.joints.length; j++)
    {
        this.addJoint(aWorldObjects.joints[j]);
    }
    for(var b=0; b < aWorldObjects.bodies.length; b++)
    {
        this.addBody(aWorldObjects.bodies[b]);
    }


    if(!this.turnOffDrawing)
        this.fabricCanvas.renderAll();


};

boxNS.DrawingObject.prototype.drawWorld = function(alphaInterpolate)
{

    for(var jID in this.drawObjects.joints)
    {
        this.drawFabricJoint(this.drawObjects.joints[jID], alphaInterpolate);
    }
    for(var bID in this.drawObjects.bodies)
    {
        this.drawFabricBody(this.drawObjects.bodies[bID],alphaInterpolate);
    }

    if(!this.turnOffDrawing)
        this.fabricCanvas.renderAll();

};
boxNS.DrawingObject.interpolatePoint = function(pNew, pOld, alpha)
{
    pNew.x = alpha*pNew.x + (1-alpha)*pOld.x;
    pNew.y = alpha*pNew.y + (1-alpha)*pOld.y;
    return pNew;
}
boxNS.DrawingObject.interpolatePoints = function(aCurrent, aOld, fAlpha)
{
    for(var i=0; i < aCurrent.length; i++)
    {
        aCurrent[i] =  boxNS.DrawingObject.interpolatePoint(aCurrent[i], aOld[i], fAlpha);
    }
    return aCurrent;
}
//For updating/drawing bodies or joints
boxNS.DrawingObject.prototype.drawFabricBody = function(drawObj,alphaInterpolate)
{
    alphaInterpolate = alphaInterpolate || 1;

    var info = this.shapeInfo(drawObj.body, drawObj.shape);
    var fabObj = drawObj.fabric;

    switch (drawObj.shape.m_type) {
        case b2Shape.e_circleShape:
        {
            fabObj.left = info.center.x*alphaInterpolate + fabObj.left*(1-alphaInterpolate);
            fabObj.top = info.center.y*alphaInterpolate + fabObj.top*(1-alphaInterpolate);
        }
            break;
        case b2Shape.e_polygonShape:
        {
            fabObj.points = boxNS.DrawingObject.interpolatePoints(info.vertices, fabObj.points, alphaInterpolate);  //info.vertices;
            fabObj._calcDimensions();
        }
            break;
        case b2Shape.e_edgeShape:
        default:
            console.log("don't know how to draw this object type");
            break;
    }

};

boxNS.DrawingObject.prototype.drawFabricJoint = function(drawObj, alphaInterpolate)
{
    var info = this.jointInfo(drawObj.joint);

    var fabObj = drawObj.fabric;
    fabObj.points = boxNS.DrawingObject.interpolatePoints(info.points, fabObj.points, alphaInterpolate);//info.points;
    fabObj._calcDimensions();

};


//ADD BODY/ ADD JOINT
boxNS.DrawingObject.prototype.addBody = function(dBody)
{
    if(dBody.drawID != undefined)
    {
        console.log("Already tagged with ID: " + dBody.drawID);
        return;
    }

    dBody.drawID = this.getNextID();

    var shape = dBody.GetFixtureList().GetShape();
    var info = this.shapeInfo(dBody, shape);

    switch (shape.m_type) {
        case b2Shape.e_circleShape:
        {

            var fabCircle  = new fabric.Circle({ radius: info.radius, fill: '#f55', left: info.center.x, top:  info.center.y });

            //we've created a drawID already, link the two
            fabCircle.drawID = dBody.drawID;

            this.drawObjects.bodies[dBody.drawID] = {index: this.fabricCanvas.getObjects().length, fabric: fabCircle, body: dBody, shape: shape, bodyType: shape.m_type};

            //add it to our canvas
            this.fabricCanvas.add(fabCircle);

        }
            break;
        case b2Shape.e_polygonShape:
        {
            //the info object has the vertices in it already - scaled up by drawscale

            //this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
            var fabPoly  = new fabric.Polygon(info.vertices, {fill: '#5f5'});
            //we've created a drawID already, link the two
            fabPoly.drawID = dBody.drawID;

            this.drawObjects.bodies[dBody.drawID] = {index: this.fabricCanvas.getObjects().length, fabric: fabPoly, body: dBody, shape: shape, bodyType: shape.m_type};

            //add it to our canvas
            this.fabricCanvas.add(fabPoly);

        }
            break;
        case b2Shape.e_edgeShape:
        {
            console.log("Don't know how to add edge shapes. What does that mean?");
            //var edge = (shape instanceof b2EdgeShape ? shape : null);
            //this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
        }
            break;
    }
};
boxNS.DrawingObject.prototype.addJoint = function(joint)
{
    if(joint.drawID != undefined)
    {
        console.log("Already tagged joint with ID: " + joint.drawID);
        return;
    }

    joint.drawID = this.getNextID();

    var info = this.jointInfo(joint);

    //create our poly line for this joint (normally just 2 points really)
    var fabPolyLine =  new fabric.Polyline(info.points, {fill: '#55f', stroke: '#55f'});
    fabPolyLine.drawID = joint.drawID;

    this.drawObjects.joints[joint.drawID] = {index: this.fabricCanvas.getObjects().length, fabric: fabPolyLine, joint: joint, jointType: joint.m_type};

    //add it to our canvas

    //but joints get inserted before bodies (if any exist)
    this.fabricCanvas.insertAt(fabPolyLine);

};


//DELTEING BODIES AND JOINTS
boxNS.DrawingObject.prototype.removeBody = function(joint)
{
    console.log("unhandled delete body");
};

boxNS.DrawingObject.prototype.removeJoint = function(joint)
{
    console.log("unhandled delete joint");

};

//INFO for joints,bodies, etc

boxNS.DrawingObject.prototype.jointInfo = function(joint)
{
    var b1 = joint.GetBodyA();
    var b2 = joint.GetBodyB();
    var xf1 = b1.m_xf;
    var xf2 = b2.m_xf;
    var x1 =  boxNS.DrawingObject.scalePoint(xf1.position, this.drawScale);
    var x2 =  boxNS.DrawingObject.scalePoint(xf2.position, this.drawScale);

    var p1 = boxNS.DrawingObject.scalePoint(joint.GetAnchorA(), this.drawScale);
    var p2 = boxNS.DrawingObject.scalePoint(joint.GetAnchorB(), this.drawScale);
//    var color = b2World.s_jointColor;
    var info = {points:[]};
    switch (joint.m_type) {
        case b2Joint.e_distanceJoint:
            info.points.push(p1, p2);
            break;
        case b2Joint.e_pulleyJoint:
        {
            var pulley = ((joint instanceof b2PulleyJoint ? joint : null));
            var s1 = boxNS.DrawingObject.scalePoint(pulley.GetGroundAnchorA(), this.drawScale);
            var s2 = boxNS.DrawingObject.scalePoint(pulley.GetGroundAnchorB(), this.drawScale);
            info.points.push(p1, s1,s2,p2);
        }
            break;
        case b2Joint.e_mouseJoint:
            info.points.push(p1,p2);
            break;
        default:
            if (b1 != this.m_groundBody) info.points.push(x1);
            info.points.push(p1,p2);
            if (b2 != this.m_groundBody) info.points.push(x2);
    }

    return info;
};

//Shape info for a body, routes to the various circles/polygons
boxNS.DrawingObject.prototype.shapeInfo = function(dBody, shape)
{
    switch (shape.m_type) {
        case b2Shape.e_circleShape:
            return this.circleInfo(dBody, ((shape instanceof b2CircleShape ? shape : null)) );
        case b2Shape.e_polygonShape:
            return this.polygonInfo(dBody, ((shape instanceof b2PolygonShape ? shape : null)));
        case b2Shape.e_edgeShape:
            console.log("No shape info for this type");
            return null;
        default:
            console.log("Don't know this shape type, returning null info");
            return null;
    }
};
//circle shape
boxNS.DrawingObject.prototype.circleInfo = function(dBody, circle)
{
    if(!circle)
        return null;

    var cInfo = {center:b2Math.MulX(dBody.m_xf, circle.m_p) ,
        radius:this.drawScale*circle.m_radius };
    //need to scale the x and y
    cInfo.center.x *= this.drawScale;
    cInfo.center.y *= this.drawScale;

    return cInfo;
};
//polygon shape
boxNS.DrawingObject.prototype.polygonInfo = function(dBody, poly)
{
    var vertexCount = parseInt(poly.GetVertexCount());
    var localVertices = poly.GetVertices();
    var vertices = new Vector(vertexCount);
    for (var i = 0;
         i < vertexCount; ++i) {
        var b2Temp = b2Math.MulX(dBody.m_xf, localVertices[i]);
        vertices[i] = new b2Vec2(b2Temp.x*this.drawScale, b2Temp.y*this.drawScale);
    }

    return {vertices:vertices};
};



