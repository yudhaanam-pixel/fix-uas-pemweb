# 🏥 SIM-Klinik Sehat Utama (Sistem Informasi Manajemen Klinik Kesehatan)

Aplikasi web **Sistem Informasi Manajemen Klinik Kesehatan** modern, responsif, dan *production-ready* yang dibangun menggunakan arsitektur modern Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL via Supabase, dan penyimpanan objek Cloudflare R2.

---

## 🌟 Fitur Utama & Arsitektur

### 1. 👥 Multi-Role Role-Based Access Control (RBAC)
Aplikasi membedakan hak akses dan ruang kerja menjadi 4 peran utama:
- **Pasien:** 
  - Registrasi & masuk akun pasien.
  - Pendaftaran kunjungan poliklinik secara online dengan validasi kuota otomatis.
  - Memperoleh E-Tiket nomor antrean unik poliklinik (misal: `UMU-001`, `GIG-002`).
  - Pemantauan status antrean aktif (Menunggu, Tiba/Check-in, Diperiksa, Selesai).
  - Riwayat lengkap rekam medis: diagnosa dokter, tanda-tanda vital, e-resep, dan dokumen hasil lab.
  - Pengelolaan data kependudukan (NIK, BPJS, golongan darah, riwayat alergi obat).
- **Petugas (Front Office / Resepsionis):**
  - Pemantauan antrean hari ini lintas poliklinik dan dokter.
  - Verifikasi kedatangan pasien (*Check-in*) saat tiba di lobby klinik.
  - Pendaftaran pasien *Walk-in* langsung di loket dengan cetak struk antrean otomatis.
  - Pembatalan antrean bila pasien berhalangan hadir.
- **Dokter Spesialis:**
  - Ruang periksa digital: daftar antrean pasien spesifik dokter yang bertugas hari ini.
  - Tombol panggil pasien (*Audio voice chime announcement*).
  - Pengisian Rekam Medis Elektronik (RME) terstruktur standar **SOAP**:
    - **Tanda-tanda Vital:** Tekanan Darah (Sistolik/Diastolik), Detak Jantung, Laju Nafas, Suhu Tubuh, Berat Badan, Tinggi Badan, dan Indeks Massa Tubuh (BMI otomatis).
    - **S (Subjective):** Anamnesis dan keluhan pasien.
    - **O (Objective):** Hasil pemeriksaan fisik dan penunjang.
    - **A (Assessment):** Diagnosa klinis dan kode ICD-10.
    - **P (Plan):** Rencana terapi, tindakan medis, dan anjuran istirahat.
    - **E-Prescription:** Resep obat digital dan aturan pakai.
    - **Unggah Lampiran Medis:** Hasil laboratorium, USG, atau foto rontgen tersimpan aman di **Cloudflare R2**.
  - Penyelesaian pemeriksaan otomatis mengubah status kunjungan menjadi selesai dan menyinkronkannya ke akun pasien.
- **Admin:**
  - Dashboard analitik & KPI operasional (total kunjungan, status antrean, sebaran poliklinik).
  - **Master Poliklinik:** Tambah, edit, atur kode prefix antrean, dan aktif/nonaktifkan poli.
  - **Master Dokter:** Kelola profil dokter spesialis, Surat Izin Praktik (SIP), nomor ruang, dan tarif jasa.
  - **Master Jadwal & Kuota:** Atur hari praktik, jam operasional, dan batasan kuota harian.
  - **Manajemen Pengguna & RBAC:** Penugasan hak akses pengguna (Admin, Petugas, Dokter, Pasien).
  - **Rekapitulasi & Laporan:** Filter kunjungan berdasarkan rentang tanggal/poli/dokter dan ekspor data ke format **CSV** atau cetak.

### 2. 📺 Layar Antrean Publik (TV Lobby / Waiting Room Monitor)
- Tampilan layar penuh (*fullscreen*) ramah Smart TV untuk ruang tunggu klinik di rute `/antrean`.
- Menampilkan nomor antrean yang sedang diperiksa per ruang dokter dan antrean berikutnya secara *real-time*.
- Jam dan tanggal otomatis WIB.
- Fitur uji bunyi panggilan suara (*Voice synthesizer chime*).
- *Running announcement ticker* di bagian bawah layar.

