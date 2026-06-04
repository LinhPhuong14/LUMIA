import { z } from "zod";

export const createCheckoutSchema = z.object({
  productSlug: z.string().min(1),
});
