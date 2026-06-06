# DMods: Mobile-First Mod APK & IPA Hub

Project panduan untuk membangun platform web penyedia aplikasi modifikasi (APK & IPA) yang responsif, cepat, dan berbasis data hasil scraping.

## 🎯 Visi Produk
Menjadi platform terpercaya untuk menemukan aplikasi modifikasi dengan pengalaman pengguna mobile-first yang superior, navigasi intuitif, dan data yang selalu terupdate.

## 🛠 Tech Stack
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Style: Base Nova)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript
- **Database (Rekomendasi):** PostgreSQL / Supabase (untuk menyimpan hasil scraping)

## 🏗 Arsitektur & Konvensi

### 1. Mobile-First Approach
- Gunakan **Vanilla CSS** atau Tailwind utilities dengan prioritas breakpoint terkecil (default).
- Ukuran touch target minimal 44x44px untuk elemen interaktif.
- Navigasi bawah (Bottom Navigation) untuk kemudahan akses satu jempol.

### 2. Strategi Data (Scraping)
- **Scraper Service:** Pisahkan logika scraping dari UI. Gunakan API internal atau serverless functions untuk menjalankan cron-job update data.
- **Data Integrity:** Pastikan metadata seperti versi, ukuran file, tanggal update, dan link download terisi lengkap.
- **Cache:** Gunakan Next.js Data Cache (ISR/Incremental Static Regeneration) agar halaman tetap cepat namun data tetap segar.

### 3. Struktur Komponen (shadcn)
- Komponen UI diletakkan di `src/components/ui/`.
- Komponen fitur diletakkan di `src/components/features/`.
- Gunakan `src/lib/utils.ts` untuk helper Tailwind (`cn`).

### 4. SEO & Performa
- Manfaatkan **Server Components** secara maksimal untuk SEO aplikasi mod.
- Optimasi gambar menggunakan `next/image` untuk mengurangi beban bandwidth mobile.
- Implementasikan Metadata API di setiap halaman aplikasi.

## 📱 Fitur Utama
- **Search & Filter:** Memudahkan pencarian berdasarkan kategori (Game, Tool, Social) dan platform (Android/iOS).
- **App Details Page:** Menampilkan deskripsi mod, fitur premium yang dibuka, dan riwayat versi.
- **Safe Download:** Preview link download dengan proteksi atau peringatan keamanan.
- **Dark Mode:** Default theme harus mendukung kenyamanan mata di malam hari.

## 🚀 Alur Pengembangan (Workflow)
1. **Scraping:** Pastikan data masuk ke database dengan format yang konsisten.
2. **UI Design:** Bangun mockup mobile-first menggunakan shadcn components.
3. **Integration:** Hubungkan UI dengan database menggunakan Server Actions atau API.
4. **Validation:** Uji responsivitas di berbagai ukuran layar smartphone.

## 🛡 Keamanan & Etika
- Berikan disclaimer bahwa konten adalah hasil scraping dan pihak ketiga.
- (Opsional) Integrasikan pengecekan virus (misal: API VirusTotal) untuk meningkatkan kepercayaan pengguna.
