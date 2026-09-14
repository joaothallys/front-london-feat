import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const ENABLED = "lumen.bio.enabled";
const EMAIL = "lumen.bio.email";
const PASSWORD = "lumen.bio.password";

async function read(key) {
  try {
    return (await SecureStore.getItemAsync(key)) || "";
  } catch (err) {
    return "";
  }
}

async function write(key, value) {
  try {
    if (!value) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
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

  async credentials() {
    const email = await read(EMAIL);
    const password = await read(PASSWORD);
    if (!email || !password) return null;
    return { email, password };
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

  async enable(email, password) {
    const ok = await this.authenticate("Confirme para ativar o desbloqueio");
    if (!ok) return false;
    await write(ENABLED, "1");
    if (email) await write(EMAIL, email);
    if (password) await write(PASSWORD, password);
    return true;
  },

  async rememberLogin(email, password) {
    if (!(await this.isEnabled())) return;
    if (email) await write(EMAIL, email);
    if (password) await write(PASSWORD, password);
  },

  async disable() {
    await write(ENABLED, "");
    await write(EMAIL, "");
    await write(PASSWORD, "");
  }
};
