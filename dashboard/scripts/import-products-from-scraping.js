/**
 * Import scraped LG products into Supabase products table.
 *
 * Usage:
 *   node scripts/import-products-from-scraping.js
 *
 * Source file:
 *   ../Scapping/lg_subscribe_products_all_pages.json
 */
const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local")
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) return
      const idx = trimmed.indexOf("=")
      if (idx <= 0) return
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "")
      if (key) process.env[key] = value
    })
}

function toNumberTHB(text) {
  if (!text) return null
  const normalized = String(text).replace(/[^\d.]/g, "")
  if (!normalized) return null
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function mapCategory(item) {
  const source = `${item.category_url || ""} ${item.detail_url || ""}`.toLowerCase()

  if (
    source.includes("/air-purifiers/") ||
    source.includes("/air-puricare/")
  ) {
    return "Air Purifier"
  }
  if (
    source.includes("/refrigerators/") ||
    source.includes("/freezer/")
  ) {
    return "Fridge"
  }
  if (
    source.includes("/washers/") ||
    source.includes("/washer") ||
    source.includes("/dryers/")
  ) {
    return "Washing Machine"
  }
  if (
    source.includes("/tvs/") ||
    source.includes("/tv/") ||
    source.includes("/lifestyle-screens/")
  ) {
    return "TV"
  }
  if (
    source.includes("/air-conditioners/") ||
    source.includes("/air-conditioner")
  ) {
    return "Air Conditioner"
  }
  return "Other"
}

function buildDescription(item) {
  const chunks = []
  if (item.discount_text) chunks.push(`Tags: ${String(item.discount_text).replace(/\s+/g, " ").trim()}`)
  if (item.detail_url) chunks.push(`Source: ${item.detail_url}`)
  if (item.category_url) chunks.push(`Category page: ${item.category_url}`)
  return chunks.join(" | ")
}

async function ensureBaseCategories(supabase) {
  const names = [
    "Air Purifier",
    "Fridge",
    "Washing Machine",
    "TV",
    "Air Conditioner",
    "Other",
  ]
  const { error } = await supabase
    .from("categories")
    .upsert(names.map((name) => ({ name })), { onConflict: "name" })
  if (error) throw new Error(`Ensure categories failed: ${error.message}`)
}

async function main() {
  loadEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  }

  const inputPath = path.join(__dirname, "..", "..", "Scapping", "lg_subscribe_products_all_pages.json")
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`)
  }

  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"))
  const items = Array.isArray(raw) ? raw : []
  if (!items.length) {
    console.log("No data to import")
    return
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })

  await ensureBaseCategories(supabase)

  const { data: existingRows, error: existingError } = await supabase
    .from("products")
    .select("id, model_number")
  if (existingError) throw new Error(`Read products failed: ${existingError.message}`)

  const byModel = new Map()
  for (const row of existingRows || []) {
    if (row.model_number) byModel.set(String(row.model_number).trim().toUpperCase(), row.id)
  }

  let created = 0
  let updated = 0
  let tierUpserts = 0
  let skipped = 0

  for (const item of items) {
    const name = String(item.product_name || "").trim()
    const modelNumber = String(item.model_code || "").trim()
    const imageUrl = String(item.image_url || "").trim() || null
    const category = mapCategory(item)
    const monthlyPrice = toNumberTHB(item.monthly_price_text)

    if (!name || !modelNumber) {
      skipped += 1
      continue
    }

    const modelKey = modelNumber.toUpperCase()
    const payload = {
      name,
      model_number: modelNumber,
      description: buildDescription(item),
      category,
      image_url: imageUrl,
      feature_tags: [],
      status: "active",
    }

    let productId = byModel.get(modelKey)
    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId)
      if (error) throw new Error(`Update product ${modelNumber} failed: ${error.message}`)
      updated += 1
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single()
      if (error) throw new Error(`Insert product ${modelNumber} failed: ${error.message}`)
      productId = data.id
      byModel.set(modelKey, productId)
      created += 1
    }

    if (productId && monthlyPrice !== null) {
      // Keep one default tier from scrape monthly price.
      await supabase.from("subscription_tiers").delete().eq("product_id", productId)
      const { error: tierError } = await supabase.from("subscription_tiers").insert({
        product_id: productId,
        contract_years: 3,
        monthly_price_thb: monthlyPrice,
        service_frequency: "Every 6 months",
      })
      if (tierError) throw new Error(`Insert tier ${modelNumber} failed: ${tierError.message}`)
      tierUpserts += 1
    }
  }

  console.log("Import complete")
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Tier upserts: ${tierUpserts}`)
  console.log(`Skipped: ${skipped}`)
}

main().catch((err) => {
  console.error("Import failed:", err.message)
  process.exit(1)
})
