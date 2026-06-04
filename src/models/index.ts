import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

function getModel<T>(name: string, schema: Schema<T>) {
  return (models[name] as Model<T> | undefined) ?? model<T>(name, schema);
}

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
      index: true,
    },
    avatarUrl: String,
    profile: {
      sleepGoal: String,
      wakeGoal: String,
      moodToday: String,
      bio: String,
    },
  },
  { timestamps: true },
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tier: { type: String, enum: ["free", "1m", "3m", "5m"], required: true },
    tagline: String,
    description: String,
    price: { type: Number, required: true },
    durationMonths: { type: Number, required: true },
    features: [{ type: String }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "published" },
  },
  { timestamps: true },
);

const SubscriptionPlanSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tier: { type: String, enum: ["free", "1m", "3m", "5m"], required: true },
    durationMonths: Number,
    features: [{ type: String }],
  },
  { timestamps: true },
);

const OrderItemSchema = new Schema(
  {
    productSlug: { type: String, required: true },
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    tier: { type: String, enum: ["free", "1m", "3m", "5m"], required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    orderCode: { type: Number, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["draft", "pending_payment", "paid", "provisioning", "fulfilled", "cancelled", "refunded"],
      default: "draft",
      index: true,
    },
    currency: { type: String, default: "VND" },
    totalAmount: { type: Number, required: true },
    tier: { type: String, enum: ["free", "1m", "3m", "5m"], required: true },
    items: { type: [OrderItemSchema], default: [] },
    paymentLinkId: String,
    payosOrderCode: Number,
    providerMetadata: { type: Schema.Types.Mixed },
    customerSnapshot: {
      email: String,
      name: String,
    },
  },
  { timestamps: true },
);

const PaymentSessionSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    provider: { type: String, default: "payos" },
    paymentLinkId: { type: String, index: true },
    orderCode: { type: Number, required: true, index: true },
    idempotencyKey: { type: String, required: true, unique: true },
    status: { type: String, enum: ["created", "paid", "cancelled", "failed"], default: "created" },
    checkoutUrl: String,
    returnUrl: String,
    cancelUrl: String,
    webhookPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

const SubscriptionEntitlementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    tier: { type: String, enum: ["free", "1m", "3m", "5m"], required: true },
    status: { type: String, enum: ["active", "expired", "revoked"], default: "active", index: true },
    source: { type: String, enum: ["order", "activation_code", "admin"], required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    activationCodeId: { type: Schema.Types.ObjectId, ref: "ActivationCode" },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const ActivationCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    tier: { type: String, enum: ["1m", "3m", "5m"], required: true },
    durationMonths: { type: Number, required: true },
    isRedeemed: { type: Boolean, default: false, index: true },
    redeemedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    redeemedAt: Date,
  },
  { timestamps: true },
);

const ActivityEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    eventType: { type: String, required: true, index: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

const JournalEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    mode: { type: String, enum: ["quick_dump", "guided"], required: true },
    content: { type: String, required: true },
    aiSummary: String,
  },
  { timestamps: true },
);

const MoodLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    mood: { type: String, required: true },
    intensity: { type: Number, min: 1, max: 5, required: true },
    cause: String,
    note: String,
  },
  { timestamps: true },
);

const AudioAssetSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    durationMinutes: Number,
    tierRequired: { type: String, enum: ["free", "1m", "3m", "5m"], default: "free" },
    imageUrl: String,
    audioUrl: String,
  },
  { timestamps: true },
);

const BadgeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    tierRequired: { type: String, enum: ["free", "1m", "3m", "5m"], default: "free" },
  },
  { timestamps: true },
);

const FeatureFlagSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    rolloutNotes: String,
  },
  { timestamps: true },
);

const AdminAuditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true },
    targetModel: { type: String, required: true },
    targetId: { type: String, required: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof UserSchema>;
export type OrderDocument = InferSchemaType<typeof OrderSchema>;
export type SubscriptionEntitlementDocument = InferSchemaType<typeof SubscriptionEntitlementSchema>;
export type ActivationCodeDocument = InferSchemaType<typeof ActivationCodeSchema>;

export const UserModel = getModel("User", UserSchema);
export const ProductModel = getModel("Product", ProductSchema);
export const SubscriptionPlanModel = getModel("SubscriptionPlan", SubscriptionPlanSchema);
export const OrderModel = getModel("Order", OrderSchema);
export const PaymentSessionModel = getModel("PaymentSession", PaymentSessionSchema);
export const SubscriptionEntitlementModel = getModel("SubscriptionEntitlement", SubscriptionEntitlementSchema);
export const ActivationCodeModel = getModel("ActivationCode", ActivationCodeSchema);
export const ActivityEventModel = getModel("ActivityEvent", ActivityEventSchema);
export const JournalEntryModel = getModel("JournalEntry", JournalEntrySchema);
export const MoodLogModel = getModel("MoodLog", MoodLogSchema);
export const AudioAssetModel = getModel("AudioAsset", AudioAssetSchema);
export const BadgeModel = getModel("Badge", BadgeSchema);
export const FeatureFlagModel = getModel("FeatureFlag", FeatureFlagSchema);
export const AdminAuditLogModel = getModel("AdminAuditLog", AdminAuditLogSchema);
