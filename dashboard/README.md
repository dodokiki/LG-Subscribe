# LG Subscribe – Product Management Dashboard

Next.js dashboard for managing LG Subscribe products, subscription tiers, and metadata.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + **Shadcn-style UI** (Radix primitives)
- **React Hook Form** + **Zod** for forms and validation
- **Lucide React** for icons

## Run locally

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000); the app redirects to `/dashboard/products`.

## Features

- **Header**: “Product Management” title and “Add New Product” button that opens a dialog.
- **Data table**: Image, Product Name, Category, Status (Active/Draft), with search and row actions (Edit, Duplicate, Delete).
- **Add/Edit dialog**: Name, Model Number, Description, Category dropdown, image upload placeholder, Feature Tags (e.g. AI Inverter, NanoCell), and **Subscription Tiers** (Contract Period in years, Monthly Price ฿, Service Frequency). Multiple tiers per product with add/remove.
- **Mock data**: `lib/mock-products.ts`; replace with API when ready.

## Project layout

- `app/dashboard/products/page.tsx` – main Product Management page
- `app/page.tsx` – redirects to `/dashboard/products`
- `components/products/product-table.tsx` – table with search and actions
- `components/products/product-form-dialog.tsx` – add/edit form with tiers
- `components/ui/*` – Button, Dialog, Input, Table, Select, Dropdown, Badge, etc.
- `lib/types.ts` – Product, SubscriptionTier, categories, options
- `lib/mock-products.ts` – sample products
- `lib/validations.ts` – Zod schema and default form values
