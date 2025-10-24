export function safeFormatDate(input, locale = "es-AR") {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d)) return "—";
  try {
    if (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
      const fmt = new Intl.DateTimeFormat(locale);
      if (typeof fmt.format === "function") return fmt.format(d);
    }
  } catch {
    // ignore and try fallbacks
  }
  try {
    if (typeof d.toLocaleDateString === "function") return d.toLocaleDateString(locale);
  } catch {
    // ignore
  }
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${mon}/${year}`;
}

