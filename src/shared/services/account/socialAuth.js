export function isAuthCanceled(err) {
  if (!err) return false;
  if (err.code === "canceled") return true;
  const code = String(err.code || "");
  return code === "ERR_REQUEST_CANCELED" || code === "ERR_CANCELED" || code === "1001";
}

export function isExistingSocialAccount(json) {
  if (!json || typeof json !== "object") return false;
  if (json.created === false) return true;
  const msg = String(json.message || "").toLowerCase();
  return msg.indexOf("já existe uma conta") >= 0;
}

export function passwordAuthMessage(err) {
  const status = err && err.status;
  const raw = String((err && err.body && (err.body.error || err.body.message)) || (err && err.message) || "");
  const lower = raw.toLowerCase();
  if (lower.indexOf("esta conta usa login social") >= 0) {
    return "Esta conta usa login social. Entre com Google ou Apple.";
  }
  if (status === 409 || lower.indexOf("já cadastrado") >= 0) {
    if (lower.indexOf("google") >= 0) return "E-mail já cadastrado. Entre com o Google.";
    if (lower.indexOf("apple") >= 0) return "E-mail já cadastrado. Entre com a Apple.";
    return "E-mail já cadastrado. Faça login.";
  }
  return raw || "Não foi possível autenticar.";
}

export function socialAuthMessage(err) {
  if (!err || isAuthCanceled(err)) return "";
  if (err.code === "apple_unavailable") return err.message;
  const status = err.status;
  const raw = String((err.body && (err.body.error || err.body.message)) || err.message || "");
  if (raw.toLowerCase().indexOf("esta conta usa login social") >= 0) {
    return "Esta conta usa login social. Entre com Google ou Apple.";
  }
  if (status === 401) return "Não foi possível validar o login. Tente de novo.";
  if (status === 403) return "Esta conta foi excluída. Restaure a conta para entrar.";
  if (status === 409) return "Este e-mail já está vinculado a outra conta.";
  if (status === 503) return "Login social temporariamente indisponível.";
  if (status === 400) return "Não foi possível concluir o login. Tente de novo.";
  return raw || "Não foi possível autenticar.";
}
