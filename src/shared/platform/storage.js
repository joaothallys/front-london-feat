const memory = {};

let backend = {
  get(key) {
    if (typeof localStorage !== "undefined") {
      try { return localStorage.getItem(key); } catch (err) { return memory[key] || null; }
    }
    return memory[key] || null;
  },
  set(key, value) {
    memory[key] = value;
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(key, value); } catch (err) {}
    }
  },
  remove(key) {
    delete memory[key];
    if (typeof localStorage !== "undefined") {
      try { localStorage.removeItem(key); } catch (err) {}
    }
  }
};

export function setStorageBackend(next) {
  if (next && typeof next.get === "function") backend = next;
}

export function storageGet(key) {
  return backend.get(key);
}

export function storageSet(key, value) {
  backend.set(key, value);
}

export function storageRemove(key) {
  backend.remove(key);
}

export function seedStorageCache(entries) {
  Object.keys(entries || {}).forEach((key) => {
    if (entries[key] != null) memory[key] = entries[key];
  });
}
