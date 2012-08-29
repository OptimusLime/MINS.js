/*
    Mins is not Soda simulator

    Copyright (C) 2004  Stefan Westen (stefan.westen@btinternet.com)

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
using System;
using System.Windows.Media;
using SilverMinsLib;
using System.Diagnostics;
namespace Mins.Simulator
{

/**
 * Represents a fixed mass.
 */
public class Node
    //implements Serializable 
    {
  protected string id = "";
  public double positionX, positionY, velocityX, velocityY;
  protected double oldx, oldy, oldvx, oldvy;
  protected double newx, newy, newvx, newvy;

  protected double fx = 0.0, fy = 0.0;
  protected Model model;

  public string ID
  {
      get { return id; }
      set { id = value; }
  }

  public Model Model
  {
      get { return model; }
      set { model = value; }
  }
  public double Fx
  {
      get { return fx; }
      set { fx = value; }
  }

  public double Fy
  {
      get { return fy; }
      set { fy = value; }
  }


  public Node(double x, double y, Model model) {

      //Debug.WriteLine("Model created ({0}, {1})", x, y);
      this.model = model;
    this.positionX = x;
    this.positionY = y;
    this.velocityX = 0;
    this.velocityY = 0;
  }
  public Node Clone()
  {
      return new Node(this.model)
      {
          id = this.id,
          positionX = this.positionX,
          positionY = this.positionY,
          oldx = this.oldx,
          oldy = this.oldy,
          oldvx = this.oldvx,
          oldvy = this.oldvy,
          newx = this.newx,
          newy = this.newy,
          newvx = this.newvx,
          newvy = this.newvy,
          fx = this.fx,
          fy = this.fy
      };
  }


  public Node(Model model) {
    this.model = model;
  }

  public Node(Model model, XmlReader xml){// throws Exception {
      this.model = model;



      if (xml.MoveToAttribute("ID".ToLower()))
      {
          id = (xml.ReadContentAsString());
      }
      if (xml.MoveToAttribute("X".ToLower()))
       {
           positionX = double.Parse(xml.ReadContentAsString());
          
       }
      if (xml.MoveToAttribute("Y".ToLower()))
       {
           positionY = double.Parse(xml.ReadContentAsString());
         
       }
      //Debug.WriteLine("ReadPos ({0},{1}): ", positionX, positionY);

      //foreach (XmlAttribute attribute in xml.Attributes)
      //{
      //    //string key = enum.nextElement().toString();
      //    string key = attribute.Name;
      //    if (key.Equals("ID"))
      //    {
      //        id = (xml.Attributes[key].Value);
      //    }
      //    if (key.Equals("X"))
      //    {
      //        positionX = double.Parse(xml.Attributes[key].Value);
      //    }
      //    if (key.Equals("Y"))
      //    {
      //        positionY = double.Parse(xml.Attributes[key].Value);
      //    }
      //}



  }

  public void calculateForce()
  {
    fx = 0;
    fy = 0;
  }

  public void draw(GeometryGroup g, ScreenDimensions sd)//Graphics g)
  {
  }

  public void calculate(int stage) {
    oldx = newx = positionX;
    oldy = newy = positionY;
    oldvx = newvx = velocityX = 0;
    oldvy = newvy = velocityY = 0;
  }

  bool isInside(double x1, double y1, double x2, double y2) {
    if (positionX >= x1 && positionX <= x2 && positionY >= y1 &&
        positionY <= y2) {
      return true;
    }
    else {
      return false;
    }
  }

  double distance(double x, double y) {
    double dx = this.positionX - x;
    double dy = this.positionY - y;
    return Math.Sqrt(dx * dx + dy * dy);
  }

  public double distance(Node other) {
    double dx = positionX - other.positionX;
    double dy = positionY - other.positionY;
    return Math.Sqrt(dx * dx + dy * dy);
  }
}
}