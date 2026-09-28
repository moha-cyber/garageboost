"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Customer } from "@/types/database";
import { RiskBadge } from "@/components/ui/risk-badge";
import { dates, euros } from "@/lib/utils";

export function CustomerTable({
  customers,
  selectable = false,
  onSelection,
}: {
  customers: Customer[] | null;
  selectable?: boolean;
  onSelection?: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const safeCustomers = Array.isArray(customers) ? customers : [];

  const shown = useMemo(
    () =>
      safeCustomers
        .filter(
          (c) =>
            `${c.first_name} ${c.last_name} ${c.email ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (risk === "all" || c.risk_level === risk),
        )
        .sort((a, b) => b.risk_score - a.risk_score),
    [safeCustomers, query, risk],
  );

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];

    setSelected(next);
    onSelection?.(next);
  }

  return (
    <>
      <div className="actions customer-controls" style={{ marginBottom: 16 }}>
        <input
          className="input"
          style={{ maxWidth: 290 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client…"
          aria-label="Rechercher un client"
        />

        <select
          className="select"
          style={{ maxWidth: 180 }}
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          aria-label="Filtrer par niveau de risque"
        >
          <option value="all">Tous les risques</option>
          <option value="critical">Critique</option>
          <option value="high">Élevé</option>
          <option value="medium">Modéré</option>
          <option value="low">Faible</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table customer-table">
          <thead>
            <tr>
              {selectable && <th />}
              <th>Client</th>
              <th>Dernière visite</th>
              <th>Dépenses</th>
              <th>Score</th>
              <th>Niveau</th>
            </tr>
          </thead>

          <tbody className="customer-cards">
            {shown.map((c) => (
              <tr className="customer-row" key={c.id}>
                {selectable && (
                  <td className="selection">
                    <input
                      aria-label={`Sélectionner ${c.first_name}`}
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => toggle(c.id)}
                    />
                  </td>
                )}

                <td>
                  <Link
                    className="accent"
                    href={`/dashboard/customers/${c.id}`}
                  >
                    {c.first_name} {c.last_name}
                  </Link>
                  <br />
                  <span className="muted">
                    {c.email ?? c.phone ?? "—"}
                  </span>
                </td>

                <td data-label="Dernière visite">
                  {c.last_visit_at
                    ? dates.format(new Date(c.last_visit_at))
                    : "Jamais"}
                </td>

                <td data-label="Dépenses">
                  {euros.format(c.total_spent)}
                </td>

                <td data-label="Score">
                  <strong>{c.risk_score}/100</strong>
                </td>

                <td data-label="Niveau">
                  <RiskBadge level={c.risk_level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shown.length === 0 && (
          <div className="empty">
            Aucun client ne correspond à cette recherche.
          </div>
        )}
      </div>
    </>
  );
}
