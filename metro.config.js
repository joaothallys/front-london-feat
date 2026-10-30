const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");

const projectRoot = __dirname;
const config = getSentryExpoConfig(projectRoot);

config.resolver.extraNodeModules = {
  "@shared": path.resolve(projectRoot, "src/shared")
};
// Bibliotecas que ainda usam InteractionManager (removido no RN 0.86) recebem um shim.
const LEGACY_RN = [path.sep + "react-native-draggable-flatlist" + path.sep];
const rnCompat = path.resolve(projectRoot, "src/shims/react-native-compat.js");
const baseResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-native" && LEGACY_RN.some((dir) => context.originModulePath.includes(dir))) {
    return { type: "sourceFile", filePath: rnCompat };
  }
  return (baseResolve || context.resolveRequest)(context, moduleName, platform);
};

if (!config.resolver.assetExts.includes("svg")) {
  config.resolver.assetExts.push("svg");
}

module.exports = config;