### 3. ☁️ Integrasi Cloudflare R2 Object Storage
- Berkas lampiran medis (PDF hasil lab, gambar USG/rontgen, foto profil) disimpan di Cloudflare R2 (kompatibel S3 API dengan biaya egress gratis).
- Didukung utilitas endpoint API `/api/upload` yang memvalidasi tipe berkas dan batas ukuran maksimal (10MB).
- Tersedia *fallback mock mode* sehingga aplikasi dapat diuji secara interaktif langsung tanpa wajib menghubungkan akun Cloudflare terlebih dahulu.

---

## 🛠️ Tech Stack & Infrastruktur
- **Framework:** Next.js (App Router, Server & Client Components)
- **Bahasa:** TypeScript
- **Styling & UI:** Tailwind CSS, Lucide Icons, Sonner (Toast notifications)
- **Database & Auth:** PostgreSQL via Supabase
- **Object Storage:** Cloudflare R2 (`@aws-sdk/client-s3`)
- **Deployment:** Vercel (Frontend & Serverless Functions) + Supabase (Database)

---

## 🚀 Panduan Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel sesuai kredensial layanan Anda:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=sim-klinik-files
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://pub-your-bucket.r2.dev

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Eksekusi Skema Database (Supabase)
1. Buka [Supabase Dashboard](https://supabase.com).
2. Masuk ke menu **SQL Editor**.
3. Jalankan skrip `supabase/migrations/001_initial_schema.sql` untuk membuat tabel, tipe ENUM, fungsi kalkulasi kuota, dan aturan keamanan RLS.
4. Jalankan skrip `supabase/seed.sql` untuk mengisi data awal poliklinik, dokter spesialis, jadwal praktik, dan akun demo.

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

### 5. Build Produksi
```bash
npm run build
npm start
```

---

## 🧪 Akun Demo & Fast Role Switcher
Untuk memudahkan evaluasi dan pengujian alur bisnis, aplikasi dilengkapi fitur **1-Click Fast Role Switcher** di bilah navigasi dan halaman masuk `/auth/login`:

| Peran | Email Demo | Akses Halaman |
| :--- | :--- | :--- |
| **Admin** | `admin@kliniksehat.id` | `/dashboard/admin` |
| **Petugas FO** | `petugas@kliniksehat.id` | `/dashboard/petugas` |
| **Dokter** | `dokter.budi@kliniksehat.id` | `/dashboard/dokter` |
| **Pasien** | `pasien@kliniksehat.id` | `/dashboard/pasien` |

---

## 📁 Struktur Direktori
```
sim-klinik/
├── src/
│   ├── app/
│   │   ├── antrean/page.tsx                # Layar monitor TV antrean lobby
│   │   ├── api/upload/route.ts             # API handler Cloudflare R2 upload
│   │   ├── auth/
│   │   │   ├── login/page.tsx              # Halaman masuk & role switcher
│   │   │   └── register/page.tsx           # Registrasi akun pasien
│   │   ├── dashboard/
│   │   │   ├── admin/                      # Suite Admin (Poli, Dokter, Jadwal, Users, Laporan)
│   │   │   ├── dokter/                     # Ruang periksa dokter & input SOAP RME
│   │   │   ├── pasien/                     # E-Tiket antrean & booking poli
│   │   │   └── petugas/                    # Meja Front Office & pendaftaran walk-in
│   │   ├── layout.tsx                      # Root layout (AuthProvider & Toaster)
│   │   └── page.tsx                        # Landing page publik profil klinik
│   ├── components/
│   │   ├── dashboard/dashboard-layout.tsx  # Layout terpadu sidebar + navbar per peran
│   │   └── ui/                             # Navbar, Footer, FileUploader R2
│   ├── lib/
│   │   ├── auth-context.tsx                # Context otentikasi & manajemen sesi
│   │   ├── clinic-service.ts               # Service layer data, kuota, & antrean
│   │   ├── mock-data.ts                    # Inisialisasi data realistis
│   │   ├── r2.ts                           # Klien S3 Cloudflare R2
│   │   ├── supabase/                       # Klien Supabase (Browser & Server)
│   │   └── utils.ts                        # Helper format rupiah, tanggal, badge status
│   └── types/
│       └── database.ts                     # Definisi tipe TypeScript
├── supabase/
│   ├── migrations/001_initial_schema.sql   # DDL PostgreSQL lengkap + RLS + Triggers
│   └── seed.sql                            # Data seed poliklinik, dokter, & jadwal
├── .env.example                            # Template variabel lingkungan
└── README.md                               # Dokumentasi lengkap proyek
```

---

Dibuat dengan standar kualitas medis modern untuk **Klinik Sehat Utama**.
