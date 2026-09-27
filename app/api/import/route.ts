import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateRiskScore } from "@/lib/scoring";

type Row = Record<string, string>;

const MAX_ROWS = 5000;

const value = (
  row: Row,
  map: Record<string, string>,
  key: string
): string => {
  const source = map[key];
  return source ? String(row[source] ?? "").trim() : "";
};

const money = (value: string): number => {
  if (!value) return 0;

  const normalized = value
    .replace(/\s/g, "")
    .replace(/[€$£]/g, "")
    .replace(/[^0-9,.-]/g, "")
    .replace(",", ".");

  const result = Number(normalized);
  return Number.isFinite(result) ? result : 0;
};

const date = (value: string): string | null => {
  if (!value) return null;

  const normalized = value.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = new Date(`${normalized}T00:00:00Z`);
    return Number.isNaN(parsed.getTime())
      ? null
      : parsed.toISOString().slice(0, 10);
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split("/");
    const parsed = new Date(`${year}-${month}-${day}T00:00:00Z`);
    return Number.isNaN(parsed.getTime())
      ? null
      : parsed.toISOString().slice(0, 10);
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      rows?: Row[];
      mapping?: Record<string, string>;
    };

    const rows = body.rows;
    const mapping = body.mapping;

    if (
      !Array.isArray(rows) ||
      rows.length === 0 ||
      rows.length > MAX_ROWS ||
      !mapping ||
      typeof mapping.first_name !== "string" ||
      typeof mapping.last_name !== "string"
    ) {
      return NextResponse.json(
        { error: `Fichier ou mapping invalide. Maximum ${MAX_ROWS} lignes.` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data: garage, error: garageError } = await supabase
      .from("garages")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (garageError || !garage) {
      return NextResponse.json(
        { error: "Créez d’abord votre garage." },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    let visits = 0;
    let skipped = 0;

    for (const row of rows) {
      const first = value(row, mapping, "first_name");
      const last = value(row, mapping, "last_name");

      if (!first || !last) {
        skipped++;
        continue;
      }

      const emailValue = value(row, mapping, "email");
      const email = emailValue ? emailValue.toLowerCase() : null;
      const phone = value(row, mapping, "phone") || null;
      const lastVisit = date(value(row, mapping, "last_visit_at"));
      const spent = money(value(row, mapping, "total_spent"));

      const score = calculateRiskScore(lastVisit, spent);

      let customerId: string | undefined;

      if (email) {
        const { data: existing, error: existingError } = await supabase
          .from("customers")
          .select("id")
          .eq("garage_id", garage.id)
          .eq("email", email)
          .maybeSingle();

        if (existingError) {
          skipped++;
          continue;
        }

        if (existing) {
          const { error } = await supabase
            .from("customers")
            .update({
              garage_id: garage.id,
              first_name: first,
              last_name: last,
              email,
              phone,
              last_visit_at: lastVisit,
              total_spent: spent,
              risk_score: score.score,
              risk_level: score.level,
            })
            .eq("id", existing.id)
            .eq("garage_id", garage.id);

          if (error) {
            skipped++;
            continue;
          }

          updated++;
          customerId = existing.id;
        }
      }

      if (!customerId) {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            garage_id: garage.id,
            first_name: first,
            last_name: last,
            email,
            phone,
            last_visit_at: lastVisit,
            total_spent: spent,
            risk_score: score.score,
            risk_level: score.level,
          })
          .select("id")
          .single();

        if (error || !data) {
          skipped++;
          continue;
        }

        created++;
        customerId = data.id;
      }

      const make = value(row, mapping, "vehicle_make");
      const model = value(row, mapping, "vehicle_model");
      const registration = value(row, mapping, "registration");

      if (make || model || registration) {
        await supabase.from("vehicles").insert({
          customer_id: customerId,
          make: make || null,
          model: model || null,
          registration: registration || null,
          mileage: money(value(row, mapping, "mileage")) || null,
        });
      }

      const visited = date(value(row, mapping, "visit_date"));

      if (visited) {
        const { error } = await supabase.from("visits").insert({
          customer_id: customerId,
          visited_at: visited,
          amount: money(value(row, mapping, "visit_amount")),
          service_type: value(row, mapping, "service_type") || null,
        });

        if (!error) {
          visits++;
        }
      }
    }

    return NextResponse.json({
      created,
      updated,
      visits,
      skipped,
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de traiter le fichier importé" },
      { status: 400 }
    );
  }
}
