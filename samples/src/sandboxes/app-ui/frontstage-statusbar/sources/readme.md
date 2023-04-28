# Frontstage UI & Content Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample provides an example of a Frontstage defining its own custom statusbar.

## What is a Frontstage?
A Frontstage is a full-screen UI configuration. All the UI elements present in the Viewer are part of a Frontstage (this includes things such as the widgets and tool buttons). You can define multiple Frontstages and swap between them to drastically change the UI of your Viewer depending on the task you are attempting to accomplish. There are two types of UI that the Frontstage can provide:
1.	The UI items: Frontstages can provide custom widgets, custom toolbars, and custom status bars. These are the pieces of the UI that surround your iModel view.
2.	The content: This is the core content of the Viewer. Usually, this is the iModel and view state that the Viewer displays. If you are wanting a view of your iModel, try using the IModelViewportControl class when declaring your Frontstage. This is a helpful class that allows you to customize the initial view state for your iModelConnection.

## How do I declare a Frontstage?
Use the `StandardFrontstageProvider`. This provides an “empty” frontstage that is then populated with tools, statusbar items, and widgets at runtime by the UiItemsProvider. You can use the UiItemsProvider to control on which Frontstages a UI item will appear.

The Viewer provides a default Frontstage, so if you only need one UI configuration you can directly add UI items to the default Frontstage with the UiItemsProvider without needing to declare any Frontstages yourself.

Declare your Frontstages in the entry file to your Viewer and pass them directly to the Viewer using the frontstages prop.

## Are there any limitations to Frontstages?
Yes, Frontstages are not dynamic/responsive. Once you have declared the UI configuration for a Frontstage, you are not able to programmatically update it.

## Additional Documentation
- [Quick Start to an App UI user interface](https://www.itwinjs.org/learning/ui/quickstartui/#use-create-react-app-to-make-a-web-viewer-app)
- [Augmenting the UI of an iTwin App](https://www.itwinjs.org/learning/ui/augmentingui/#augmenting-the-ui-of-an-itwin-app)
- [Frontstages](https://www.itwinjs.org/learning/ui/appui-react/frontstages/#frontstages)
- [Content Views, Controls, Groups and Layouts](https://www.itwinjs.org/learning/ui/appui-react/contentviews/#content-views-controls-groups-and-layouts)
- [IModelViewportControl](https://www.itwinjs.org/learning/ui/appui-react/imodelviewportcontrol/#imodelviewportcontrol)
- [UiItemsProvider](https://www.itwinjs.org/learning/ui/abstract/uiitemsprovider/#uiitemsprovider)
- [Status Bar](https://www.itwinjs.org/learning/ui/appui-react/statusbar/#status-bar)