"use server"

import { createServiceRoleClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

type CategoryRow = {
  id: string
  name: string
  created_at?: string
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .order("name", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: CategoryRow) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }))
}

export async function createCategory(name: string): Promise<Category> {
  const supabase = createServiceRoleClient()
  const normalized = name.trim()
  if (!normalized) throw new Error("Category name is required")

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: normalized })
    .select("id, name, created_at")
    .single()
  if (error) throw new Error(error.message)
  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
  }
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const normalized = name.trim()
  if (!normalized) throw new Error("Category name is required")

  const { error } = await supabase
    .from("categories")
    .update({ name: normalized })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createServiceRoleClient()

  const { data: usageRows, error: usageError } = await supabase
    .from("products")
    .select("id, category")
  if (usageError) throw new Error(usageError.message)

  const { data: target, error: targetError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single()
  if (targetError) throw new Error(targetError.message)

  const used = (usageRows ?? []).some((p) => p.category === target.name)
  if (used) {
    throw new Error("Category is being used by products")
  }

  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
