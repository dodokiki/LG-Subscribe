"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/app/actions/categories"
import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DashboardHomePage() {
  const [authChecking, setAuthChecking] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const refresh = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลด categories ไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.assign("/login?next=/dashboard")
        return
      }
      setAuthChecking(false)
      refresh()
    })
  }, [refresh])

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  )

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    try {
      await createCategory(newName)
      setNewName("")
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "เพิ่ม category ไม่สำเร็จ")
    }
  }, [newName, refresh])

  const handleSaveEdit = useCallback(async () => {
    if (!editId) return
    try {
      await updateCategory(editId, editName)
      setEditId(null)
      setEditName("")
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "แก้ไข category ไม่สำเร็จ")
    }
  }, [editId, editName, refresh])

  const handleDelete = useCallback(
    async (cat: Category) => {
      if (!window.confirm(`ลบ category "${cat.name}" ?`)) return
      try {
        await deleteCategory(cat.id)
        await refresh()
      } catch (e) {
        alert(e instanceof Error ? e.message : "ลบ category ไม่สำเร็จ")
      }
    },
    [refresh]
  )

  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.assign("/login")
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <Button type="button" variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.assign("/dashboard/products")}>
              ไปหน้า Product
            </Button>
          </div>
        </header>

        <section className="rounded-lg border p-4">
          <h2 className="mb-3 text-lg font-semibold">Category Management</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="เช่น Air Purifier"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่ม Category
            </Button>
          </div>
        </section>

        {authChecking ? (
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        ) : loading ? (
          <p className="text-muted-foreground">กำลังโหลด categories...</p>
        ) : error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
              โหลดใหม่
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      {editId === cat.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleSaveEdit()
                            }
                          }}
                        />
                      ) : (
                        cat.name
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editId === cat.id ? (
                        <div className="inline-flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditId(cat.id)
                              setEditName(cat.name)
                            }}
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cat)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      ยังไม่มี category
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
