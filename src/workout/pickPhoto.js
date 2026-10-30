import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

let inflight = false;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function allowed(perm) {
  if (!perm) return false;
  return perm.granted === true || perm.status === "granted" || perm.accessPrivileges === "limited" || perm.accessPrivileges === "all";
}

async function cameraReady() {
  const cur = await ImagePicker.getCameraPermissionsAsync();
  if (allowed(cur)) return true;
  if (cur.canAskAgain === false) return false;
  const next = await ImagePicker.requestCameraPermissionsAsync();
  return allowed(next);
}

async function libraryReady() {
  if (Platform.OS === "ios") return true;
  const cur = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (allowed(cur)) return true;
  if (cur.canAskAgain === false) return false;
  const next = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return allowed(next);
}

export async function pickWorkoutPhoto(source) {
  if (inflight) return null;
  inflight = true;
  try {
    if (source === "camera") {
      const ok = await cameraReady();
      if (!ok) {
        Alert.alert("Permissão necessária", "Libere a câmera para tirar a foto.");
        return null;
      }
    } else {
      const ok = await libraryReady();
      if (!ok) {
        Alert.alert("Permissão necessária", "Libere a galeria para escolher a foto.");
        return null;
      }
    }

    await wait(650);

    const opts = { mediaTypes: ["images"], quality: 0.88, allowsEditing: false };
    const res = source === "camera"
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets || !res.assets[0]) return null;
    return res.assets[0].uri;
  } catch (err) {
    Alert.alert("Não deu para abrir", (err && err.message) || "Tente de novo.");
    return null;
  } finally {
    inflight = false;
  }
}

const PHOTO_DIR = FileSystem.documentDirectory ? FileSystem.documentDirectory + "workout-photos/" : null;

// A câmera devolve um arquivo no cache, que o iOS apaga quando quer.
// Copia para Documents para a foto continuar no histórico.
export async function keepWorkoutPhoto(uri) {
  if (!uri || !PHOTO_DIR || uri.indexOf(PHOTO_DIR) === 0) return uri || null;
  try {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true }).catch(() => {});
    const ext = (uri.split("?")[0].match(/\.(jpe?g|png|heic|webp)$/i) || [".jpg"])[0];
    const dest = PHOTO_DIR + Date.now() + ext;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch (err) {
    return uri;
  }
}
