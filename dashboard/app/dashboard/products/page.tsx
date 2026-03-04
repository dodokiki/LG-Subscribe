"use client"

import { useState, useCallback } from "react"
import { Plus } from "lucide-react"
import type { Product } from "@/lib/types"
import type { ProductFormValues } from "@/lib/validations"
import { MOCK_PRODUCTS } from "@/lib/mock-products"
import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/products/product-table"
import { ProductFormDialog } from "@/components/products/product-form-dialog"

function formValuesToProduct(
  values: ProductFormValues,
  existingId?: string
): Product {
  const id = existingId ?? crypto.randomUUID?.() ?? `p-${Date.now()}`
  return {
    id,
    name: values.name,
    modelNumber: values.modelNumber,
    description: values.description,
    category: values.category as Product["category"],
    imageUrl: values.imageUrl,
    featureTags: values.featureTags,
    status: values.status,
    subscriptionTiers: values.subscriptionTiers.map((t) => ({
      id: t.id,
      contractYears: t.contractYears,
      monthlyPriceThb: t.monthlyPriceThb,
      serviceFrequency: t.serviceFrequency,
    })),
  }
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleAddNew = useCallback(() => {
    setEditingProduct(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }, [])

  const handleDuplicate = useCallback((product: Product) => {
    const duplicate: Product = {
      ...product,
      id: crypto.randomUUID?.() ?? `p-${Date.now()}`,
      name: `${product.name} (Copy)`,
      subscriptionTiers: product.subscriptionTiers.map((t) => ({
        ...t,
        id: crypto.randomUUID?.() ?? `t-${Date.now()}-${Math.random()}`,
      })),
    }
    setProducts((prev) => [...prev, duplicate])
  }, [])

  const handleDelete = useCallback((product: Product) => {
    if (typeof window !== "undefined" && !window.confirm(`Delete "${product.name}"?`)) return
    setProducts((prev) => prev.filter((p) => p.id !== product.id))
  }, [])

  const handleFormSubmit = useCallback(
    (values: ProductFormValues) => {
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? formValuesToProduct(values, p.id)
              : p
          )
        )
      } else {
        setProducts((prev) => [...prev, formValuesToProduct(values)])
      }
      setDialogOpen(false)
      setEditingProduct(null)
    },
    [editingProduct]
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Product Management
          </h1>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </header>

        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />

        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  )
}
