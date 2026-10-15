# Delcom Courses (SvelteKit + TypeScript)

Studi Kasus 2 PABWE 2026 P6.

## Tahap 1 - Konfigurasi

1. Ganti `"name"` di `package.json` dengan `{username}-pabwe2026-sk-p6-sveltekit`.
2. `bun install`
3. `bun run dev` lalu buka http://localhost:3000 (harus tampil tulisan "Delcom Courses").

Catatan: `vite.config.ts` memakai `defineConfig` dari `vitest/config` agar properti `test` lolos pengecekan tipe.

## Tahap 3 - Auth (+ API/store users yang dibutuhkan auth)

Jalankan: `bun x vitest run src/features/auth src/features/users src/helpers src/hooks`

## Tahap 4 - Users, Profile, 404

Jalankan: `bun x vitest run src/features/users src/features/common`
Buka /users, /profile, dan path acak (mis. /abc) untuk melihat halaman 404.

## Tahap 5 - API & Store Courses

Port aplikasi: 3000 (`APP_PORT` di `.env`; dipakai juga oleh adapter-bun saat `bun start`).
Jalankan: `bun x vitest run src/features/courses`
Tahap ini belum menambah tampilan; daftar kursus muncul di Tahap 6.

## Tahap 6 - Kerangka tampilan (Navbar, Sidebar, CourseLayout)

Jalankan: `bun x vitest run src/features/courses src/App.test.ts`
Setelah login, semua halaman (kecuali /auth) dibungkus CourseLayout: navbar ber-logo topi wisuda, sidebar "Semua Kursus / Semua Pengguna / Profil Saya".
Halaman `/` masih placeholder; daftar kursus muncul di Tahap 7.
