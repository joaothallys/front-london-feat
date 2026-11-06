import AsyncStorage from "@react-native-async-storage/async-storage";
import { setStorageBackend, seedStorageCache } from "@shared/platform/storage.js";
import { store } from "@shared/store/local-store.js";
import { ExerciseCache } from "@shared/services/cache/ExerciseCache.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { applyApiUrl } from "./config.js";
import { registerCatalog } from "./catalog.js";
import { hydrateGifCache } from "./media/GifCache.js";
import { loadTokens, removeTokens, saveTokens } from "./tokenVault.js";

const TOKEN_KEY = "london-fitness-tokens";
const KEYS = [
  "london-fitness-v2",
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
    const tokens = await loadTokens(TOKEN_KEY);
    if (tokens != null) cache[TOKEN_KEY] = tokens;
    seedStorageCache(cache);
    setStorageBackend({
      get(key) {
        return cache[key] || null;
      },
      set(key, value) {
        cache[key] = value;
        if (key === TOKEN_KEY) saveTokens(key, value);
        else AsyncStorage.setItem(key, value).catch(() => {});
      },
      remove(key) {
        delete cache[key];
        if (key === TOKEN_KEY) removeTokens(key);
        else AsyncStorage.removeItem(key).catch(() => {});
      }
    });
    try { store.rehydrate(); } catch (err) {}
    try { ExerciseCache.rehydrate(); } catch (err) {}
    try { registerCatalog(); } catch (err) {}
    hydrateGifCache().catch(() => {});
    if (SessionService.hasToken()) {
      // Com a sessão ativa a senha antiga já não serve para nada.
      BiometricService.purgeLegacyPassword().catch(() => {});
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
