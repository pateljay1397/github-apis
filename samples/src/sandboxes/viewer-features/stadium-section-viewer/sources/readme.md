# Stadium Section View Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample simulates a ticket purchasing page for a stadium.  It demonstrates how the iTwinViewer can be used as a component adding value to a page without being the central focus.  The page is enhanced by using the iTwinViewer to show an animated view from the seat before the customer decides to purchase tickets.

## Purpose

The purpose of this sample is to demonstrate the following:

* How to include the iTwin Viewer as a component that is not the central focus of the page.

* How to drive the viewer's behavior from other components on the page.

## Description

As a secondary component on the page, all of the user interface typically embedded within the viewer component has been removed.  Most of the viewer behavior is triggered without the user directly interacting with the viewer.  When the user chooses a section, the viewer is automatically animated to show the view from that section.  By clicking in the viewer, the user can take control of the target point of the view.

The view's camera position is controlled by two ViewTools.  The SectionChangeTool animates the camera transition between sections.  While it is running, it blocks all user input.  The SeatViewTool animates the camera to pan left and right to show the full view of the pitch.  The panning animation can be interrupted when the user clicks and drags the mouse within the viewport.
