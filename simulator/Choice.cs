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

using System;
namespace Mins.Simulator
{
/**
 * Represents a multiple choice.
 */
public class Choice
    //: Serializable
{
  string[] names;
  int choice;
  public Choice(string[] names, int choice) {
    this.names = names;
    this.choice = choice;
  }

  public override string ToString() {
    return names[choice];
  }

  public void select(int choice) {
    this.choice = choice;
  }

  public void select(string name) {
    for (int i = 0; i < names.Length; i++) {
      if (string.Equals(names[i], name, StringComparison.CurrentCultureIgnoreCase))   //names[i].equalsIgnoreCase(name)) {
        choice = i;
      }
    }
  

  public string[] getChoices() {
    return names;
  }
}
}