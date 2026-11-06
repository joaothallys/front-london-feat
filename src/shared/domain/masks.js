const EMAIL_MAX = 254;
const NAME_MAX = 80;
const EMAIL_RE = /^[a-z0-9_%+-]+(?:\.[a-z0-9_%+-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
const DDD_RE = /^(?:1[1-9]|2[12478]|3[1-578]|4[1-9]|5[1345]|6[1-9]|7[13-579]|8[1-9]|9[1-9])/;

// Máscara do campo: sem espaços, acentos ou maiúsculas e com um único "@".
export function maskEmail(value) {
  const clean = String(value || "")
    .normalize("NFD")
    .toLowerCase()
    .replace(/[^a-z0-9._%+\-@]/g, "");
  const at = clean.indexOf("@");
  const masked = at < 0 ? clean : clean.slice(0, at + 1) + clean.slice(at + 1).replace(/@/g, "");
  return masked.slice(0, EMAIL_MAX);
}

export function isValidEmail(value) {
  const email = String(value || "").trim();
  return email.length <= EMAIL_MAX && EMAIL_RE.test(email);
}

// Só letras (com acento), apóstrofo, hífen e espaço simples. O espaço final
// fica para a pessoa conseguir digitar o sobrenome; quem salva usa trim().
export function maskName(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/’/g, "'")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿĀ-ſ' -]/g, "")
    .replace(/ {2,}/g, " ")
    .replace(/^ /, "")
    .slice(0, NAME_MAX);
}

export function isValidName(value) {
  return String(value || "").trim().length >= 2;
}

// Telefone colado ou preenchido com +55 perde o DDI. O "(" indica que o texto
// já passou pela máscara: aí um "55" no começo é o DDD do RS, não o DDI.
export function maskPhone(value) {
  const raw = String(value || "").trim();
  let d = raw.replace(/\D/g, "");
  if (raw[0] !== "(" && d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return "(" + d;
  if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}

// Celular tem 11 dígitos e começa com 9 depois do DDD; fixo tem 10.
export function isValidPhone(value) {
  const d = String(value || "").replace(/\D/g, "");
  if (!DDD_RE.test(d)) return false;
  return d.length === 10 || (d.length === 11 && d[2] === "9");
}

// Até 3 dígitos e 1 casa decimal, com vírgula: "175", "82,5".
export function maskMeasure(value) {
  const [int, ...rest] = String(value || "")
    .replace(/\./g, ",")
    .replace(/[^\d,]/g, "")
    .split(",");
  const head = int.slice(0, 3);
  if (!head || !rest.length) return head;
  return head + "," + rest.join("").slice(0, 1);
}
