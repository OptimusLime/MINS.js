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

using System.Xml;
using System.Windows.Media;
using System.Windows.Shapes;
using SilverMinsLib;
using System.Diagnostics;
namespace Mins.Simulator
{
/**
 * Represents a generic link.
 */
public class Link
    //: Serializable
{
  protected Node a, b;
  Model model;

  public Link Clone()
  {

      return new Link(this.a, this.b, this.model);
      //{
      //};
  }

  public Link(Node a, Node b, Model model) {
    this.a = a;
    this.b = b;
    this.model = model;
  }


  public Node A
  {
      get { return a; }
      set { a = value; }
  }
  public Node B
  {
      get { return b; }
      set { b = value; }
  }
  public Model Model
  {
      get { return model; }
      set { model = value; }
  }
  
  public Link(Model model, XmlReader xml) {//throws Exception {
    this.model = model;
     
      //foreach(XmlAttribute attribute in xml.Attributes)
      //{
      //     //string key = enum.nextElement().toString();
      //    string key = attribute.Name;
    if (xml.MoveToAttribute("A".ToLower()))
          {
              a = model.getNode(xml.ReadContentAsString());// xml.GetAttribute(key));
      }
    if (xml.MoveToAttribute("B".ToLower()))
          {
              b = model.getNode(xml.ReadContentAsString());//xml.GetAttribute(key));
      }


      //}
    //Enumeration enum = xml.enumerateAttributeNames();
    //while (enum.hasMoreElements()) {
     
    //}
  }

  public void calculate()
  {
  }

    //TODO: Draw the Link graphic
  public void draw(GeometryGroup g, ScreenDimensions sd)//Graphics g)
  {
      //LineGeometry lg = new LineGeometry()
      //{
      //    StartPoint = new System.Windows.Point(sd.Scale.X*a.positionX, sd.Scale.Y*(sd.Height- a.positionY)),
      //    EndPoint = new System.Windows.Point(sd.Scale.X * b.positionX, sd.Scale.Y*(sd.Height - b.positionY))
      //};

      System.Windows.Point start = new System.Windows.Point(sd.Scale.X*(a.positionX + sd.StartingPoint.X), (sd.Height - sd.Scale.Y*a.positionY - sd.StartingPoint.Y));
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


      //Debug.WriteLine("");
      //Debug.WriteLine("PrePos ({0},{1})", (a.positionX), ( a.positionY));
      //Debug.WriteLine("PostPos ({0},{1})", (sd.Scale.X * a.positionX) , (sd.Height - sd.Scale.Y * a.positionY));
      //Debug.WriteLine("");
      
      //Color oldColor = g.getColor();
      //g.setColor(Colors.Black);
      //g.drawLine( (int) a.positionX, (int) a.positionY,
      //           (int) b.positionX,
      //           (int) b.positionY);
      //g.setColor(oldColor);
  }

  public bool isFixed() {
    if (! (a is Mass) && ! (b is Mass)) {
      return true;
    }
    else {
      return false;
    }
  }
}
}