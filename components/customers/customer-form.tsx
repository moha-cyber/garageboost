"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/customers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ first_name: form.get("first_name"), last_name: form.get("last_name"), email: form.get("email") || null, phone: form.get("phone") || null, last_visit_at: form.get("last_visit_at") || null, total_spent: Number(form.get("total_spent") || 0) }) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) return setError(data.error ?? "Impossible d’ajouter ce client.");
    router.push(`/dashboard/customers/${data.id}`); router.refresh();
  }
  return <form className="form card" onSubmit={submit}><label>Prénom<input required name="first_name" className="input" autoComplete="given-name" /></label><label>Nom<input required name="last_name" className="input" autoComplete="family-name" /></label><label>E-mail<input name="email" type="email" className="input" autoComplete="email" /></label><label>Téléphone<input name="phone" type="tel" className="input" autoComplete="tel" /></label><label>Dernière visite<input name="last_visit_at" type="date" className="input" /></label><label>Dépenses cumulées (€)<input name="total_spent" type="number" min="0" step="0.01" defaultValue="0" className="input" /></label>{error && <div className="notice error">{error}</div>}<button className="button" disabled={saving}>{saving ? "Ajout en cours…" : "Ajouter le client"}</button></form>;
}
