# P BUILDS: Portfolio

Dark, minimal portfolio for an independent Mobile App & AI developer. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion and Supabase.

## 1. Install and run

```bash
npm install
cp .env.local.example .env.local   # then fill in your values
npm run dev
```

## 2. Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon public key |
| `NEXT_PUBLIC_EMAIL` | no | Defaults to `you@example.com` |
| `NEXT_PUBLIC_GITHUB_URL` | no | Defaults to `https://github.com` |

## 3. Set up Supabase

1. Create a Supabase project.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql` and run it. It is safe to re-run. It creates the `projects` table, row level security, the public `project-images` and `app-releases` buckets with their policies, and seeds two sample projects when the table is empty.
3. Go to **Authentication > Users > Add user** and create your admin email and password (tick auto-confirm).
4. Go to **Authentication > Sign In / Providers** (or **Settings**) and **DISABLE "Allow new users to sign up"**. This is important: any authenticated user can edit projects.
5. Large APK uploads are limited by your Supabase plan's file size limit (Storage settings).

## 4. Admin

There is no public link to the admin area. Open `/admin` directly, sign in, and you land on `/admin/dashboard`, where you can add, edit, feature and delete projects and upload thumbnails and APK/ZIP files.

## 5. Deploy on Vercel

1. Push this project to a Git repository (files at the repository root).
2. In Vercel, **Add New > Project** and import the repository.
3. Leave **Root Directory EMPTY**. Framework Preset: **Next.js**.
4. Add the environment variables above under **Settings > Environment Variables**.
5. Deploy.
6. In Supabase, **Authentication > URL Configuration**, set **Site URL** to your live domain (for example `https://yourdomain.com`).

## The 3D character

The character is a real-time 3D model (three.js via React Three Fiber), not a flat image, so it stays sharp on any screen. It is built in code from rounded voxel blocks:

- `lib/characterSpec.ts`: the model (body, clothes, backpack, watch, shoes, face, and the procedural hair made of many tilted slabs). Change colors, sizes or hair here.
- `components/Character3D.tsx`: lights, materials, shadows and animation (bob, breathing, head and arm motion, wave hello every 7-12 seconds, blinking, pupils that follow the mouse or finger).
- `components/VoxelCharacter.tsx`: loads the 3D scene lazily, pauses it when off screen, respects reduced motion, and shows `public/voxel/voxel-poster.webp` if WebGL is not available.

## File map

See the project tree: `app/` (pages and routes), `components/` (UI), `lib/` (Supabase clients, types, helpers), `public/` (logo and fallback poster), `supabase/schema.sql` (database).
