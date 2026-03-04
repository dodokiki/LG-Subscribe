import type { Product, ProductCategory, ProductStatus } from "@/lib/types"
import type { ProductFormValues } from "@/lib/validations"

export type ProductRow = {
  id: string
  name: string
  model_number: string
  description: string | null
  category: string
  image_url: string | null
  feature_tags: string[]
  status: string
  created_at: string
  updated_at: string
}

export type SubscriptionTierRow = {
  id: string
  product_id: string
  contract_years: number
  monthly_price_thb: number
  service_frequency: string
  created_at: string
}

export function rowToProduct(row: ProductRow, tiers: SubscriptionTierRow[]): Product {
  return {
    id: row.id,
    name: row.name,
    modelNumber: row.model_number,
    description: row.description ?? "",
    category: row.category as ProductCategory,
    imageUrl: row.image_url,
    featureTags: row.feature_tags ?? [],
    status: row.status as ProductStatus,
    subscriptionTiers: tiers.map((t) => ({
      id: t.id,
      contractYears: t.contract_years,
      monthlyPriceThb: t.monthly_price_thb,
      serviceFrequency: t.service_frequency,
    })),
  }
}

export function formValuesToInsert(
  values: ProductFormValues
): { product: Omit<ProductRow, "id" | "created_at" | "updated_at">; tiers: Omit<SubscriptionTierRow, "id" | "product_id" | "created_at">[] } {
  return {
    product: {
      name: values.name,
      model_number: values.modelNumber,
      description: values.description,
      category: values.category,
      image_url: values.imageUrl,
      feature_tags: values.featureTags,
      status: values.status,
    },
    tiers: values.subscriptionTiers.map((t) => ({
      contract_years: t.contractYears,
      monthly_price_thb: t.monthlyPriceThb,
      service_frequency: t.serviceFrequency,
    })),
  }
}

export function formValuesToUpdate(
  productId: string,
  values: ProductFormValues
): { product: Partial<ProductRow>; tiers: { id?: string; product_id: string; contract_years: number; monthly_price_thb: number; service_frequency: string }[] } {
  return {
    product: {
      name: values.name,
      model_number: values.modelNumber,
      description: values.description,
      category: values.category,
      image_url: values.imageUrl,
      feature_tags: values.featureTags,
      status: values.status,
    },
    tiers: values.subscriptionTiers.map((t) => ({
      id: t.id,
      product_id: productId,
      contract_years: t.contractYears,
      monthly_price_thb: t.monthlyPriceThb,
      service_frequency: t.serviceFrequency,
    })),
  }
}
