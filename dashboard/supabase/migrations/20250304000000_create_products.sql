-- Products table for LG Subscribe Backoffice
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  model_number text not null,
  description text default '',
  category text not null check (category in (
    'Air Purifier', 'Fridge', 'Washing Machine', 'TV', 'Air Conditioner', 'Other'
  )),
  image_url text,
  feature_tags text[] default '{}',
  status text not null default 'draft' check (status in ('active', 'draft')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscription tiers (one product has many tiers)
create table if not exists public.subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  contract_years int not null check (contract_years > 0),
  monthly_price_thb numeric(12,2) not null check (monthly_price_thb >= 0),
  service_frequency text not null,
  created_at timestamptz default now()
);

create index if not exists idx_subscription_tiers_product_id on public.subscription_tiers(product_id);

-- RLS: เปิดใช้ – เฉพาะ service_role (ใช้ใน Server Action) จะ bypass RLS ได้
-- ไม่สร้าง policy สำหรับ anon/authenticated = ห้าม client อ่าน/เขียนโดยตรง
alter table public.products enable row level security;
alter table public.subscription_tiers enable row level security;

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ถ้าต้องการใช้ category จากตาราง categories แบบ dynamic:
-- alter table public.products drop constraint if exists products_category_check;
