# Contributing new samples

## Prerequisites

This project uses Rush.js for managing monorepo, which makes installing dependencies and building slightly different compared to regular NPM project
Before beginning please make sure you have enabled "Developer Mode" in Windows 10

    System settings -> Developer Setting -> Developer Mode

This is required for creating symlinks, which are used in this project

## Preparation

In order to use Rush, you will need the NodeJS engine. We recommend the latest LTS version.
You also need to install the Rush tool itself. From your command prompt type this:

    npm install -g @microsoft/rush

After cloning this repository, please install dependencies and build it:

    rush install
    rush build

To launch development version of Sandbox on local host:

    cd sandbox
    rushx start

## Workflow

Contributing new samples are based on git Pull Request workflow. Therefore before making any new changes, please create a new branch locally.
When the work is completed, push your commits and create a new Pull Request in Azure Devops for us to review.

## Creating a new iTwin.js Viewer based sample

The easiest way to get started is making a copy of existing template. If you need a bare bones start, or simply don't know which one to take,
make a copy of the most basic viewer template:

    src/templates/basic-viewport

Samples are grouped into categories by folder, most likely you will want to create a new `itwin-platform-api` or `viewer-features` sample so paste a donor sample there,
or to other appropriate folder. All folders are named following kebab-case and file names follow PascalCase. Choose a short and
meaningful name and register it as a relative path at:

    src/sample-playlist.json

Then open `config.json` file located at the root of your sample folder and set a new `id` as a GUID vale (e.g. using guidgenerator.com) and `name`.
The `name` should be short and meaningful, it should match a folder name if possible.
At this moment you are good to open the new sample in the browser, if you don't have a local dev instance running, launch it and open this url:

    http://localhost:3000/sandbox/iTwinPlatform/{name}

where `{name}` is a `name` value you set in the `config.json` file

## Sandbox entry file and context

The entry file is used to start rendering. It **must have** a react component with a default export, it should be considered as an `App` component of
a regular React project.

In order to access `iTwinId` and `iModelId` values of selected iModel, use environment variables:

    const iTwinId = process.env.IMJS_ITWIN_ID;
    const iModelId = process.env.IMJS_IMODEL_ID;

These values are injected by the Sandbox runtime, no further configuration is required for them.

## Structure of Sandbox folder

The root of sandbox folder contains three items only: `config.json`, thumbnail image and the `sources` folder.
The contents of `sources` folder look the same as `src` of a regular react project and should be familiar for you.

The `config.json` has the following properties:

Property    | Description
---|---
id          | a GUID generated manually on creating a new sandbox. This value is used by deployment process to update changes in the sandbox. Cannot be changed later.
name        | a friendly name of the sandbox. Also forms a URL of sandbox
entryFile   | a name of file where the main react component resides with a default export
files       | a list of files in the sandbox. it's a relative path which may include subfolders. Each file must be listed individually
symlinks    | a list of files from `shared` folder. If you add a new symlink, samples project must be rebuild to run a script setting up the symlinks locally
commonFiles | a list of helper file set names from `common-files-config.json`. If you add a new common file set, samples project must be rebuild to run a script setting up the symlinks locally
description | short description what a sandbox is about. You can define #tags within a description in a Twitter fashion
thumbnail   | file name of thumbnail image located and the sandbox root folder. It has to be jpg of size *320x195px*
attributes  | a list of attributes, see section below
iModels     | a list of iModels to be available for the sandbox. Defined here: `sandbox\src\services\SandboxIModels.tsx`

## Development tasks

We expect you to follow iTwin.js TypeScript coding guidelines: <https://github.com/iTwin/itwinjs-core/blob/master/docs/learning/guidelines/typescript-coding-guidelines.md>

When you make changes to source files in VS Code, automatic rebuild kicks in upon every save and browser automatically reloads the page. Unfortunately we do not
support HMR, therefore full reload happens on every save.

If you need a new file in the sandbox, please register it in the `files` list of `config.json` before importing. You may use subfolders to group a number of files, then register each of them as a relative path:

    subfolder/NewFile.tsx

Failing to do this will result in a runtime error, always keep an eye at browsers console log during development tasks.

Debugging of sandbox source code is possible via Developer Tools of browser. Chrome is prefered browser for authoring samples. Open Developer Tools (Ctrl + Shift + I), navigate to Sources tab, and look for sandbox file of you interest. Easiest way to locate a file is by typing its name in the Open File (Ctrl + P) dropdown. Then you can set breakpoints, rebuild, and once breakpoint is hit - investigate values of local variables, stack trace etc.

### Localhost only
We have a separate page for localhost samples (/samples) which will be available only for localhost (Development mode). Add your sample in one of the playlists in (samples\src\sample-playlist.json) sample-playlist.json file and then in browser you can use the dropdown to filter the playlists or you can directly search for the sample using search bar.

## Attributes of Sandbox

Attributes are defined in `config.json` and take a form of key:value, where separator is double dot, no spaces allowed.

