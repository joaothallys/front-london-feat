const fs = require("fs");
const path = require("path");
const { withDangerousMod, withFinalizedMod } = require("expo/config-plugins");

// Sem SENTRY_AUTH_TOKEN (Xcode Cloud, máquina nova) o envio de source maps e
// símbolos falha e derruba o Archive. Com isso o build segue e só avisa.
const ENV_LINE = "export SENTRY_ALLOW_FAILURE=true";
const SOURCE_ENV =
  'if [[ -f "$SRCROOT/.xcode.env" ]]; then\n  source "$SRCROOT/.xcode.env"\nfi\n' +
  'if [[ -f "$SRCROOT/.xcode.env.local" ]]; then\n  source "$SRCROOT/.xcode.env.local"\nfi\n';

function withAllowFailureEnv(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const file = path.join(cfg.modRequest.platformProjectRoot, ".xcode.env");
      const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
      if (!current.includes(ENV_LINE)) {
        fs.writeFileSync(file, current.replace(/\n?$/, "\n") + "\n# Envio ao Sentry sem token não trava o Archive.\n" + ENV_LINE + "\n");
      }
      return cfg;
    }
  ]);
}

// A fase de símbolos do Sentry não lê o .xcode.env por conta própria. O plugin
// do Sentry cria essa fase depois dos outros, então o ajuste roda no final.
function withDebugFilesSourcingEnv(config) {
  return withFinalizedMod(config, [
    "ios",
    (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const proj = fs.readdirSync(root).find((f) => f.endsWith(".xcodeproj"));
      if (!proj) return cfg;
      const file = path.join(root, proj, "project.pbxproj");
      const text = fs.readFileSync(file, "utf8");
      const next = text.replace(
        /(name = "Upload Debug Symbols to Sentry";[\s\S]*?shellScript = )("(?:[^"\\]|\\.)*");/,
        (all, head, quoted) => {
          const script = JSON.parse(quoted);
          return script.includes(".xcode.env") ? all : head + JSON.stringify(SOURCE_ENV + script) + ";";
        }
      );
      if (next !== text) fs.writeFileSync(file, next);
      return cfg;
    }
  ]);
}

module.exports = (config) => withDebugFilesSourcingEnv(withAllowFailureEnv(config));
