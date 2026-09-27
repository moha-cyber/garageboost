"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoCustomersButton() {
  const router = useRouter(); const [status, setStatus] = useState(""); const [loading, setLoading] = useState(false);
  async function addDemoCustomers() { setLoading(true); setStatus(""); const response = await fetch("/api/customers/demo", { method: "POST" }); const data = await response.json(); setLoading(false); if (!response.ok) return setStatus(data.error ?? "Impossible de charger les exemples."); setStatus("5 clients de démonstration ont été ajoutés."); router.refresh(); }
  return <div className="actions"><button className="button secondary" type="button" disabled={loading} onClick={addDemoCustomers}>{loading ? "Ajout en cours…" : "Charger des clients de démonstration"}</button>{status && <span className="notice success">{status}</span>}</div>;
}
