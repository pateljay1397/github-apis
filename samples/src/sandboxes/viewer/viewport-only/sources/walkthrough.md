# Viewer Setup

This sample consists of a single [functional REACT component](https://reactjs.org/docs/components-and-props.html) named `ViewportOnlyApp`.  This component uses the hook `useViewerContext` which is delivered as part of the sandbox environment.  The hook supplies the iTwinId and iModelId used to identify the iModel as well as the authClient which authorizes the user to access the iModel.

[_metadata_:annotation]:- "VIEW_SETUP"

# Viewer Component

The `<Viewer>` component is responsible for creating the viewport, which displays the iModel geometry and also all the embedded user interface components such as tools and widgets.

There are a few required props including `contextId`, `iModelId`, `authConfig`, and `enablePerformanceMonitors`.  We also supply the following optional props:

- `viewportOptions` : set up the initial view appearance
- `defaultUiConfig` : initialize the user interface
- `uiProviders` : display the instructions widget at the bottom of the app
- `mapLayerOptions` : show the background map
- `theme` : we prefer dark theme

The `<Viewer>` component is only returned if there is a valid authClient.

[_metadata_:annotation]:- "VIEWER"
[_metadata_:skip]:- "true"
