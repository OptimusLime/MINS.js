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
    this.idCount = 0;

    this.turnOffDrawing = false;
    this.fabricCanvas = new fabric.Canvas(sDrawElementName, { renderOnAddition: false});
    this.fabricCanvas.selection = false;
    //this.x = d3.scale.linear()
    //  .domain([0, iWidth])
    //.range([0, iWidth]);
    //this.y = d3.scale.linear()
    //  .domain([0, iHeight])
    //.range([0, iHeight]);
    this.drawScale = scale || 1;
    this.drawObjects = {bodies:{}, joints:{}};


    //this.drawingElement  = d3.select(sDrawElementName)
    //  .append("svg")
    //.style("background-color", "#333333")
    //.attr("width", iWidth + "px")
    //.attr("height", iHeight + "px");
};

boxNS.DrawingObject.prototype.peekNextID = function()
{
    return this.idCount;
};
boxNS.DrawingObject.prototype.getNextID = function()
{
    return this.idCount++;
};
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
            var edge = (shape instanceof b2EdgeShape ? shape : null);
            //this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
        }
            break;
    }




}
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
    this.fabricCanvas.add(fabPolyLine);

}
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
}
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
}
boxNS.DrawingObject.prototype.polygonInfo = function(dBody, poly)
{
    var i = 0;
    var vertexCount = parseInt(poly.GetVertexCount());
    var localVertices = poly.GetVertices();
    var vertices = new Vector(vertexCount);
    for (i = 0;
         i < vertexCount; ++i) {
        var b2Temp = b2Math.MulX(dBody.m_xf, localVertices[i]);
        vertices[i] = new b2Vec2(b2Temp.x*this.drawScale, b2Temp.y*this.drawScale);
    }

    return {vertices:vertices};
};


boxNS.DrawingObject.scalePoint = function(p, drawScale)
{
    return new b2Vec2(p.x*drawScale, p.y*drawScale);
}
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
            var cnt = 0;
            if (b1 != this.m_groundBody) info.points.push(x1);
            info.points.push(p1,p2);
            if (b2 != this.m_groundBody) info.points.push(x2);
    }

    return info;
};


//body info used previously
//return {x: b.GetPosition().x, y: b.GetPosition().y, a: b.GetAngle(), c: {x: b.GetWorldCenter().x, y: b.GetWorldCenter().y}};

boxNS.DrawingObject.prototype.fetchDrawObjects = function(aWorldObjects)
{
    var data = [];
    for(var i=0; i < aWorldObjects.length; i++)
    {
        var dBody = aWorldObjects[i];
        var shape = dBody.GetFixtureList().GetShape();

        switch (shape.m_type) {
            case b2Shape.e_circleShape:
            {
                var circle = ((shape instanceof b2CircleShape ? shape : null));
                var center = b2Math.MulX(xf, circle.m_p);
                var radius = circle.m_radius;
                var axis = xf.R.col1;
                this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
            }
                break;
            case b2Shape.e_polygonShape:
            {
                var i = 0;
                var poly = ((shape instanceof b2PolygonShape ? shape : null));
                var vertexCount = parseInt(poly.GetVertexCount());
                var localVertices = poly.GetVertices();
                var vertices = new Vector(vertexCount);
                for (i = 0;
                     i < vertexCount; ++i) {
                    vertices[i] = b2Math.MulX(xf, localVertices[i]);
                }
                this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
            }
                break;
            case b2Shape.e_edgeShape:
            {
                var edge = (shape instanceof b2EdgeShape ? shape : null);
                this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
            }
                break;
        }


        var circle = ((shape instanceof b2CircleShape ? shape : null));
        if(circle){
            var center = b2Math.MulX(dBody.m_xf, circle.m_p);
            center.x *= this.drawScale;
            center.y *= this.drawScale;
            //console.log("gobbledy gooke");
            //console.log( dBody.GetPosition().x);
            data.push({center:center, radius: this.drawScale*circle.m_radius});
        }
    }
    return data;
}
//is the drawing logic called all from this function???
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




    //we need to do d3 binding here, wa waaaaaaa

    // this.circles = this.drawingElement.selectAll("circlesandshit");

   // var data = this.fetchDrawObjects(aWorldObjects);
//    var aFabObjects = this.fabricCanvas.getObjects();
//    var iLength = aFabObjects.length;
//    for(var i=0; i < data.length; i++)
//    {
//        this.fabricCanvas.add(new fabric.Circle({ radius: data[i].radius, fill: '#f55', top: data[i].center.x, left: data[i].center.y }));
//        aFabObjects[iLength + i].selectable = false;
//    }

    if(!this.turnOffDrawing)
        this.fabricCanvas.renderAll();

    //var x = this.x;
    //var y = this.y;

    //var drawScale = this.drawScale;
    //this.circles.data(data)
    //  .enter()
    // .append("circle")
    // .attr("cx", function(dBody) {
    //     //we need our shape and current offset
    //   return x(dBody.center.x);
    // })
    // .attr("cy", function(dBody){
    //  return y(dBody.center.y);
    // })
    // .attr("r", function(dBody) {
    //     return dBody.radius;//dBody.radius || 5;
    // });

};

boxNS.DrawingObject.prototype.drawFabricBody = function(drawObj)
{
    var info = this.shapeInfo(drawObj.body, drawObj.shape);
    var fabObj = drawObj.fabric;

    switch (drawObj.shape.m_type) {
        case b2Shape.e_circleShape:
        {
            fabObj.left = info.center.x;
            fabObj.top = info.center.y;
        }
            break;
        case b2Shape.e_polygonShape:
        {
            fabObj.points = info.vertices;
            fabObj._calcDimensions();
        }
            break;
        case b2Shape.e_edgeShape:
        default:
            console.log("don't know how to draw this object type");
            break;
    }

};

boxNS.DrawingObject.prototype.drawFabricJoint = function(drawObj)
{

    var info = this.jointInfo(drawObj.joint);

    var fabObj = drawObj.fabric;
    fabObj.points = info.points;
    fabObj._calcDimensions();

};



boxNS.DrawingObject.prototype.drawWorld = function(aBodyList)
{

    for(var jID in this.drawObjects.joints)
    {
        this.drawFabricJoint(this.drawObjects.joints[jID]);
    }
    for(var bID in this.drawObjects.bodies)
    {
        this.drawFabricBody(this.drawObjects.bodies[bID]);
    }




//
//    var data = this.fetchDrawObjects(aBodyList);
//
//    var aFabItems = this.fabricCanvas.getObjects();
//    for(var i=0; i < data.length; i++)
//    {
//        var datum =  data[i];
//        //console.log(datum.center.y);
//        aFabItems[i].left = datum.center.x;
//        aFabItems[i].top = datum.center.y;
//    }
    if(!this.turnOffDrawing)
        this.fabricCanvas.renderAll();
//    console.log("Draw: (" + data[0].center.x + " , " + data[0].center.y + ")");

//    x.domain([0,600]);
//    y.domain([0,400]);
//    this.circles.data(data, function(d){return d.center;});

    // this.testCircles.data(world.bodiesList).transition();

};

boxNS.DrawingObject.prototype.draw = function(entity)
{

};

boxNS.DrawingObject.prototype.drawCircle = function(entity)
{

};

boxNS.DrawingObject.prototype.drawRectangle = function(entity)
{

};


