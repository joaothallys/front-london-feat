const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.extraNodeModules = {
  "@shared": path.resolve(projectRoot, "src/shared")
};
if (!config.resolver.assetExts.includes("svg")) {
  config.resolver.assetExts.push("svg");
}

module.exports = config;
