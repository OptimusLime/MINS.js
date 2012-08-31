//Class for drawing box2D objects - using d3 and SVG -- should get us some benefits where possible

var boxNSS = "BoxDrawing";
var boxNS = namespace(boxNSS);


boxNS.DrawingObject = function(sDrawElementName, width, height, scale)
{
    this.canvas = new fabric.Canvas(sDrawElementName);


    this.drawScale = scale || 1;
 //   this.drawingElement  = d3.select(sDrawElementName)
   //     .append("svg")
    //    .attr("width", width)
      //  .attr("height", height);
};


//body info used previously
//return {x: b.GetPosition().x, y: b.GetPosition().y, a: b.GetAngle(), c: {x: b.GetWorldCenter().x, y: b.GetWorldCenter().y}};


//is the drawing logic called all from this function???
boxNS.DrawingObject.prototype.setWorldObjects = function(aWorldObjects)
{
    //we need to do d3 binding here, wa waaaaaaa

    this.circles = this.drawingElement.selectAll("circlesandshit");

    this.circles.data(aWorldObjects)
        .enter()
        .append("circle")
        .attr("cx", function(dBody) {
            //console.log("gobbledy gooke");
            //console.log( dBody.GetPosition().x);
            return dBody.GetPosition().x;
        })
        .attr("cy", function(dBody){ return dBody.GetPosition().y})
        .attr("r", function(dBody) {
            return 15;//dBody.radius || 5;
        });

};

boxNS.DrawingObject.prototype.drawWorld = function(world)
{
    for(var i=0; i < world.bodiesList.length; i++)
    {
        var dBody = world.bodiesList[i];
        //console.log(dBody);
        //console.log(dBody.GetPosition());
    }
    this.circles.data(world.bodiesList)
        .transition();

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


