import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Missing Supabase environment variables" },
      { status: 500 }
    )
  }

  let response = NextResponse.json({ ok: true })
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const payload = (await request.json()) as {
    email?: string
    password?: string
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email ?? "",
    password: payload.password ?? "",
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // Ensure auth cookies are persisted on server response.
  if (data.session) {
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
  }

  return response
}
