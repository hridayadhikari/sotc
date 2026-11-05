# Streets of Tripura Certificate Verification System

Production-ready certificate issuance, verification, QR code generation, and PDF credential export system designed for **Streets of Tripura**. Deployable on **Vercel's free tier** with a **Supabase PostgreSQL & Auth** backend on custom subdomains such as `verify.streetsoftripura.org`.

---

## Features

- **Public Certificate Verification (`/verify/[certificateId]`)**:
  - Dynamically retrieves certificate credentials by reference ID.
  - Clear real-time status indication (`Authentic & Valid` or `Revoked Certificate`).
  - Privacy-preserving: Shows only public verification text data (Intern Name, Role, Tenure, Issue Date, Issuing Org). Sensitive personal data (DOB, phone, email, home address) is strictly prohibited and never exposed.
  - High-resolution QR display with download option.
- **Admin Authentication & Dashboard (`/admin`, `/login`)**:
  - Protected routes via Supabase Auth session checks and server-side authorization guards.
  - Public registration is strictly disabled.
  - Dashboard KPIs: Total certificates issued, Valid count, Revoked count.
  - Search & filter: Real-time search across Certificate ID, Intern Name, and Role.
  - Issue new certificates conforming to `CN/SOT/INT/MMYYYY/NNN`.
  - Edit existing certificate metadata.
  - Instant Revoke & Restore certificate capabilities.
  - Audit Trail log tracking admin user, timestamp, certificate ID, and action history.
- **QR Code Generation**:
  - Dynamic QR codes generated using `qrcode` pointing directly to `https://verify.streetsoftripura.org/verify/<CERT_ID>`.
  - Dedicated API endpoint:
    - `/api/certificates/[certificateId]/qr` &rarr; Generates and downloads PNG QR.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth with Row Level Security (RLS)
- **Validation**: Zod
- **QR & PDF**: `qrcode`, `jspdf`, `lucide-react`
- **Deployment**: Vercel Free Tier

---

## Initial Seeded Certificate Record

The application includes the initial certificate record:

- **Certificate ID**: `CN/SOT/INT/072026/011`
- **Intern Name**: `Shivam Mishra`
- **Role**: `Graphic Designer`
- **Internship Start Date**: `2026-07-21`
- **Internship End Date**: `2026-10-21`
- **Issuing Organization**: `Streets of Tripura`
- **Issue Date**: `2026-10-21`
- **Status**: `valid`

Test URL:
`http://localhost:3000/verify/CN%2FSOT%2FINT%2F072026%2F011`

---

## Supabase Database Setup

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/migrations/20261106_init_certificates.sql` from this repository.
4. Copy and execute the SQL migration. It creates:
   - `public.certificates` table with constraints & indexes.
   - `public.audit_logs` table for tracking admin actions.
   - `public.public_certificates` view for whitelisted verification data.
   - Row Level Security (RLS) policies allowing public read of verification info, and authenticated admin write/update.
   - Updated-at trigger and the initial seed record for **Shivam Mishra**.
5. Create your admin user in Supabase:
   - In Supabase Dashboard, navigate to **Authentication** &rarr; **Users** &rarr; **Add User** &rarr; **Create User**.
   - Enter your admin email and password (e.g. `admin@streetsoftripura.org`).
   - Under **Authentication** &rarr; **Providers** &rarr; **Email**, ensure "Enable Signups" is disabled so public self-registration cannot occur.

---

## Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the credentials from your Supabase Project Settings (**Project Settings** &rarr; **API**):

```env
# Public URL configuration
NEXT_PUBLIC_SITE_URL=https://verify.streetsoftripura.org

# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# Supabase Admin Secret Key (Server-only, never leak into client code)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Run production build and type checking
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Vercel Deployment & Custom Subdomain Guide

### 1. Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SITE_URL` = `https://verify.streetsoftripura.org`
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
5. Click **Deploy**.

### 2. Connecting Custom Subdomain (`verify.streetsoftripura.org`)

1. In the Vercel project dashboard, go to **Settings** &rarr; **Domains**.
2. Enter `verify.streetsoftripura.org` and click **Add**.
3. In your DNS provider for `streetsoftripura.org` (e.g. Cloudflare, Namecheap, GoDaddy):
   - Add a `CNAME` record:
     - **Type**: `CNAME`
     - **Name / Host**: `verify`
     - **Target / Value**: `cname.vercel-dns.com`
     - **TTL**: Auto or 3600
4. Vercel will automatically provision a free SSL/TLS certificate once DNS propagates.

---

## Security Highlights

- **Row Level Security (RLS)**: Public anon users can only query certificates; only authenticated admins can create, edit, or revoke.
- **Service Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is loaded strictly in server-side modules (`src/lib/supabase/admin.ts` / server actions) and never exposed to client bundles.
- **Input Validation**: Strict Zod schemas check reference ID regex (`CN/SOT/INT/MMYYYY/NNN`), date formats, string lengths, and status enumerations.
- **URL Encoding Support**: URLs like `/verify/CN%2FSOT%2FINT%2F072026%2F011` decode seamlessly on all platforms.
