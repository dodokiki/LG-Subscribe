"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus, LogOut } from "lucide-react"
import type { Product } from "@/lib/types"
import type { ProductFormValues } from "@/lib/validations"
import { getProducts, createProduct, updateProduct, deleteProduct, duplicateProduct } from "@/app/actions/products"
import { getCategories } from "@/app/actions/categories"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/products/product-table"
import { ProductFormDialog } from "@/components/products/product-form-dialog"

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const refresh = useCallback(() => {
    setLoadError(null)
    return Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        setProducts(productData)
        setCategories(categoryData.map((c) => c.name))
        setLoading(false)
      })
      .catch((e) => {
        setLoading(false)
        setLoadError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ")
      })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.assign("/login?next=/dashboard/products")
        return
      }
      setAuthChecking(false)
      refresh()
    })
  }, [refresh])

  const handleAddNew = useCallback(() => {
    setEditingProduct(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }, [])

  const handleDuplicate = useCallback(
    async (product: Product) => {
      try {
        await duplicateProduct(product.id)
        await refresh()
      } catch (e) {
        alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    },
    [refresh]
  )

  const handleDelete = useCallback(
    async (product: Product) => {
      if (!window.confirm(`ลบ "${product.name}"?`)) return
      try {
        await deleteProduct(product.id)
        await refresh()
      } catch (e) {
        alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    },
    [refresh]
  )

  const handleFormSubmit = useCallback(
    async (values: ProductFormValues) => {
      try {
        if (editingProduct) {
          await updateProduct(editingProduct.id, values)
        } else {
          await createProduct(values)
        }
        setDialogOpen(false)
        setEditingProduct(null)
        await refresh()
      } catch (e) {
        alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    },
    [editingProduct, refresh]
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
            <h1 className="text-2xl font-semibold tracking-tight">
              Product Management
            </h1>
            <Button type="button" variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => window.location.assign("/dashboard")}>
              จัดการ Category
            </Button>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </header>

        {authChecking ? (
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        ) : loading ? (
          <p className="text-muted-foreground">กำลังโหลด...</p>
        ) : loadError ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">{loadError}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => { setLoading(true); refresh() }}>
              โหลดใหม่
            </Button>
          </div>
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}

        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  )
}
