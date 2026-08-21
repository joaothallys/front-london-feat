import * as FileSystem from "expo-file-system/legacy";

const mem = new Map();
const DIR = (FileSystem.cacheDirectory || FileSystem.documentDirectory || "") + "london-gifs/";
let ready = null;

function fileKey(id) {
  return String(id || "x").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function pathFor(id) {
  return DIR + fileKey(id) + ".gif";
}

async function ensureDir() {
  if (!DIR) return;
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

export async function hydrateGifCache() {
  if (ready) return ready;
  ready = (async () => {
    try {
      await ensureDir();
      const files = await FileSystem.readDirectoryAsync(DIR);
      files.forEach((file) => {
        if (!/\.gif$/i.test(file)) return;
        mem.set(file.replace(/\.gif$/i, ""), DIR + file);
      });
    } catch (err) {}
  })();
  return ready;
}

export function cachedGif(id) {
  if (!id) return "";
  return mem.get(fileKey(id)) || "";
}

export async function warmGif(id, remoteUrl) {
  if (!remoteUrl) return cachedGif(id) || "";
  const key = fileKey(id || remoteUrl);
  if (mem.has(key)) return mem.get(key);
  try {
    await ensureDir();
    const dest = pathFor(key);
    const info = await FileSystem.getInfoAsync(dest);
    if (info.exists) {
      mem.set(key, dest);
      return dest;
    }
    const res = await FileSystem.downloadAsync(remoteUrl, dest);
    const uri = (res && res.uri) || dest;
    mem.set(key, uri);
    return uri;
  } catch (err) {
    return remoteUrl;
  }
}
