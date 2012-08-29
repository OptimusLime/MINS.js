/*
    Mins is not Soda simulator

    Copyright (C) 2004 Stefan Westen (stefan.westen@btinternet.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

simsNS.Link = function(cAorModel, cBorXml, cModel)
{
    if(typeof cAorModel === "Model")
    {
        this.model = cAorModel;
        this.A = this.model.getNode(cBorXml.A);
        this.B = this.model.getNode(cBorXml.B);
    }
    else
    {
        this.A = cA;
        this.B = cB;
        this.model = cModel;
    }
};



simsNS.Link.prototype.A = null;
simsNS.Link.prototype.B = null;
simsNS.Link.prototype.model = null;

simsNS.Link.prototype.Calculate = function()
{
};
simsNS.Link.prototype.draw = function(paintObject, screenDimensions)//Graphics g)
{
    //LineGeometry lg = new LineGeometry()
    //{
    //    StartPoint = new System.Windows.Point(sd.Scale.X*a.positionX, sd.Scale.Y*(sd.Height- a.positionY)),
    //    EndPoint = new System.Windows.Point(sd.Scale.X * b.positionX, sd.Scale.Y*(sd.Height - b.positionY))
    //};

    /*System.Windows.Point start = new System.Windows.Point(sd.Scale.X*(a.positionX + sd.StartingPoint.X), (sd.Height - sd.Scale.Y*a.positionY - sd.StartingPoint.Y));
    System.Windows.Point end = new System.Windows.Point(sd.Scale.X*(b.positionX + sd.StartingPoint.X), (sd.Height - sd.Scale.Y*b.positionY - sd.StartingPoint.Y));

    PathGeometry p = new PathGeometry()
    {
        Figures = new PathFigureCollection() {
        new PathFigure()
        {
            StartPoint = start,
                Segments = new PathSegmentCollection()
            {
                new LineSegment() {Point = start},
                new LineSegment() { Point = end}
            }
        }

    }
    };


    g.Children.Add(p);
    */
};

simsNS.Link.prototype.isFixed = function()
{
    if(!this.A.isMass && !this.B.isMass)
        return true;
    else
        return false;


};