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

//derives from node
simsNS.Mass = function(xOrModel, yOrXml, double vx, double vy, Model model)
{
    var velocityX, velocityY;

    if(typeof xOrModel === "model")
    {
        if (xml.MoveToAttribute("VX".ToLower()))
        {
            velocityX = double.Parse(xml.ReadContentAsString());
        }
        if (xml.MoveToAttribute("VY".ToLower()))
        {
            velocityY = double.Parse(xml.ReadContentAsString());
        }

    }
    else
    {
        //super(x, y, model);
        this.velocityX = vx;
        this.velocityY = vy;
    }

}

//we inherit from node!
simsNS.Mass.inheritsFrom(simsNS.Node);

/**
 * Represents a free mass.
 */
public class Mass
    : Node {//, Serializable {

  double fraction;

  public new Mass Clone()
  {
      return
          new Mass(this.positionX, this.positionY, this.velocityX, this.velocityY, this.model)
          {
              fraction = this.fraction,
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
    
  public Mass(double x, double y, double vx, double vy, Model model) :base(x,y,model) {
    //super(x, y, model);
    this.velocityX = vx;
    this.velocityY = vy;
  }

  public Mass(Model model, XmlReader xml) : base(model,xml) {//throws Exception {
    //super(model, xml);
      //foreach(XmlAttribute attribute in xml.Attributes)
      //{
          //string key = attribute.Name;
      if (xml.MoveToAttribute("VX".ToLower()))
      {
        velocityX = double.Parse(xml.ReadContentAsString());
      }
      if (xml.MoveToAttribute("VY".ToLower()))
      {
          velocityY = double.Parse(xml.ReadContentAsString());
      }



      //}
    //Enumeration enum = xml.enumerateAttributeNames();
    //while (enum.hasMoreElements()) {
    //  String key = enum.nextElement().toString();
    //  if (key.equals("VX")) {
    //    velocityX = xml.getDoubleAttribute(key);
    //  }
    //  if (key.equals("VY")) {
    //    velocityY = xml.getDoubleAttribute(key);
    //  }
    //}
  }

  public void calculateForce()
  {
    fx = -model.friction * velocityX;
    double factor = 1.0;
    if (string.Equals(model.gravityDirection.ToString(), "up", StringComparison.CurrentCultureIgnoreCase)){//.equalsIgnoreCase("up")) {
      factor = -1.0;
    }
    if (string.Equals(model.gravityDirection.ToString(), "off", StringComparison.CurrentCultureIgnoreCase)) {
      factor = 0.0;
    }
    fy = -model.friction * velocityY - model.gravity * factor;
  }

  public void calculate(int stage)
  {
    double dt = model.dt;
    switch (stage) {
      case 0:
        oldx = newx = positionX;
        oldy = newy = positionY;
        oldvx = newvx = velocityX;
        oldvy = newvy = velocityY;
        break;
      case 1:
        double k1x = dt * velocityX;
        double k1y = dt * velocityY;
        double k1vx = dt * fx;
        double k1vy = dt * fy;
        newx += k1x / 6.0;
        newy += k1y / 6.0;
        newvx += k1vx / 6.0;
        newvy += k1vy / 6.0;
        positionX = oldx + 0.5 * k1x;
        positionY = oldy + 0.5 * k1y;
        velocityX = oldvx + 0.5 * k1vx;
        velocityY = oldvy + 0.5 * k1vy;
        break;
      case 2:
        double k2x = dt * velocityX;
        double k2y = dt * velocityY;
        double k2vx = dt * fx;
        double k2vy = dt * fy;
        newx += k2x / 3.0;
        newy += k2y / 3.0;
        newvx += k2vx / 3.0;
        newvy += k2vy / 3.0;
        positionX = oldx + 0.5 * k2x;
        positionY = oldy + 0.5 * k2y;
        velocityX = oldvx + 0.5 * k2vx;
        velocityY = oldvy + 0.5 * k2vy;
        break;
      case 3:
        double k3x = dt * velocityX;
        double k3y = dt * velocityY;
        double k3vx = dt * fx;
        double k3vy = dt * fy;
        newx += k3x / 3.0;
        newy += k3y / 3.0;
        newvx += k3vx / 3.0;
        newvy += k3vy / 3.0;
        positionX = oldx + k3x;
        positionY = oldy + k3y;
        velocityX = oldvx + k3vx;
        velocityY = oldvy + k3vy;
        break;
      case 4:
        double k4x = dt * velocityX;
        double k4y = dt * velocityY;
        double k4vx = dt * fx;
        double k4vy = dt * fy;

        newx += k4x / 6.0;
        newy += k4y / 6.0;
        newvx += k4vx / 6.0;
        newvy += k4vy / 6.0;

        positionX = newx;
        positionY = newy;
        velocityX = newvx;
        velocityY = newvy;
        break;
      default:
        break;
    }
  }

  void restoreState() {
    positionX = oldx;
    positionY = oldy;
    velocityX = oldvx;
    velocityY = oldvy;
  }

  public void bounce() {
    if (positionX > model.width&&oldx<=model.width) {
      double fract = (model.width-oldx)/(positionX-oldx);
      double time = model.elapsedTime - fract;
      if (model.finishTime<0.0||time<model.finishTime) {
        model.finishTime = time;
      }
    }

    if (positionY > model.height) {
      model.finishTime = 1e6;
    }

    if (positionY < 0) {
      positionY = 0;
      velocityY = model.surfaceReflection * velocityY;
      velocityX = model.surfaceFriction * velocityX;
    }

    fraction = 2.0;

    model.Links.ForEach(link =>
    {
        if (link.isFixed())
        {
            bounceFixed(link);
        }
    });
      
  }

  public void draw()//Graphics g)
  {
  }

  public void bounceFixed(Link link)
  {
    Point pa = new Point(link.A.positionX, link.A.positionY);
    Point pb = new Point(link.B.positionX, link.B.positionY);
    Transform tf = new Transform(pa, pb);
    Point poldt = tf.transform(new Point(oldx, oldy));
    Point pnewt = tf.transform(new Point(newx, newy));
    if (poldt.y * pnewt.y < 0) {
      Point pbt = tf.transform(pb);
      double newFraction = ( -poldt.y) / (pnewt.y - poldt.y);
      if (newFraction < fraction) {
        double x = (1 - newFraction) * poldt.x + pnewt.x * newFraction;
        if (x >= 0 && x <= pbt.x) {
          fraction = newFraction;
          double y;
          if (poldt.y < 0)
            y = -1e-3;
          else
            y = 1e-3;
          Point pn = tf.inverse(new Point(x, y));
          positionX = pn.x;
          positionY = pn.y;
          Point vt = tf.transformVector(new Point(newvx, newvy));
          vt.y = model.surfaceReflection * vt.y;
          vt.x = model.surfaceFriction * vt.x;
          Point vn = tf.inverseVector(vt);
          velocityX = vn.x;
          velocityY = vn.y;
        }
      }
    }
  }
}

class Point {
  public double x, y;
  public Point(double x, double y) {
    this.x = x;
    this.y = y;
  }
}

class Transform {
  double x, y;
  double ux, uy, vx, vy;
  public Transform(Point p1, Point p2) {
    x = p1.x;
    y = p1.y;
    ux = p2.x - x;
    uy = p2.y - y;
    double length = Math.Sqrt(ux * ux + uy * uy);
    if (length > 0) {
      ux /= length;
      uy /= length;
    }
    vx = -uy;
    vy = ux;
  }

  public Point getNormal()
  {
    return new Point(vx, vy);
  }

  public Point transform(Point p)
  {
    Point pnew = new Point(
        ux * (p.x - x) + uy * (p.y - y),
        vx * (p.x - x) + vy * (p.y - y));
    return pnew;
  }

  public Point inverse(Point p)
  {
    Point pnew = new Point(
        x + ux * p.x + vx * p.y,
        y + uy * p.x + vy * p.y);
    return pnew;
  }

  public Point transformVector(Point p)
  {
    Point pnew = new Point(
        ux * p.x + uy * p.y,
        vx * p.x + vy * p.y);
    return pnew;
  }

  public Point inverseVector(Point p)
  {
    Point pnew = new Point(
        ux * p.x + vx * p.y,
        uy * p.x + vy * p.y);
    return pnew;
  }
}
}