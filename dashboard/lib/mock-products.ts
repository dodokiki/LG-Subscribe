import type { Product } from "./types"

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "LG PuriCare Air Purifier",
    modelNumber: "AS95GDSA0",
    description: "Dual protection with 360° air circulation. HEPA 13 filter and UVnano technology.",
    category: "Air Purifier",
    imageUrl: "/placeholder-air.jpg",
    featureTags: ["ThinQ", "Smart Diagnosis"],
    status: "active",
    subscriptionTiers: [
      { id: "t1", contractYears: 3, monthlyPriceThb: 890, serviceFrequency: "Every 6 months" },
      { id: "t2", contractYears: 5, monthlyPriceThb: 790, serviceFrequency: "Every 1 year" },
    ],
  },
  {
    id: "2",
    name: "LG InstaView Door-in-Door Fridge",
    modelNumber: "GS-X5710PS",
    description: "InstaView™ design, Linear Compressor, SmartThinQ connectivity.",
    category: "Fridge",
    imageUrl: "/placeholder-fridge.jpg",
    featureTags: ["ThinQ", "Smart Diagnosis", "Dual Inverter"],
    status: "active",
    subscriptionTiers: [
      { id: "t1", contractYears: 5, monthlyPriceThb: 1990, serviceFrequency: "Every 1 year" },
      { id: "t2", contractYears: 7, monthlyPriceThb: 1790, serviceFrequency: "Every 2 years" },
    ],
  },
  {
    id: "3",
    name: "LG WashTower Combo",
    modelNumber: "WM4000HWA",
    description: "All-in-one washer and dryer. AI Direct Drive, Steam™ technology.",
    category: "Washing Machine",
    imageUrl: "/placeholder-wash.jpg",
    featureTags: ["AI Inverter", "Steam", "ThinQ"],
    status: "active",
    subscriptionTiers: [
      { id: "t1", contractYears: 3, monthlyPriceThb: 1490, serviceFrequency: "Every 6 months" },
      { id: "t2", contractYears: 5, monthlyPriceThb: 1290, serviceFrequency: "Every 1 year" },
    ],
  },
  {
    id: "4",
    name: "LG OLED65C3",
    modelNumber: "OLED65C3PSA",
    description: "4K OLED evo with α9 Gen6 processor. Dolby Vision IQ, NVIDIA G-SYNC.",
    category: "TV",
    imageUrl: "/placeholder-tv.jpg",
    featureTags: ["OLED", "NanoCell", "ThinQ"],
    status: "active",
    subscriptionTiers: [
      { id: "t1", contractYears: 3, monthlyPriceThb: 2490, serviceFrequency: "Every 1 year" },
      { id: "t2", contractYears: 5, monthlyPriceThb: 2190, serviceFrequency: "Every 2 years" },
    ],
  },
  {
    id: "5",
    name: "LG Dual Inverter AC",
    modelNumber: "AS-Q12BGP0",
    description: "Dual Inverter Compressor, Low noise, Energy saving.",
    category: "Air Conditioner",
    imageUrl: "/placeholder-ac.jpg",
    featureTags: ["Dual Inverter", "ThinQ"],
    status: "draft",
    subscriptionTiers: [
      { id: "t1", contractYears: 3, monthlyPriceThb: 990, serviceFrequency: "Every 6 months" },
    ],
  },
]
