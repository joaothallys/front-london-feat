import AsyncStorage from "@react-native-async-storage/async-storage";
import { setStorageBackend, seedStorageCache } from "@shared/platform/storage.js";
import { store } from "@shared/store/local-store.js";
import { ExerciseCache } from "@shared/services/cache/ExerciseCache.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { applyApiUrl } from "./config.js";
import { registerCatalog } from "./catalog.js";
import { hydrateGifCache } from "./media/GifCache.js";

const KEYS = [
  "london-fitness-v2",
  "london-fitness-tokens",
  "london-fitness-exercise-cache"
];

export async function bootNative() {
  try {
    applyApiUrl();
    let pairs = [];
    try {
      pairs = await AsyncStorage.multiGet(KEYS);
    } catch (err) {
      pairs = [];
    }
    const cache = {};
    pairs.forEach(([key, value]) => {
      if (value != null) cache[key] = value;
    });
    seedStorageCache(cache);
    setStorageBackend({
      get(key) {
        return cache[key] || null;
      },
      set(key, value) {
        cache[key] = value;
        AsyncStorage.setItem(key, value).catch(() => {});
      },
      remove(key) {
        delete cache[key];
        AsyncStorage.removeItem(key).catch(() => {});
      }
    });
    try { store.rehydrate(); } catch (err) {}
    try { ExerciseCache.rehydrate(); } catch (err) {}
    try { registerCatalog(); } catch (err) {}
    hydrateGifCache().catch(() => {});
    if (SessionService.hasToken()) {
      try {
        await SessionService.hydrate(store.get());
        store.persist();
      } catch (err) {}
    }
  } catch (err) {}
  try {
    return store.get();
  } catch (err) {
    return null;
  }
}