Attribute                  | Description
---|---
itwin-version:3.x          | Defines itwin.js major version. Following values are supported 2.x and 3.x.
api-group-id:visualization | Value has to match string value of `ApiGroupId` enum: <https://bentleycs.visualstudio.com/beconnect/_git/ApimDevPortal?path=/react/src/constants/ApiGroupId.ts>
api-path:visualization     | Values has to match string value of `ApiName` enum: <https://bentleycs.visualstudio.com/beconnect/_git/ApimDevPortal?path=/react/src/constants/ApiName.ts>

`api-group-id` and `api-path` are specific to developer.bentley.com, they define if sample should be displayed in the context of relevant API documentation.

## Sandbox helper file sets

These are drop-in source files, containing common functionality typically required in most of the sandboxes. We took a decision to provide those functions as a raw sources, instead of npm package, because it is specific to iTwin.js development and must not be obscured from the end user.

To use helper files, please take a look at definition in `common-files-config.json` and take required `name` values to `config.json` of the sample:
     commonFiles: ["authorization-client"]

After changes to `config.json` the `samples` project has to be rebuilt.

**authorization-client**

It contains a thin wrapper around `BrowserAuthorizationClient` that takes OIDC client information from environment variables. Values for those environment variables are provided by the Sandbox runtime. The instance of `SandboxAuthorizationClient` is expected to be provided directly to `authClient` property of itwinjs viewer.

**map-layer-options**

This file contains keys for Bing Maps MapBox and Cesium Iom services. Those keys are populated from environment variables, which are provided by Sandbox runtime..
If you need map keys for your own project, please register at bing maps and get your own: <https://www.bingmapsportal.com/>

    const mapLayerOptions: MapLayerOptions = {
        BingMaps: {
        key: "key",
        value: "...",
        },
        MapboxImagery: {
        key: "access_token",
        value: "...",
        }
    };

`mapLayerOptions` object is designed to be provided directly to `mapLayerOptions` property of itwinjs viewer.

`tileAdminOptions` is a static object containing an access token for Cesium reality data.
If you need it for your own project, please register at <https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/>

    const tileAdminOptions: TileAdmin.Props = {
    cesiumIonKey: "..."
    }

`tileAdminOptions` object is designed to be provided directly to `tileAdminOptions` property of itwinjs viewer.

**view-setup**

Contains functions to beautify initial view of sample iModels available in the sandbox.
Typical usage:

```
const viewportOptions = {
    viewState: ViewSetup.getDefaultView
};

const Sample = () => {
    return <Viewer
        iTwinId={iTwinId}
        iModelId={iModelId}
        authClient={authClient}
        viewportOptions={viewportOptions}
    />;
}
export default Sample;
```

**default-viewer-props**

Removes panels and tools that are visible by default in iTwin.js Viewer. Most samples don't need those default tools, they bring undesired distraction.

## UI of the sample and separation of concerns

Most samples demonstrate usage of APIs or features of itwin.js libraries. Essentially the code which is of primary interest for the end user has to be located in a separate file(s).
The entry file (should be minimalist) and UI widgets are considered as supplementary content that doesn't give much value and should not be mixed with the primary demo code.

Every sample must have at least a basic UI widget docked at the bottom of itwin.js viewer with a short description how to use the sample.
This widget may contain other UI components to control behavior of the sample if needed. Please use `@itwin/itwinui-react` library for all the visuals: <https://itwin.github.io/iTwinUI-react>

The most basic UI widget to be used as a starter is here:

    samples\src\sandboxes\viewer\viewport-only\sources\InstructionsWidgetProvider.tsx

### UI Guidelines

UI elements in the sample must be simple and minimalist. Most often dropdown boxes, input fields, toggle switches and buttons are used.
UI components must be positioned on a grid to make sure they adapt and reflow according to the size of widget panel. Even though the default position of sample UI is in the panel docked at the bottom, but user may drag it out and make it floating, or dock to the side. In any case UI elements must reasonably adapt to the size of container without distortion and clipping. A special case is a viewer maximized to full screen - the bottom panel becomes visually thin and long. Ideally UI items should reflow and expand to accommodate available space. However this is not always possible. A tradeoff is to set the `max-width` of contents and center it horizontally, instead of stretching it out.

CSS Media queries are not applicable for contents in docked panels, therefore the responsiveness of UI has to be achieved by using features of `flex box` and `css grid`. The auto placement of items in `css grid` with `auto-fit` and `minmax` functions are rather difficult to grasp from official docs. I found this blog post very well written and recommend to look through: <https://ishadeed.com/article/css-grid-minmax/>

## readme.md

Every sample is expected to have a readme.md document which explains purpose of the sample.
It should describe how sample works and what is the outcome, explain what libraries, methods or public APIs are used,
gives links to documentation for further reading.

## walkthrough.md

It's a feature to create a step by step walkthrough through the source code, explaining each step for the user. It's recommended to write this document for more complex samples
that might not be easy to understand. The contents of walkthrough.md is rendered as a wizard, where each step can visually highlight a section of code

A step of wizard is defined by a caption of md markup:

```
# View Setup
```

You can use all the available md syntax elements to format contents of the step
At the end of step (before new caption) a following metadata tag has to be added to define a section for highlight. `VIEW_SETUP` in this example represents a name for a section in the source code

```
[_metadata_:annotation]:- "VIEW_SETUP"
```

Then the following comments can be used directly in the source code:

```
// START VIEW_SETUP

... some code

// END VIEW_SETUP
```
