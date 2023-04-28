# Image Manipulator Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to build an image manipulator in the viewer.

## Purpose

The purpose of this sample is to demonstrate the following:

* How to create a Handle Provider and a Handle Tool to create custom decoration controls
* A way to manipulate a 2D image (translate, rotate, resize, modify transparency) inside the viewer

## Description

The widget has options to change the image to two different presets, as well as change its transparency. The controls for other image modification can be access by clicking on the image in the viewer. You will see white boxes on the corners that allow for resizing when dragged, as well as three colored arrows to allow rotation in any of the three dimensions. Holding shift while resizing will maintain aspect ratio, and holding shift while rotating will cause rotation in 45 degree increments. Dragging the image will move it (assuming it is already selected).