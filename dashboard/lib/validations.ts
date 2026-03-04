import { z } from "zod"
import {
  CONTRACT_YEAR_OPTIONS,
  SERVICE_FREQUENCY_OPTIONS,
  PRODUCT_CATEGORIES,
} from "./types"

const subscriptionTierSchema = z.object({
  id: z.string(),
  contractYears: z.number().min(1, "Required"),
  monthlyPriceThb: z.number().min(0, "Must be ≥ 0"),
  serviceFrequency: z.string().min(1, "Required"),
})

const categoryEnum = z.enum(PRODUCT_CATEGORIES as unknown as [string, ...string[]])

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  modelNumber: z.string().min(1, "Model number is required"),
  description: z.string(),
  category: categoryEnum,
  imageUrl: z.string().nullable(),
  featureTags: z.array(z.string()),
  status: z.enum(["active", "draft"]),
  subscriptionTiers: z
    .array(subscriptionTierSchema)
    .min(1, "Add at least one subscription tier"),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export const defaultSubscriptionTier = () => ({
  id: crypto.randomUUID?.() ?? `t-${Date.now()}`,
  contractYears: CONTRACT_YEAR_OPTIONS[0],
  monthlyPriceThb: 0,
  serviceFrequency: SERVICE_FREQUENCY_OPTIONS[0],
})

export const defaultProductFormValues: ProductFormValues = {
  name: "",
  modelNumber: "",
  description: "",
  category: "Fridge",
  imageUrl: null,
  featureTags: [],
  status: "draft",
  subscriptionTiers: [defaultSubscriptionTier()],
}
