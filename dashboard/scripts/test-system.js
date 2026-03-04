/**
 * ทดสอบระบบ: Login + ดึงข้อมูล products จาก Supabase
 * รัน: node scripts/test-system.js
 */
const fs = require("fs")
const path = require("path")

const envPath = path.join(__dirname, "..", ".env.local")
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const idx = line.indexOf("=")
      if (idx <= 0 || line.startsWith("#")) return
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "")
      if (key) process.env[key] = value
    })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function main() {
  const { createClient } = require("@supabase/supabase-js")
  const results = { auth: null, products: null }

  // 1) ทดสอบ Login
  console.log("1) ทดสอบ Login (dobusaba@gmail.com)...")
  if (!url || !anonKey) {
    console.error("   ไม่พบ NEXT_PUBLIC_SUPABASE_URL หรือ ANON_KEY")
    results.auth = "missing_env"
  } else {
    const authClient = createClient(url, anonKey)
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: "dobusaba@gmail.com",
      password: "dodo1234",
    })
    if (authError) {
      console.error("   ล้มเหลว:", authError.message)
      results.auth = authError.message
    } else {
      console.log("   สำเร็จ – ได้ session")
      results.auth = "ok"
    }
  }

  // 2) ทดสอบดึง products (service role)
  console.log("2) ทดสอบดึง products จาก Supabase...")
  if (!url || !serviceKey) {
    console.error("   ไม่พบ SUPABASE_SERVICE_ROLE_KEY")
    results.products = "missing_env"
  } else {
    const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: rows, error: tableError } = await adminClient
      .from("products")
      .select("id, name, status")
      .limit(5)
    if (tableError) {
      if (tableError.code === "42P01" || tableError.message.includes("does not exist")) {
        console.error("   ตาราง 'products' ยังไม่มี – กรณารัน SQL ใน Supabase SQL Editor:")
        console.error("   ไฟล์: supabase/migrations/20250304000000_create_products.sql")
        results.products = "table_missing"
      } else {
        console.error("   ล้มเหลว:", tableError.message)
        results.products = tableError.message
      }
    } else {
      console.log("   สำเร็จ – จำนวนรายการ:", (rows || []).length)
      results.products = "ok"
    }
  }

  console.log("\nสรุป:", results)
  const ok = results.auth === "ok" && (results.products === "ok" || results.products === "table_missing")
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
