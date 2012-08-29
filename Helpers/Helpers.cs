using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Collections.Generic;

namespace SilverMinsLib
{
    public class ScreenDimensions
    {


        public double Width;
        public double Height;
        public Point Scale = new Point(1,1);
        public Point StartingPoint = new Point(0, 0);

        //Point xymax = new Point(double.MinValue, double.MinValue);
        //Point xymin = new Point(double.MaxValue, double.MaxValue);

         public ScreenDimensions(double wid, double height, Point scale, Point lowerLeft)
         {
             this.Width = wid;
             this.Height = height;
             this.Scale = scale;
             this.StartingPoint = lowerLeft;

         }
         //public void calcMaxMin(params Point[] points)
         //{
         //    foreach (Point p in points)
         //    {
         //        this.XYMax = p;
         //        this.XYMin = p;
         //    }
         //}

        //public Point XYMax
        //{
        //    get { return xymax; }
        //    set {
        //        xymax = new Point(Math.Max(value.X, xymax.X), Math.Max(value.Y, xymax.Y));
        //    }
        //}
        //public Point XYMin
        //{
        //    get { return xymin; }
        //    set
        //    {
        //        xymin = new Point(Math.Min(value.X, xymin.X), Math.Min(value.Y, xymin.Y));
        //    }
        //}
    }
    public static class Helper
    {
        
        public static void RemoveAll<T>(this List<T> l, Func<T, bool> filter)
        {
            for (int i = 0; i < l.Count; i++)
            {
                if (filter(l[i]))
                {
                    l.Remove(l[i]);
                }
            }

        }

    }
}
