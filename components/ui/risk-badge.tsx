import type { RiskLevel } from "@/lib/scoring";
const labels: Record<RiskLevel, string> = { critical: "Critique", high: "Élevé", medium: "Modéré", low: "Faible" };
export function RiskBadge({ level }: { level: RiskLevel }) { return <span className={`badge ${level}`}>{labels[level]}</span>; }
