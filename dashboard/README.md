# LG Subscribe – Backoffice (Product Management)

Next.js Backoffice สำหรับ Admin: Login แยกจากหน้าสาธารณะ, จัดการสินค้าและ Subscription Tiers ผ่าน Supabase

## Stack

- **Next.js 14** (App Router)
- **Supabase** – Auth (Login) + Database (Products, Subscription Tiers)
- **Tailwind CSS** + **Shadcn-style UI**
- **React Hook Form** + **Zod**
- **Lucide React**

## 1. ตั้งค่า Supabase

### 1.1 สร้างโปรเจกต์และตาราง

1. เข้า [Supabase Dashboard](https://supabase.com/dashboard) สร้างโปรเจกต์ (หรือใช้ของเดิม)
2. ไป **SQL Editor** → New query → วางเนื้อหาจากไฟล์  
   `supabase/migrations/20250304000000_create_products.sql`  
   แล้วกด **Run** เพื่อสร้างตาราง `products` และ `subscription_tiers`

### 1.2 ค่า Environment

1. ในโปรเจกต์ Supabase ไป **Project Settings** → **API**
2. คัดลอก:
   - **Project URL** → ใช้เป็น `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → ใช้เป็น `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Publishable)
   - **service_role** key → ใช้เป็น `SUPABASE_SERVICE_ROLE_KEY` (Secret)
3. ในโฟลเดอร์ `dashboard` สร้างไฟล์ `.env.local` (มีใน .gitignore แล้ว) แล้วใส่:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

หรือคัดลอกจาก `.env.example` แล้วแทนค่าจริง

### 1.3 สร้างบัญชี Admin (Login)

1. ใน Supabase ไป **Authentication** → **Users** → **Add user**
2. เลือก **Create new user** ใส่อีเมลและรหัสผ่าน (ใช้ login หน้า Backoffice)
3. หรือเปิด **Authentication** → **Providers** → **Email** เปิด "Confirm email" ตามต้องการ แล้วใช้ **Sign up** ในแอป (ถ้ามีหน้า sign up)

ตอนนี้ใช้เฉพาะ **Login** (ไม่มีหน้า Sign up ในโค้ด) ดังนั้นให้สร้าง user ผ่าน Dashboard อย่างน้อย 1 คน

## 2. รันโปรเจกต์

```bash
cd dashboard
npm install
npm run dev
```

- เปิด [http://localhost:3000](http://localhost:3000) จะถูก redirect ไป `/dashboard/products`
- ถ้ายังไม่ login จะถูกส่งไป **/login** ก่อน
- หลัง login แล้วจะเข้า **Product Management** (ตารางสินค้า, เพิ่ม/แก้ไข/ลบ/ซ้ำ)

## 3. โครงสร้างหลัก

| ส่วน | คำอธิบาย |
|------|----------|
| **/login** | หน้า Login (อีเมล + รหัสผ่าน), หลัง login ไป `/dashboard/products` |
| **/dashboard/products** | หน้า Backoffice – Product Management (CRUD กับ Supabase) |
| **Middleware** | ตรวจ session: เข้า `/dashboard/*` ต้อง login ไม่่งั้นส่งไป `/login` |
| **Server Actions** | `app/actions/products.ts` – get/create/update/delete/duplicate ผ่าน `service_role` |
| **Server Actions** | `app/actions/auth.ts` – signOut |

- ตารางใน Supabase: `products`, `subscription_tiers` (RLS เปิด; เฉพาะ `service_role` ที่ใช้ใน Server Action เข้าถึงได้)
- ไม่ใส่ Secret key ใน client; ใช้เฉพาะใน Server

## 4. Vercel

- ตั้ง **Root Directory** = `dashboard`
- ใน Vercel Project → **Settings** → **Environment Variables** ใส่  
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`  
  (ค่าเดียวกับใน `.env.local`)
