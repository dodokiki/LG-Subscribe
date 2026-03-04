"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/dashboard/products"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (err) {
        setLoading(false)
        setError(
          err.message === "Invalid login credentials"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : err.message
        )
        return
      }
      setRedirecting(true)
      window.location.assign(next)
    } catch (e) {
      setLoading(false)
      setError(
        e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ"
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-8 rounded-lg border bg-background p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Backoffice Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            LG Subscribe – เข้าสู่ระบบเพื่อจัดการสินค้า
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading || redirecting}>
            {redirecting ? "กำลังพาไป..." : loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">กำลังโหลด...</div>}>
      <LoginForm />
    </Suspense>
  )
}
