"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Layers, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menu = [
    { href: "/dashboard", label: "จัดการ Category", icon: Layers },
    { href: "/dashboard/products", label: "จัดการ Product", icon: Package },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-64 border-r bg-muted/20 p-4 md:block">
          <p className="mb-4 px-2 text-sm font-semibold text-muted-foreground">
            Backoffice
          </p>
          <nav className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          {menu.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-center text-sm",
                  active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
