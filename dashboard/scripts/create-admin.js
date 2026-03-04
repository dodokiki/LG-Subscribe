/**
 * สร้าง Admin user ใน Supabase (รันครั้งเดียว)
 * ใช้: node scripts/create-admin.js [email] [password]
 * อ่าน env จาก .env.local
 */
const fs = require("fs")
const path = require("path")

// โหลด .env.local
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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRoleKey) {
  console.error("ไม่พบ NEXT_PUBLIC_SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY ใน .env.local")
  process.exit(1)
}

const email = process.argv[2] || "dobusaba@gmail.com"
const password = process.argv[3] || "dodo1234"

async function main() {
  const { createClient } = require("@supabase/supabase-js")
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    console.error("สร้าง user ไม่สำเร็จ:", error.message)
    process.exit(1)
  }
  console.log("สร้าง user สำเร็จ:", data.user.email)
}

main()
