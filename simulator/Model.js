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
using System.Collections.Generic;
using System;
using System.Windows.Media;
using System.Linq;
using SilverMinsLib;

namespace Mins.Simulator
{

    /**
     * The actual simulator.
     */
    public class Model
    //: Serializable 
    {
        List<Node> nodes = new List<Node>();
        List<Link> links = new List<Link>();

        public int id = 0;
        public int width = 651;
        public int height = 422;
        public double gravity = 0.5;
        public double friction = 0.025;
        public double springyness = 0.4;
        public double surfaceFriction = 0.1;
        public double surfaceReflection = -0.75;
        public double waveAmplitude = 0.5;
        public double wavePhase = 0;
        public double waveSpeed = 0.05;
        public double timeIncrement = 1.0;
        public double dt = 1.0;
        public double elapsedTime = 0.0;
        public double finishTime = -1.0;
        public int frameDecimation = 1;

       
        public Choice gravityDirection = new Choice(new string[] {"down", "up", "off"}, 0);
        public Choice waveDirection = new Choice(new string[] { "forward", "reverse", "manual" }, 0);
        public Choice autoReverse = new Choice(new string[] {"on", "off"} , 0);
       
        
        public Model Clone()
        {
            List<Node> nodeClones = new List<Node>();
            List<Link> linkClones = new List<Link>();

            nodes.ForEach(x=> nodeClones.Add(x.Clone()));
            links.ForEach(x=> linkClones.Add(x.Clone()));

            return new Model()
            {
                nodes = nodeClones,
                links = linkClones,
                id = this.id,
                width = this.width,
                height = this.height,
                gravity = this.gravity,
                friction = this.friction,
                springyness = this.springyness,
                surfaceFriction = this.surfaceFriction,
                surfaceReflection = this.surfaceReflection,
                waveAmplitude = this.waveAmplitude,
                wavePhase = this.wavePhase,
                waveSpeed = this.waveSpeed,
                timeIncrement = this.timeIncrement,
                dt = this.dt,
                elapsedTime = this.elapsedTime,
                finishTime = this.finishTime,
                frameDecimation = this.frameDecimation,

                waveDirection = this.waveDirection,
                gravityDirection = this.gravityDirection,
                autoReverse = this.autoReverse           

            };


        }
        public Model()
        {
        }

        public Model(XmlReader xml)
        {//throws Exception {
            parseXML(xml);
        }

        public void addNode(Node node)
        {
            nodes.Add(node);
        }

        public void addLink(Link link)
        {
            links.Add(link);
        }

        public void removeNode(Node node)
        {

            links.RemoveAll(link => link.A == node || link.B == node);

            nodes.Remove(node);

            //Enumerator iter = links.iterator();
            //while (iter.hasNext()) {
            //  Link link = (Link) iter.next();
            //  if (link.a == node || link.b == node) {
            //    iter.remove();
            //  }
            //}
            //nodes.remove(node);
        }

        public void removeLink(Link link)
        {
            links.Remove(link);
        }

        public List<Node> Nodes
        {
             get {return nodes;}
        }

        public List<Link> Links
        {
            get { return links; }
        }
        public void parseXML(XmlReader reader)
        {
            //reader.MoveToAttribute("MasterMidiTrack");
            //string masterTrack = reader.ReadContentAsString();

            while (reader.Read())
            {

                if (reader.IsStartElement())
                {
                    //Console.WriteLine("Start element: " + reader.Name);
                    switch (reader.Name)
                    {

                        //case "nodes":
                        //    //Need to set the last key                          
                        //case "links":
                        //    parseParts(reader);
                        //    break;

                        case "node":
                            parseAttributes(reader);
                            nodes.Add(new Node(this, reader));
                            break;
                        case "mass":
                            parseAttributes(reader);
                            nodes.Add(new Mass(this, reader));
                            break;
                        case "fixedbar":
                            parseAttributes(reader);
                            links.Add(new Link(this, reader));
                            break;
                        case "spring":
                            parseAttributes(reader);
                            links.Add(new Spring(this, reader));
                            break;
                        case "muscle":
                            parseAttributes(reader);
                            links.Add(new Spring(this, reader));
                            break;
                        
                      
                        default:
                            Console.WriteLine("Reached ignored name: " + reader.Name);
                            parseAttributes(reader);
                            //parseChildren(reader);

                            



                            break;
                    }

                }
                //else
                //{
                //    Console.WriteLine("Not StartEle: " + reader.Name);
                //}
                if (reader.NodeType == XmlNodeType.EndElement && reader.Name == "MasterDataManager")
                    break;
            }



        }
       //public void parseXML(XmlNode xml)
       // {//throws Exception {
       //     string name = xml.Name;
       //     if (name.Equals("nodes") || name.Equals("links"))
       //     {
       //         parseParts(xml);
       //     }
       //     else
       //     {
       //         parseAttributes(xml);
       //         parseChildren(xml);
       //     }
       // }

        public static void checkRange(double value, double min, double max, string name)
        //throws Exception 
        {
            if (value < min || value > max)
            {
                throw (new Exception(name + " should be between " + min + " and " + max));
            }
        }
        void parseAttributes(XmlReader reader)
        {
            if (reader.MoveToAttribute("WIDTH".ToLower()))
            {
                width = int.Parse(reader.ReadContentAsString());
                checkRange(width, 1, 10000, "Width");
            }
            if (reader.MoveToAttribute("HEIGHT".ToLower()))
            {
                height = int.Parse(reader.ReadContentAsString());
                checkRange(height, 1, 10000, "Height".ToLower());
            }

            if (reader.MoveToAttribute("FRICTION".ToLower()))
            {
                friction = double.Parse(reader.ReadContentAsString());
                checkRange(friction, 0.0, 1.0, "Friction".ToLower());
            }
            if (reader.MoveToAttribute("GRAVITY".ToLower()))
            {
                gravity = double.Parse(reader.ReadContentAsString());
                checkRange(gravity, 0.0, 4.0, "Gravity");
            }
            if (reader.MoveToAttribute("SPRINGYNESS".ToLower()))
            {
                springyness = double.Parse(reader.ReadContentAsString());
                checkRange(springyness, 0.0, 0.5, "Springyness");
            }

            if (reader.MoveToAttribute("SURFACE_REFLECTION".ToLower()))
            {
                surfaceReflection = double.Parse(reader.ReadContentAsString());
                checkRange(surfaceReflection, -1.0, 0.0, "Surface reflection");
            }


            if (reader.MoveToAttribute("SURFACE_FRICTION".ToLower()))
            {
                surfaceFriction = double.Parse(reader.ReadContentAsString());
                checkRange(surfaceFriction, 0.0, 1.0, "Surface friction");
            }
            if (reader.MoveToAttribute("AMPLITUDE".ToLower()))
            {
                waveAmplitude = double.Parse(reader.ReadContentAsString());
                checkRange(waveAmplitude, 0.0, 1.0, "Wave amplitude");
            }
            if (reader.MoveToAttribute("PHASE".ToLower()))
            {
                wavePhase = double.Parse(reader.ReadContentAsString());
            }
            if (reader.MoveToAttribute("SPEED".ToLower()))
            {
                waveSpeed = double.Parse(reader.ReadContentAsString());
                checkRange(waveSpeed, 0.0, 1.0, "Wave speed");
            }
            if (reader.MoveToAttribute("AUTOREVERSE".ToLower()))
            {
                string value = reader.ReadContentAsString();
                autoReverse.select(value);
                if (!(string.Equals(value, "on", StringComparison.CurrentCultureIgnoreCase) || (string.Equals(value, "off", StringComparison.CurrentCultureIgnoreCase))))
                {
                    throw new Exception("Auto reverse should be on or off");
                }
            }
            if (reader.MoveToAttribute("WAVEDIRECTION".ToLower()))
            {
                string value = reader.ReadContentAsString();
                waveDirection.select(value);
                if (!(string.Equals(value, "forward", StringComparison.CurrentCultureIgnoreCase) ||
                       string.Equals(value, "reverse", StringComparison.CurrentCultureIgnoreCase)))
                {
                    throw new Exception("Wave direction should be forward or reverse");
                }

            }
            if (reader.MoveToAttribute("GRAVITYDIRECTION".ToLower()))
            {
                string value = reader.ReadContentAsString();
                gravityDirection.select(value);
                if (!(string.Equals(value, "down", StringComparison.CurrentCultureIgnoreCase) || string.Equals(value, "up", StringComparison.CurrentCultureIgnoreCase) ||
                       string.Equals(value, "off", StringComparison.CurrentCultureIgnoreCase)))
                {
                    throw new Exception("Gravity direction should be down, up, or off");
                }
            }




        }
        //void parseAttributes(XmlNode xml)
        //{
      
            
        //    //throws Exception {
        //    //Enumeration enum = xml.enumerateAttributeNames();
        //    //XmlNodeList enumList = xml.AttributeNames;


        //    foreach (XmlAttribute attribute in xml.Attributes)
        //    {
        //        //string key = enum.nextElement().toString();
        //        string key = attribute.Name;





        //        //while (enum.hasMoreElements()) {
        //        //  String key = enum.nextElement().toString();
        //        if (key.Equals("WIDTH"))
        //        {
        //            width = int.Parse(xml.Attributes[key].Value);// xml.getIntAttribute(key);
        //            checkRange(width, 1, 10000, "Width");
        //        }
        //        if (key.Equals("HEIGHT"))
        //        {
        //            height = int.Parse(xml.Attributes[key].Value);
        //            checkRange(height, 1, 10000, "Height");
        //        }
        //        if (key.Equals("FRICTION"))
        //        {
        //            friction = double.Parse(xml.Attributes[key].Value);
        //            checkRange(friction, 0.0, 1.0, "Friction");
        //        }
        //        if (key.Equals("GRAVITY"))
        //        {
        //            gravity = double.Parse(xml.Attributes[key].Value);
        //            checkRange(gravity, 0.0, 4.0, "Gravity");
        //        }
        //        if (key.Equals("SPRINGYNESS"))
        //        {
        //            springyness = double.Parse(xml.Attributes[key].Value);
        //            checkRange(springyness, 0.0, 0.5, "Springyness");
        //        }
        //        if (key.Equals("SURFACE_REFLECTION"))
        //        {
        //            surfaceReflection = double.Parse(xml.Attributes[key].Value);
        //            checkRange(surfaceReflection, -1.0, 0.0, "Surface reflection");
        //        }
        //        if (key.Equals("SURFACE_FRICTION"))
        //        {
        //            surfaceFriction = double.Parse(xml.Attributes[key].Value);
        //            checkRange(surfaceFriction, 0.0, 1.0, "Surface friction");
        //        }
        //        if (key.Equals("AMPLITUDE"))
        //        {
        //            waveAmplitude = double.Parse(xml.Attributes[key].Value);
        //            checkRange(waveAmplitude, 0.0, 1.0, "Wave amplitude");
        //        }
        //        if (key.Equals("PHASE"))
        //        {
        //            wavePhase = double.Parse(xml.Attributes[key].Value);
        //        }
        //        if (key.Equals("SPEED"))
        //        {
        //            waveSpeed = double.Parse(xml.Attributes[key].Value);
        //            checkRange(waveSpeed, 0.0, 1.0, "Wave speed");
        //        }
        //        if (key.Equals("AUTOREVERSE"))
        //        {
        //            string value = xml.Attributes[key].Value;
        //            autoReverse.select(value);
        //            if (!(string.Equals(value, "on", StringComparison.CurrentCultureIgnoreCase) || (string.Equals(value, "off", StringComparison.CurrentCultureIgnoreCase))))
        //            {
        //                throw new Exception("Auto reverse should be on or off");
        //            }
        //        }
        //        if (key.Equals("WAVEDIRECTION"))
        //        {
        //            string value = xml.Attributes[key].Value;
        //            waveDirection.select(value);
        //            if (!(string.Equals(value, "forward", StringComparison.CurrentCultureIgnoreCase) ||
        //                   string.Equals(value, "reverse", StringComparison.CurrentCultureIgnoreCase)))
        //            {
        //                throw new Exception("Wave direction should be forward or reverse");
        //            }

        //        }
        //        if (key.Equals("GRAVITYDIRECTION"))
        //        {
        //            string value = xml.Attributes[key].Value;
        //            gravityDirection.select(value);
        //            if (!(string.Equals(value, "down", StringComparison.CurrentCultureIgnoreCase) || string.Equals(value, "up", StringComparison.CurrentCultureIgnoreCase) ||
        //                   string.Equals(value, "off", StringComparison.CurrentCultureIgnoreCase)))
        //            {
        //                throw new Exception("Gravity direction should be down, up, or off");
        //            }
        //        }
        //    }
        //}

        public static Color parseColor(string value)
        {//throws Exception {
            byte intValue = (byte)int.Parse(value);//Integer.decode(value).intValue();
            return (Color.FromArgb(255, intValue, intValue, intValue));
        }

        //public void parseChildren(XmlNode xml)
        //{// throws Exception {
        //    foreach (XmlNode xmlNode in xml.ChildNodes)
        //    {
        //        parseXML(xmlNode);
        //    }

        //    //Enumeration enum = xml.enumerateChildren();
        //    //while (enum.hasMoreElements()) {
        //    //  parseXML( (XMLElement) enum.nextElement());
        //    //}
        //}

        //public void parseParts(XmlNode xml)
        //{ //throws Exception {


        //    foreach (XmlNode child in xml.ChildNodes)
        //    {

        //        if (child.Name.Equals("node"))
        //        {
        //            nodes.Add(new Node(this, child));
        //        }
        //        if (child.Name.Equals("mass"))
        //        {
        //            nodes.Add(new Mass(this, child));
        //        }
        //        if (child.Name.Equals("fixedbar"))
        //        {
        //            links.Add(new Link(this, child));
        //        }
        //        if (child.Name.Equals("spring"))
        //        {
        //            links.Add(new Spring(this, child));
        //        }
        //        if (child.Name.Equals("muscle"))
        //        {
        //            links.Add(new Spring(this, child));
        //        }
        //    }
        //}

        public double getTimeIncrement()
        {
            return timeIncrement;
        }

        public Node getNode(string id)
        {// throws Exception {
            Node result = null;


            foreach (Node node in nodes)
            {
                if (string.Equals(node.ID, id, StringComparison.CurrentCultureIgnoreCase))
                    result = node;
            }

            //Iterator iter = nodes.iterator();    
            //  while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  if (node.getID().equalsIgnoreCase(id)) {
            //    result = node;
            //  }
            //}
            if (result == null)
            {
                throw (new Exception("Mass " + id + " could not be found"));
            }
            return result;
        }
        //TODO: Draw the model graphics
        public void draw(GeometryGroup g, ScreenDimensions sd)//Graphics g)
        {
            //g.setColor(Colors.Black);
            links.ForEach(link => link.draw(g, sd));
            nodes.ForEach(node => node.draw(g, sd));

            //Iterator iter = links.iterator();
            //while (iter.hasNext()) {
            //  Link link = (Link) iter.next();
            //  link.draw(g);
            //}
            //iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  node.draw(g);
            //}
        }

        void calculateForces()
        {

            nodes.ForEach(node => node.calculateForce());
            links.ForEach(link => link.calculate());
            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  ( (Node) iter.next()).calculateForce();
            //}
            //iter = links.iterator();
            //while (iter.hasNext()) {
            //  ( (Link) iter.next()).calculate();
            //}
        }

        void calculatePositions(int stage)
        {

            nodes.ForEach(node => node.calculate(stage));

            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  node.calculate(stage);
            //}
        }

        void advanceWave()
        {
            if (string.Equals(waveDirection.ToString(), "forward", StringComparison.CurrentCultureIgnoreCase))//waveDirection.toString().equalsIgnoreCase("forward"))
            {
                wavePhase += 0.5 * dt * waveSpeed;
            }
            else
            {
                wavePhase -= 0.5 * dt * waveSpeed;
            }
        }

        /**
         * Performs a timestep with the given timestep length. It is advisable to keep
         * timeStep below 1.0.
         * @param timeStep The timestep.
         */
        public void step(double timeStep)
        {

            dt = timeStep;

            for (int i = 0; i < frameDecimation; i++)
                if (finishTime < 0.0)
                {
                    elapsedTime += dt;
                    calculatePositions(0);
                    calculateForces();
                    calculatePositions(1);
                    advanceWave();
                    calculateForces();
                    calculatePositions(2);
                    calculateForces();
                    calculatePositions(3);
                    advanceWave();
                    calculateForces();
                    calculatePositions(4);
                    bounce();
                }
        }

        public bool bounce()
        {

            nodes.Where(node => node.GetType() == typeof(Mass)).ToList().ForEach(node => (node as Mass).bounce());

            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  if (node is Mass) {
            //    Mass mass = (Mass) node;
            //    mass.bounce();
            //  }
            //}
            return true;
        }

        public static double clip(double value, double min, double max)
        {
            if (value < min)
            {
                value = min;
            }
            if (value > max)
            {
                value = max;
            }
            return value;
        }

        public void removeFixedNodes()
        {

            links.ForEach(link =>
            {
                if (!(link.A is Mass))
                {

                    nodes.Remove(link.A);
                }
                else
                    if (!(link.B is Mass))
                    {

                        nodes.Remove(link.B);
                    }
            });

            //Iterator iter = links.iterator();
            //while (iter.hasNext()) {
            //  Link link = (Link) iter.next();
            //  if (! (link.a instanceof Mass)) {
            //    iter.remove();
            //    nodes.remove(link.a);
            //  }
            //  else
            //  if (! (link.b instanceof Mass)) {
            //    iter.remove();
            //    nodes.remove(link.b);
            //  }
            //}
        }

        public void removeMovingNodes()
        {
            links.ForEach(link =>
                {
                    if (link.A is Mass)
                    {

                        nodes.Remove(link.A);
                    }
                    else
                        if (link.B is Mass)
                        {
                            nodes.Remove(link.B);
                        }

                });

            links.RemoveAll(link => link.A is Mass || link.B is Mass);


            //Iterator iter = links.iterator();
            //while (iter.hasNext()) {
            //  Link link = (Link) iter.next();
            //  if (link.a instanceof Mass) {
            //    iter.remove();
            //    nodes.remove(link.a);
            //  }
            //  else
            //  if (link.b instanceof Mass) {
            //    iter.remove();
            //    nodes.remove(link.b);
            //  }
            //}
        }

        public Node leftNode()
        {
            Node result = null;

            nodes.ForEach(node =>
            {
                if (result == null || node.positionX < result.positionX)
                    result = node;
            });

            return result;
            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  if (result == null || node.positionX < result.positionX)
            //    result = node;
            //}
            //return result;
        }

        public Node rightNode()
        {
            Node result = null;

            nodes.ForEach(node =>
            {
                if (result == null || node.positionX > result.positionX)
                    result = node;
            });

            return result;

            //  Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  if (result == null || node.positionX > result.positionX)
            //    result = node;
            //}
            //return result;
        }

        public Node topNode()
        {
            Node result = null;
            nodes.ForEach(node =>
          {
              if (result == null || node.positionY > result.positionY)
                  result = node;
          });

            return result;



            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  if (result == null || node.positionY > result.positionY)
            //    result = node;
            //}
            //return result;
        }

        public Node bottomNode()
        {
            Node result = null;
            nodes.ForEach(node =>
           {
               if (result == null || node.positionY < result.positionY)
                   result = node;
           });

            return result;
            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  if (result == null || node.positionY < result.positionY)
            //    result = node;
            //}
            //return result;
        }

        public Node rightMovingNode()
        {
            Node result = null;
            nodes.ForEach(node =>
           {
               if (node is Mass)
                   if (result == null || node.positionX > result.positionX)
                       result = node;
           });
            return result;


            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  if (node instanceof Mass)
            //    if (result == null || node.positionX > result.positionX)
            //      result = node;
            //}
            //return result;
        }

        public void move(double dx, double dy)
        {
            nodes.ForEach(node =>
                {
                    node.positionX = node.positionX + dx;
                    node.positionY = node.positionY + dy;
                });

            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  node.positionX = node.positionX + dx;
            //  node.positionY = node.positionY + dy;
            //}
        }

        public void zeroVelocity()
        {

            nodes.ForEach(node =>
              {
                  node.velocityX = 0.0;
                  node.velocityY = 0.0;
              });

            //Iterator iter = nodes.iterator();
            //while (iter.hasNext()) {
            //  Node node = (Node) iter.next();
            //  node.velocityX = 0.0;
            //  node.velocityY = 0.0;
            //}
        }

        public void merge(Model model)
        {
            List<Link> mergeList = model.Links;
            mergeList.ForEach(link => this.addLink(link));

            width = model.width;
            height = model.height;

            //Iterator iter = model.getLinks().iterator();
            //while (iter.hasNext()) {
            //  Link link = (Link) iter.next();
            //  this.addLink(link);
            //}
            //width = model.width;
            //height = model.height;
        }
    }
}