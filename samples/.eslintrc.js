require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["eslint-config-sandbox"],
  parserOptions: { tsconfigRootDir: __dirname },
  ignorePatterns: ["src/common/DefaultViewerProps.ts", "src/sandboxes/itwin-platform-api/imodels-odata"],
};