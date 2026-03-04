export type ProductStatus = "active" | "draft"

export type ProductCategory = string

export interface Category {
  id: string
  name: string
  createdAt?: string
}

export interface SubscriptionTier {
  id: string
  contractYears: number
  monthlyPriceThb: number
  serviceFrequency: string
}

export interface Product {
  id: string
  name: string
  modelNumber: string
  description: string
  category: ProductCategory
  imageUrl: string | null
  featureTags: string[]
  status: ProductStatus
  subscriptionTiers: SubscriptionTier[]
}

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  "Air Purifier",
  "Fridge",
  "Washing Machine",
  "TV",
  "Air Conditioner",
  "Other",
] as const

export const SERVICE_FREQUENCY_OPTIONS = [
  "Every 3 months",
  "Every 6 months",
  "Every 1 year",
  "Every 2 years",
]

export const CONTRACT_YEAR_OPTIONS = [3, 5, 7]

export const FEATURE_TAG_OPTIONS = [
  "AI Inverter",
  "NanoCell",
  "ThinQ",
  "Smart Diagnosis",
  "Steam",
  "Dual Inverter",
  "OLED",
]
