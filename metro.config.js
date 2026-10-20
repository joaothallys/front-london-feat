const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");

const projectRoot = __dirname;
const config = getSentryExpoConfig(projectRoot);

config.resolver.extraNodeModules = {
  "@shared": path.resolve(projectRoot, "src/shared")
};
if (!config.resolver.assetExts.includes("svg")) {
  config.resolver.assetExts.push("svg");
}

module.exports = config;
