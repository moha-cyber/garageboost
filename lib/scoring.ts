export type RiskLevel = "critical" | "high" | "medium" | "low";
export type ScoreResult = { score: number; level: RiskLevel; reasons: string[]; recommendation: string };

export function calculateRiskScore(lastVisit: string | null, totalSpent: number | null): ScoreResult {
  let score = 0; const reasons: string[] = [];
  if (!lastVisit) { score = 80; reasons.push("Aucune visite enregistrée"); }
  else {
    const months = (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
    if (months > 12) { score += 50; reasons.push("Dernière visite il y a plus de 12 mois"); }
    else if (months > 9) { score += 35; reasons.push("Dernière visite il y a plus de 9 mois"); }
    else if (months > 6) { score += 20; reasons.push("Dernière visite il y a plus de 6 mois"); }
  }
  if ((totalSpent ?? 0) >= 1000) { score += 20; reasons.push("Client à forte valeur (≥ 1 000 €)"); }
  else if ((totalSpent ?? 0) >= 500) { score += 10; reasons.push("Client à valeur élevée (≥ 500 €)"); }
  score = Math.min(score, 100);
  const level: RiskLevel = score >= 70 ? "critical" : score >= 40 ? "high" : score >= 20 ? "medium" : "low";
  const recommendation = level === "critical" ? "Relancer dès maintenant par téléphone." : level === "high" ? "Envoyer une relance personnalisée cette semaine." : level === "medium" ? "Prévoir une relance automatisée." : "Conserver dans le suivi habituel.";
  return { score, level, reasons: reasons.length ? reasons : ["Activité récente"], recommendation };
}
