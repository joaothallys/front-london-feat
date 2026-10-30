// react-native com InteractionManager de volta, só para bibliotecas antigas
// (o RN 0.86 lança erro ao acessar InteractionManager). Ligado em metro.config.js.
const RN = require("react-native");

const InteractionManager = {
  runAfterInteractions(task) {
    let cancelled = false;
    let resolve;
    const done = new Promise((r) => { resolve = r; });
    const id = setTimeout(() => {
      if (cancelled) return;
      if (typeof task === "function") task();
      else if (task && typeof task.run === "function") task.run();
      resolve();
    }, 0);
    return {
      then: (onOk, onErr) => done.then(onOk, onErr),
      done: (...args) => done.then(...args),
      cancel() {
        cancelled = true;
        clearTimeout(id);
      }
    };
  },
  createInteractionHandle: () => 0,
  clearInteractionHandle: () => {},
  setDeadline: () => {}
};

const compat = {};
for (const key of Object.getOwnPropertyNames(RN)) {
  if (key === "InteractionManager") continue;
  Object.defineProperty(compat, key, Object.getOwnPropertyDescriptor(RN, key));
}
compat.InteractionManager = InteractionManager;

module.exports = compat;
