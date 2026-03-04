create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

insert into public.categories (name)
values
  ('Air Purifier'),
  ('Fridge'),
  ('Washing Machine'),
  ('TV'),
  ('Air Conditioner'),
  ('Other')
on conflict (name) do nothing;

alter table public.categories enable row level security;
