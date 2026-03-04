import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get("next") ?? "/dashboard/products"
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  } catch {
    // อ่าน session ไม่ได้ ส่งกลับไป login
  }
  return NextResponse.redirect(new URL("/login?next=" + encodeURIComponent(next), request.url))
}
