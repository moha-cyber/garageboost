import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(150),
  content: z.string().trim().min(1).max(10000),
  customerIds: z.array(z.string().uuid()).min(1).max(5000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = schema.safeParse(body);

    if (!input.success) {
      return NextResponse.json(
        { error: "Campagne invalide" },
        { status: 400 }
      );
    }

    const customerIds = [...new Set(input.data.customerIds)];

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
        { error: "Garage introuvable" },
        { status: 400 }
      );
    }

    // SECURITY: verify every selected customer belongs to the
    // authenticated user's garage before creating any message.
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id")
      .eq("garage_id", garage.id)
      .in("id", customerIds);

    if (customersError) {
      return NextResponse.json(
        { error: "Impossible de vérifier les clients" },
        { status: 500 }
      );
    }

    const allowedCustomerIds = new Set(
      (customers ?? []).map((customer) => customer.id)
    );

    const unauthorized = customerIds.some(
      (customerId) => !allowedCustomerIds.has(customerId)
    );

    if (unauthorized) {
      return NextResponse.json(
        { error: "Un ou plusieurs clients ne sont pas autorisés" },
        { status: 403 }
      );
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        garage_id: garage.id,
        name: input.data.name,
        status: "draft",
      })
      .select("id")
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: campaignError?.message ?? "Création de la campagne impossible" },
        { status: 400 }
      );
    }

    const messages = customerIds.map((customer_id) => ({
      campaign_id: campaign.id,
      customer_id,
      channel: "email" as const,
      content: input.data.content,
      status: "draft" as const,
    }));

    const { error: messageError } = await supabase
      .from("messages")
      .insert(messages);

    if (messageError) {
      // Avoid leaving an empty campaign behind when message creation fails.
      await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaign.id)
        .eq("garage_id", garage.id);

      return NextResponse.json(
        { error: messageError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { id: campaign.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Requête invalide" },
      { status: 400 }
    );
  }
}
