var screenNSS = "ScreenHelp";
var screenNS = namespace(screenNSS);


screenNS.ScreenDimensions = function(wid, height, scale, lowerLeft){
    this.Width = wid;
    this.Height = height;
    this.Scale = scale;
    this.StartingPoint = lowerLeft;
};

screenNS.ScreenDimensions.prototype.Width = 0;
screenNS.ScreenDimensions.prototype.Height = 0;
screenNS.ScreenDimensions.prototype.Scale = new Point(1,1);
screenNS.ScreenDimensions.prototype.StartingPoint = new Point(0,0);
