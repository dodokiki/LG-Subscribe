"use server"

import { createServiceRoleClient } from "@/lib/supabase/server"
import {
  rowToProduct,
  formValuesToInsert,
  formValuesToUpdate,
} from "@/lib/supabase/products"
import type { Product } from "@/lib/types"
import type { ProductFormValues } from "@/lib/validations"

export async function getProducts(): Promise<Product[]> {
  const supabase = createServiceRoleClient()
  const { data: rows, error } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false })
  if (error) throw new Error(error.message)

  const { data: tierRows } = await supabase.from("subscription_tiers").select("*")
  const tiersByProduct = (tierRows ?? []).reduce<Record<string, typeof tierRows>>(
    (acc, t) => {
      const pid = t.product_id
      if (!acc[pid]) acc[pid] = []
      acc[pid].push(t)
      return acc
    },
    {}
  )

  return (rows ?? []).map((row) =>
    rowToProduct(row, tiersByProduct[row.id] ?? [])
  )
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  const supabase = createServiceRoleClient()
  const { product, tiers } = formValuesToInsert(values)
  const { data: inserted, error: errProduct } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()
  if (errProduct) throw new Error(errProduct.message)

  if (tiers.length) {
    const { error: errTiers } = await supabase.from("subscription_tiers").insert(
      tiers.map((t) => ({ ...t, product_id: inserted.id }))
    )
    if (errTiers) throw new Error(errTiers.message)
  }

  const { data: tierRows } = await supabase
    .from("subscription_tiers")
    .select("*")
    .eq("product_id", inserted.id)
  return rowToProduct(inserted, tierRows ?? [])
}

export async function updateProduct(
  productId: string,
  values: ProductFormValues
): Promise<Product> {
  const supabase = createServiceRoleClient()
  const { product, tiers } = formValuesToUpdate(productId, values)
  const { data: updated, error: errProduct } = await supabase
    .from("products")
    .update(product)
    .eq("id", productId)
    .select()
    .single()
  if (errProduct) throw new Error(errProduct.message)

  await supabase.from("subscription_tiers").delete().eq("product_id", productId)
  if (tiers.length) {
    const { error: errTiers } = await supabase.from("subscription_tiers").insert(
      tiers.map(({ product_id, contract_years, monthly_price_thb, service_frequency }) => ({
        product_id,
        contract_years,
        monthly_price_thb,
        service_frequency,
      }))
    )
    if (errTiers) throw new Error(errTiers.message)
  }

  const { data: tierRows } = await supabase
    .from("subscription_tiers")
    .select("*")
    .eq("product_id", productId)
  return rowToProduct(updated, tierRows ?? [])
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("products").delete().eq("id", productId)
  if (error) throw new Error(error.message)
}

export async function duplicateProduct(productId: string): Promise<Product> {
  const products = await getProducts()
  const source = products.find((p) => p.id === productId)
  if (!source) throw new Error("Product not found")
  const values: ProductFormValues = {
    name: `${source.name} (Copy)`,
    modelNumber: source.modelNumber,
    description: source.description,
    category: source.category,
    imageUrl: source.imageUrl,
    featureTags: source.featureTags,
    status: source.status,
    subscriptionTiers: source.subscriptionTiers.map((t) => ({
      id: crypto.randomUUID?.() ?? `t-${Date.now()}`,
      contractYears: t.contractYears,
      monthlyPriceThb: t.monthlyPriceThb,
      serviceFrequency: t.serviceFrequency,
    })),
  }
  return createProduct(values)
}
