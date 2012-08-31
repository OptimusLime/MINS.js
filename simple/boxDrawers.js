//Class for drawing box2D objects - using d3 and SVG -- should get us some benefits where possible

var boxNSS = "BoxDrawing";
var boxNS = namespace(boxNSS);
var b2Math = Box2D.Common.Math.b2Math,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;


boxNS.DrawingObject = function(sDrawElementName, iWidth, iHeight, scale)
{
    this.fabricCanvas = new fabric.Canvas(sDrawElementName);
    this.fabricCanvas.selection = false;
    //this.x = d3.scale.linear()
      //  .domain([0, iWidth])
        //.range([0, iWidth]);
    //this.y = d3.scale.linear()
      //  .domain([0, iHeight])
        //.range([0, iHeight]);
    this.drawScale = scale || 1;

    //this.drawingElement  = d3.select(sDrawElementName)
      //  .append("svg")
        //.style("background-color", "#333333")
        //.attr("width", iWidth + "px")
        //.attr("height", iHeight + "px");
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
    //we need to do d3 binding here, wa waaaaaaa

   // this.circles = this.drawingElement.selectAll("circlesandshit");

    var data = this.fetchDrawObjects(aWorldObjects);
    var aFabObjects = this.fabricCanvas.getObjects();
    var iLength = aFabObjects.length;
    for(var i=0; i < data.length; i++)
    {
        this.fabricCanvas.add(new fabric.Circle({ radius: data[i].radius, fill: '#f55', top: data[i].center.x, left: data[i].center.y }));
        aFabObjects[iLength + i].selectable = false;
    }

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

boxNS.DrawingObject.prototype.drawWorld = function(aBodyList)
{
    var data = this.fetchDrawObjects(aBodyList);

    var aFabItems = this.fabricCanvas.getObjects();
    for(var i=0; i < data.length; i++)
    {
        var datum =  data[i];
        //console.log(datum.center.y);
        aFabItems[i].left = datum.center.x;
        aFabItems[i].top = datum.center.y;
    }

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


