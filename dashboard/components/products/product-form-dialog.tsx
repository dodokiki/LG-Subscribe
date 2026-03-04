"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Upload } from "lucide-react"
import type { Product } from "@/lib/types"
import {
  productFormSchema,
  type ProductFormValues,
  defaultSubscriptionTier,
  defaultProductFormValues,
} from "@/lib/validations"
import {
  SERVICE_FREQUENCY_OPTIONS,
  CONTRACT_YEAR_OPTIONS,
  FEATURE_TAG_OPTIONS,
} from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: string[]
  onSubmit: (values: ProductFormValues) => void
}

function productToFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    modelNumber: p.modelNumber,
    description: p.description,
    category: p.category,
    imageUrl: p.imageUrl,
    featureTags: p.featureTags,
    status: p.status,
    subscriptionTiers: p.subscriptionTiers.map((t) => ({
      id: t.id,
      contractYears: t.contractYears,
      monthlyPriceThb: t.monthlyPriceThb,
      serviceFrequency: t.serviceFrequency,
    })),
  }
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
}: ProductFormDialogProps) {
  const isEdit = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues,
  })

  useEffect(() => {
    if (open) {
      if (product) {
        form.reset(productToFormValues(product))
      } else {
        form.reset({
          ...defaultProductFormValues,
          category: categories[0] ?? "",
        })
      }
    }
  }, [open, product, form, categories])

  const tiers = form.watch("subscriptionTiers")
  const selectedTags = form.watch("featureTags")

  const addTier = () => {
    form.setValue("subscriptionTiers", [
      ...tiers,
      defaultSubscriptionTier(),
    ])
  }

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return
    form.setValue(
      "subscriptionTiers",
      tiers.filter((_, i) => i !== index)
    )
  }

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    form.setValue("featureTags", next)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-6 py-2"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g. LG PuriCare Air Purifier"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="modelNumber">Model Number</Label>
            <Input
              id="modelNumber"
              {...form.register("modelNumber")}
              placeholder="e.g. AS95GDSA0"
            />
            {form.formState.errors.modelNumber && (
              <p className="text-sm text-destructive">
                {form.formState.errors.modelNumber.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(v) => form.setValue("category", v as Product["category"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Image</Label>
            <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed bg-muted/50">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-xs">Image upload placeholder</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Feature Tags</Label>
            <div className="flex flex-wrap gap-2">
              {FEATURE_TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    selectedTags.includes(tag)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Subscription Tiers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTier}>
                <Plus className="mr-1 h-4 w-4" />
                Add tier
              </Button>
            </div>
            {form.formState.errors.subscriptionTiers && (
              <p className="text-sm text-destructive">
                {form.formState.errors.subscriptionTiers.message}
              </p>
            )}
            <div className="space-y-4 rounded-lg border p-4">
              {tiers.map((_, index) => (
                <div
                  key={tiers[index].id}
                  className="grid gap-3 rounded border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div className="grid gap-1">
                    <Label className="text-xs">Contract (years)</Label>
                    <Select
                      value={String(tiers[index].contractYears)}
                      onValueChange={(v) =>
                        form.setValue(
                          `subscriptionTiers.${index}.contractYears`,
                          Number(v)
                        )
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRACT_YEAR_OPTIONS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y} years
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Monthly Price (฿)</Label>
                    <Input
                      type="number"
                      min={0}
                      {...form.register(
                        `subscriptionTiers.${index}.monthlyPriceThb`,
                        {
                          setValueAs: (v) =>
                            v === "" || Number.isNaN(Number(v)) ? 0 : Number(v),
                        }
                      )}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Service Frequency</Label>
                    <Select
                      value={tiers[index].serviceFrequency}
                      onValueChange={(v) =>
                        form.setValue(
                          `subscriptionTiers.${index}.serviceFrequency`,
                          v
                        )
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_FREQUENCY_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => removeTier(index)}
                      disabled={tiers.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) =>
                form.setValue("status", v as "active" | "draft")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
