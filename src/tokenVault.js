import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const KEYCHAIN = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

// Keychain é assíncrono: a fila garante que a última escrita seja a que fica,
// mesmo com um login logo depois de um logout.
let queue = Promise.resolve();

function enqueue(job) {
  queue = queue.then(job).catch(() => {});
  return queue;
}

// Sessões antigas ficavam no AsyncStorage, que é um arquivo sem criptografia
// própria. O original só é apagado depois de gravar no Keychain, para uma falha
// aqui não deslogar ninguém.
export async function loadTokens(key) {
  let saved = null;
  try {
    saved = await SecureStore.getItemAsync(key, KEYCHAIN);
  } catch (err) {
    saved = null;
  }
  let legacy = null;
  try {
    legacy = await AsyncStorage.getItem(key);
  } catch (err) {
    legacy = null;
  }
  if (legacy == null) return saved;
  if (saved == null) {
    try {
      await SecureStore.setItemAsync(key, legacy, KEYCHAIN);
    } catch (err) {
      return legacy;
    }
  }
  await AsyncStorage.removeItem(key).catch(() => {});
  return saved != null ? saved : legacy;
}

export function saveTokens(key, value) {
  return enqueue(() => SecureStore.setItemAsync(key, value, KEYCHAIN));
}

export function removeTokens(key) {
  return enqueue(async () => {
    await SecureStore.deleteItemAsync(key, KEYCHAIN);
    await AsyncStorage.removeItem(key);
  });
}
