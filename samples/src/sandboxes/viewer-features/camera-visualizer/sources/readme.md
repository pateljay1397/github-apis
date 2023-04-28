# Camera Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates camera functionality by using two viewports.

## Purpose

The purpose of this sample is to demonstrate the following:

* The logic needed to create a bi-directional interaction between a camera and a secondary viewport
* A visual way to see how target points, eye points, and lens angles interact to create what the camera sees

## Description

The left side represents the view of the active camera, which you can modify in any way you normally would with the viewer. You can also use the "Look-Around tool" to lock the camera in place and have fine control over moving the target point around.  When in the tool, scrolling will change the lens angle of the camera and shift-scrolling will change the rotation of the camera. Both of these parameters can also be changed via the slider in the widget.

There is also a list of all cameras, and the active camera can be changed by clicking on it's name. The color of any camera can be changed, and new cameras are added by clicking the Clone Selected Camera button. Cameras can be deleted as desired (as long as there is always at least one), and any camera other than the active one can be hidden. The limit for this sample is eight cameras. The active camera's name can be editted by clicking the edit icon and typing in a new name (20 character limit).

Cones are displayed next to both the active camera and the target point which can be clicked on to move the object a small amount in the desired direction.