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
namespace Mins.Simulator
{

/**
 * Represents a spring.
 */
public class Spring
    : Link 
    //implements Serializable 
    {
  public double restLength = 0.0;
  public double amplitude = 0.0;
  public double phase = 0.0;


  public new Spring Clone()
  {
      return new Spring(this.a, this.b, this.restLength, this.amplitude, this.phase, this.Model);
  }

  public Spring(Node a, Node b, double restLength,
                double amplitude, double phase, Model model) : base(a,b, model){
    //super(a, b, model);
    this.restLength = restLength;
    this.amplitude = amplitude;
    this.phase = phase;
  }

  double getLength() {
    if (amplitude == 0.0) {
      return restLength;
    }
    else {
      return restLength * (1 + amplitude * Model.waveAmplitude *
                           Math.Sin(2.0 * Math.PI * (phase - Model.wavePhase)));
    }
  }

  public Spring(Model model, XmlReader xml) :base(model,xml) {//throws Exception {
    //super(model, xml);
      //foreach(XmlAttribute attribute in xml.Attributes)
      //{
      //    string key = attribute.Name;
      if (xml.MoveToAttribute("RESTLENGTH".ToLower()))
      {
               restLength = double.Parse(xml.ReadContentAsString());// xml.getDoubleAttribute(key);
      }
      if (xml.MoveToAttribute("AMPLITUDE".ToLower()))
      {
          amplitude = double.Parse(xml.ReadContentAsString());
        Model.checkRange(amplitude, 0.0, 1.0, "Spring amplitude");
      }
      if (xml.MoveToAttribute("PHASE".ToLower()))
      {
          phase = double.Parse(xml.ReadContentAsString());
        Model.checkRange(phase, 0.0, 1.0, "Spring phase");
      }

      //}

    //Enumeration enum = xml.enumerateAttributeNames();
    //while (enum.hasMoreElements()) {
    //  String key = enum.nextElement().toString();
    //  if (key.equals("RESTLENGTH")) {
    //    restLength = xml.getDoubleAttribute(key);
    //  }
    //  if (key.equals("AMPLITUDE")) {
    //    amplitude = xml.getDoubleAttribute(key);
    //    Model.checkRange(amplitude, 0.0, 1.0, "Spring amplitude");
    //  }
    //  if (key.equals("PHASE")) {
    //    phase = xml.getDoubleAttribute(key);
    //    Model.checkRange(phase, 0.0, 1.0, "Spring phase");
    //  }
    //}
  }

 public void calculate() {
    double desiredLength = getLength();
    double actualLength = Math.Sqrt(
        (b.positionX - a.positionX) * (b.positionX - a.positionX) +
        (b.positionY - a.positionY) * (b.positionY - a.positionY));
    if (actualLength > 1e-3) {
      double factor = Model.springyness * (actualLength - desiredLength) /
          actualLength;
      double fx = factor * (b.positionX - a.positionX);
      double fy = factor * (b.positionY - a.positionY);
      a.Fx += fx;
      a.Fy += fy;
      b.Fx -= fx;
      b.Fy -= fy;
    }
  }

  void validate() {
    amplitude = Model.clip(amplitude, 0.0, 1.0);
    phase = Model.clip(phase, 0.0, 1.0);
  }

  bool isFixed() {
    return false;
  }
}
}