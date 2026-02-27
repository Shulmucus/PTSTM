# PT Swadaya Teknik Mandiri — Website

Full-stack company website built with **Next.js 16.1.6**, **Tailwind CSS v4.2**, **Supabase**, and **TypeScript**.

## Tech Stack

| Technology | Version |
|---|---|
| Next.js | 16.1.6 (App Router) |
| Tailwind CSS | 4.x (CSS-first config) |
| React | 19.x |
| Supabase | Latest |
| TypeScript | 5.x |

## Local Setup

### Prerequisites
- Node.js 20+ and npm
- A Supabase project ([create one here](https://app.supabase.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these values in: **Supabase Dashboard → Settings → API**

### 3. Supabase Setup

1. Open the **SQL Editor** in your Supabase dashboard
2. Run `supabase/migration.sql` — creates tables, RLS policies, and storage bucket
3. Run `supabase/seed.sql` — inserts default content values

### 4. Create Storage Bucket

The migration creates an `assets` bucket automatically. If it doesn't:

1. Go to **Supabase Dashboard → Storage**
2. Create a new bucket named `assets`
3. Set it to **Public**

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Where to Find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key | Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service role key | Settings → API → service_role key |

## How to Add an Admin User

1. **Create a Supabase Auth user:**
   - Go to **Supabase Dashboard → Authentication → Users**
   - Click **Add User** → **Create New User**
   - Enter email and password

2. **Add the email to `admin_users` table:**
   ```sql
   INSERT INTO admin_users (email) VALUES ('admin@example.com');
   ```

3. **Login at** `/admin` with the credentials

## Project Structure

```
app/               → Next.js App Router pages
  layout.tsx       → Root layout (Navbar + Footer)
  page.tsx         → Home page
  gallery/         → Gallery page
  contact/         → Contact page (scroll to footer)
  admin/           → Admin login (secret page)
    dashboard/     → Admin dashboard (protected)
  sitemap.ts       → Auto-generated sitemap
components/        → Reusable UI components
  layout/          → Navbar, Footer
  home/            → HeroSection, InfoBoxes, HoverCards
  gallery/         → GalleryGrid
  admin/           → AdminLogin, AdminDashboard
lib/               → Supabase clients & auth helpers
hooks/             → React hooks (useAdmin)
types/             → TypeScript type definitions
supabase/          → SQL migration & seed files
public/            → Static assets (logo, robots.txt)
```

## Supabase Tables

| Table | Purpose |
|---|---|
| `site_content` | Key-value store for all editable content |
| `gallery_items` | Gallery images and titles (sorted A-Z) |
| `admin_users` | Emails authorized for admin access |

## RLS Policies

- **Public users**: `SELECT` on `site_content` and `gallery_items`
- **Authenticated admins**: Full `INSERT`, `UPDATE`, `DELETE` on all tables
- **Admin check**: Email must exist in `admin_users` table
