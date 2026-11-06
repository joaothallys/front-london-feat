import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const ENABLED = "lumen.bio.enabled";
const LOCKED = "lumen.bio.locked";
const SESSION = "lumen.bio.session";
// Versões antigas guardavam a senha. Só lemos para migrar e apagar.
const LEGACY_EMAIL = "lumen.bio.email";
const LEGACY_PASSWORD = "lumen.bio.password";

const KEYCHAIN = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
// O próprio iOS exige a biometria para liberar este item, e ele deixa de valer
// se o cadastro de biometria do aparelho mudar.
const VAULT = Object.assign({ requireAuthentication: true }, KEYCHAIN);

let skipAutoLogin = false;

async function read(key) {
  try {
    return (await SecureStore.getItemAsync(key, KEYCHAIN)) || "";
  } catch (err) {
    return "";
  }
}

async function write(key, value) {
  try {
    if (!value) await SecureStore.deleteItemAsync(key, KEYCHAIN);
    else await SecureStore.setItemAsync(key, value, KEYCHAIN);
  } catch (err) {}
}

export const BiometricService = {
  async canUse() {
    try {
      const hw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return !!(hw && enrolled);
    } catch (err) {
      return false;
    }
  },

  async label() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const Face = LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;
      const Finger = LocalAuthentication.AuthenticationType.FINGERPRINT;
      if (types.indexOf(Face) >= 0) return "Face ID";
      if (types.indexOf(Finger) >= 0) return "Touch ID";
    } catch (err) {}
    return "Biometria";
  },

  async isEnabled() {
    return (await read(ENABLED)) === "1";
  },

  async canResume() {
    if ((await read(LOCKED)) === "1") return true;
    return !!(await this.legacyCredentials());
  },

  async legacyCredentials() {
    const email = await read(LEGACY_EMAIL);
    const password = await read(LEGACY_PASSWORD);
    if (!email || !password) return null;
    return { email, password };
  },

  async purgeLegacyPassword() {
    await write(LEGACY_EMAIL, "");
    await write(LEGACY_PASSWORD, "");
  },

  // "Sair" com biometria ligada guarda a sessão no cofre em vez de encerrá-la.
  // Devolve false quando não deu para guardar: quem chama encerra no servidor.
  async lockSession(refreshToken) {
    if (!refreshToken || !(await this.isEnabled())) return false;
    try {
      if (!SecureStore.canUseBiometricAuthentication()) return false;
      await SecureStore.deleteItemAsync(SESSION, VAULT);
      await SecureStore.setItemAsync(SESSION, refreshToken, VAULT);
      await write(LOCKED, "1");
      return true;
    } catch (err) {
      return false;
    }
  },

  // Cancelar ou errar a biometria devolve "": a tela segue no login manual.
  async unlockSession(prompt) {
    try {
      const options = Object.assign({ authenticationPrompt: prompt }, VAULT);
      return (await SecureStore.getItemAsync(SESSION, options)) || "";
    } catch (err) {
      return "";
    }
  },

  async clearLockedSession() {
    await write(LOCKED, "");
    try {
      await SecureStore.deleteItemAsync(SESSION, VAULT);
    } catch (err) {}
  },

  async authenticate(prompt) {
    try {
      const ready = await this.canUse();
      if (!ready) return false;
      const label = await this.label();
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt || ("Desbloquear o LumenFit com " + label),
        fallbackLabel: "Usar código do iPhone",
        cancelLabel: "Cancelar",
        disableDeviceFallback: false
      });
      return !!(result && result.success);
    } catch (err) {
      return false;
    }
  },

  async enable() {
    const ok = await this.authenticate("Confirme para ativar o desbloqueio");
    if (!ok) return false;
    await write(ENABLED, "1");
    return true;
  },

  async disable() {
    await write(ENABLED, "");
    await this.purgeLegacyPassword();
    await this.clearLockedSession();
  },

  suppressAutoLogin() {
    skipAutoLogin = true;
  },

  consumeAutoLogin() {
    if (skipAutoLogin) {
      skipAutoLogin = false;
      return false;
    }
    return true;
  }
};
