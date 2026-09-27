import type { RiskLevel } from "@/lib/scoring";
export type Garage = { id: string; owner_id: string; name: string; email: string | null; phone: string | null; created_at: string };
export type Customer = { id: string; garage_id: string; first_name: string; last_name: string; email: string | null; phone: string | null; last_visit_at: string | null; total_spent: number; risk_score: number; risk_level: RiskLevel; created_at: string; updated_at: string };
export type Vehicle = { id: string; customer_id: string; make: string | null; model: string | null; registration: string | null; mileage: number | null; created_at: string };
export type Visit = { id: string; customer_id: string; visited_at: string; amount: number; service_type: string | null; created_at: string };
export type Campaign = { id: string; garage_id: string; name: string; status: "draft" | "ready" | "sent"; created_at: string; messages?: { count: number }[] };
