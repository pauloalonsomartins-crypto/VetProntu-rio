const tz = "America/Sao_Paulo";

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" }).format(new Date(d));
}

export function fmtDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: tz }).format(new Date(d));
}

/** Data (YYYY-MM-DD) para input[type=date]. */
export function toInputDate(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function ageLabel(birth: Date | null | undefined) {
  if (!birth) return "Idade não informada";
  const now = new Date();
  let months = (now.getFullYear() - birth.getUTCFullYear()) * 12 + (now.getMonth() - birth.getUTCMonth());
  if (now.getDate() < birth.getUTCDate()) months--;
  if (months < 1) return "Menos de 1 mês";
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return `${y} ${y === 1 ? "ano" : "anos"}${m ? ` e ${m} ${m === 1 ? "mês" : "meses"}` : ""}`;
}

export function dueStatus(next: Date | null | undefined): "none" | "late" | "soon" | "ok" {
  if (!next) return "none";
  const diff = (new Date(next).getTime() - Date.now()) / 86400000;
  if (diff < 0) return "late";
  if (diff <= 30) return "soon";
  return "ok";
}
