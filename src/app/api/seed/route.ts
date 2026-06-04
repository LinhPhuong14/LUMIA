import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { defaultFeatureFlags } from "@/data/flags";
import { lumiaProducts } from "@/data/catalog";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { ActivationCodeModel, FeatureFlagModel, ProductModel, SubscriptionPlanModel, UserModel } from "@/models";

export const runtime = "nodejs";

export async function POST() {
  if (!hasMongoConfig()) {
    return NextResponse.json({ error: "MongoDB chua duoc cau hinh." }, { status: 503 });
  }

  await connectToDatabase();

  await Promise.all(
    lumiaProducts.map((product) =>
      ProductModel.updateOne(
        { slug: product.slug },
        {
          $set: {
            slug: product.slug,
            name: product.name,
            tier: product.tier,
            tagline: product.tagline,
            description: product.description,
            price: product.price,
            durationMonths: product.durationMonths,
            features: product.features,
            status: "published",
          },
        },
        { upsert: true },
      ),
    ),
  );

  await Promise.all(
    lumiaProducts.map((product) =>
      SubscriptionPlanModel.updateOne(
        { code: product.tier },
        {
          $set: {
            code: product.tier,
            name: product.name,
            tier: product.tier,
            durationMonths: product.durationMonths,
            features: product.features,
          },
        },
        { upsert: true },
      ),
    ),
  );

  await Promise.all(
    Object.entries(defaultFeatureFlags).map(([key, enabled]) =>
      FeatureFlagModel.updateOne({ key }, { $set: { key, enabled } }, { upsert: true }),
    ),
  );

  await ActivationCodeModel.updateOne(
    { code: "LUMIA-DEEP-3M-2026" },
    {
      $set: {
        code: "LUMIA-DEEP-3M-2026",
        tier: "3m",
        durationMonths: 3,
        isRedeemed: false,
      },
    },
    { upsert: true },
  );

  const adminEmail = "admin@lumia.vn";
  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await UserModel.create({
      email: adminEmail,
      name: "LUMIA Admin",
      role: "superadmin",
      passwordHash: await hashPassword("Lum1aAdmin!"),
    });
  }

  return NextResponse.json({
    ok: true,
    seeded: true,
    adminCredentials: {
      email: adminEmail,
      password: "Lum1aAdmin!",
    },
  });
}
