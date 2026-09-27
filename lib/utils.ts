export function cn(...values: Array<string | false | null | undefined>) { return values.filter(Boolean).join(" "); }
export const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const dates = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
