import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateRiskScore } from "@/lib/scoring";

const samples = [
  { first_name: "Sophie", last_name: "Martin", email: "sophie.martin@exemple.fr", phone: "06 12 34 56 78", last_visit_at: "2024-07-12", total_spent: 1280 },
  { first_name: "Thomas", last_name: "Bernard", email: "thomas.bernard@exemple.fr", phone: "06 23 45 67 89", last_visit_at: "2025-01-18", total_spent: 740 },
  { first_name: "Lina", last_name: "Dubois", email: "lina.dubois@exemple.fr", phone: "06 34 56 78 90", last_visit_at: "2025-04-03", total_spent: 390 },
  { first_name: "Marc", last_name: "Leroy", email: "marc.leroy@exemple.fr", phone: "06 45 67 89 01", last_visit_at: null, total_spent: 520 },
  { first_name: "Nora", last_name: "Petit", email: "nora.petit@exemple.fr", phone: "06 56 78 90 12", last_visit_at: "2025-08-20", total_spent: 210 },
];

export async function POST() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); const { data: garage } = await supabase.from("garages").select("id").eq("owner_id", user.id).single(); if (!garage) return NextResponse.json({ error: "Garage introuvable" }, { status: 400 }); const { count } = await supabase.from("customers").select("id", { count: "exact", head: true }).eq("garage_id", garage.id); if (count) return NextResponse.json({ error: "Des clients existent déjà. Utilisez l’ajout manuel ou l’import CSV." }, { status: 409 }); const rows = samples.map(customer => { const score = calculateRiskScore(customer.last_visit_at, customer.total_spent); return { ...customer, garage_id: garage.id, risk_score: score.score, risk_level: score.level }; }); const { error } = await supabase.from("customers").insert(rows); return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ created: rows.length }, { status: 201 }); }
