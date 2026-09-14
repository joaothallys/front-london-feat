import { Alert } from "react-native";
import { router } from "expo-router";
import { SessionService } from "./SessionService.js";
import { store } from "../../store/local-store.js";

export function confirmDeleteAccount({ deleting, setDeleting, refresh }) {
  if (deleting) return;
  Alert.alert(
    "Excluir conta?",
    "Seus treinos, histórico e dados no servidor serão apagados. Essa ação não pode ser desfeita.",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Continuar",
        style: "destructive",
        onPress: () => Alert.alert(
          "Confirmar exclusão",
          "Tem certeza? Sua conta LumenFit será excluída agora.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir conta", style: "destructive", onPress: () => runDeleteAccount({ setDeleting, refresh }) }
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
    Alert.alert("Não foi possível excluir", "Tente de novo em instantes.");
    setDeleting(false);
  }
}
