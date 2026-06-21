import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

type PatchBody = {
  stock_quantity?: number;
  in_stock?: boolean;
};

type PutBody = {
  slug?: string;
  name?: string;
  subtitle?: string | null;
  description?: string | null;
  price_vnd?: number;
  category?: string;
  features?: string[];
  image_url?: string | null;
  images?: { url: string; label?: string }[];
  variants?: { name: string; image_url?: string }[];
  in_stock?: boolean;
  stock_quantity?: number;
  sort_order?: number;
  is_active?: boolean;
};

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { id } = await params;
  const body = (await req.json()) as PatchBody;
  const update: Record<string, unknown> = {};
  if (body.stock_quantity !== undefined) update.stock_quantity = body.stock_quantity;
  if (body.in_stock !== undefined) update.in_stock = body.in_stock;

  const { error } = await admin.from("store_products").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { id } = await params;
  const body = (await req.json()) as PutBody;

  const update: Record<string, unknown> = {};
  if (body.slug !== undefined) update.slug = body.slug;
  if (body.name !== undefined) update.name = body.name;
  if (body.subtitle !== undefined) update.subtitle = body.subtitle;
  if (body.description !== undefined) update.description = body.description;
  if (body.price_vnd !== undefined) update.price_vnd = body.price_vnd;
  if (body.category !== undefined) update.category = body.category;
  if (body.features !== undefined) update.features = body.features;
  if (body.image_url !== undefined) update.image_url = body.image_url;
  if (body.images !== undefined) update.images = body.images;
  if (body.variants !== undefined) update.variants = body.variants;
  if (body.in_stock !== undefined) update.in_stock = body.in_stock;
  if (body.stock_quantity !== undefined) update.stock_quantity = body.stock_quantity;
  if (body.sort_order !== undefined) update.sort_order = body.sort_order;
  if (body.is_active !== undefined) update.is_active = body.is_active;

  const { error } = await admin.from("store_products").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { id } = await params;
  const { error } = await admin.from("store_products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
