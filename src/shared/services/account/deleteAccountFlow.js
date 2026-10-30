import { Alert } from "react-native";
import { router } from "expo-router";
import { SessionService } from "./SessionService.js";
import { store } from "../../store/local-store.js";

export function confirmDeleteAccount({ deleting, setDeleting, refresh }) {
  if (deleting) return;
  Alert.alert(
    "Excluir minha conta?",
    "A exclusão é permanente. Seu perfil, treinos, histórico, medidas e o vínculo com Apple ou Google serão apagados. Não dá para recuperar esses dados.",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Continuar",
        style: "destructive",
        onPress: () => Alert.alert(
          "Confirmar exclusão",
          "Sua conta será excluída agora. O app volta para a tela de entrada e essa conta deixa de existir.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir minha conta", style: "destructive", onPress: () => runDeleteAccount({ setDeleting, refresh }) }
          ]
        )
      }
    ]
  );
}

async function runDeleteAccount({ setDeleting, refresh }) {
  setDeleting(true);
  try {
    await SessionService.deleteAccount();
    store.wipeLocal();
    refresh();
    router.replace("/login");
  } catch (err) {
    const raw = err && err.body && (err.body.error || err.body.message);
    Alert.alert("Não foi possível excluir", raw || "Tente de novo em instantes.");
    setDeleting(false);
  }
}
