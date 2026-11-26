# IMPLEMENTATION PROGRESS — SEMBAKOPLUS CUSTOMER FRONTEND

## Tujuan dan batas
Frontend pelanggan React/Vite: `D:\projek magang\mobile-sembakoplus`.
Backend Laravel API: `C:\laragon\www\sembakoplus`.
Kontrak utama: API `/api/v1`, Bearer token.

Status di bawah berdasarkan pemeriksaan kode dan command yang dijalankan pada 26 November 2026. Fitur yang belum diuji melalui UI/browser disebut belum terverifikasi, meskipun endpoint backend tersedia.

## Ringkasan

Frontend dan backend **belum seluruhnya terintegrasi**. Auth, katalog, cart, alamat, dan checkout preview/create sudah memiliki integrasi kode. Namun pembayaran, order lifecycle, promo/voucher, notifikasi, profil, dan beberapa halaman bantuan masih demo/lokal atau belum diverifikasi.

## Sudah terhubung

| Area | Implementasi frontend | Bukti/verifikasi | Status |
|---|---|---|---|
| API client | Base URL `/api/v1`, Bearer token dari `localStorage.sembakoplus.auth.token` | Build/lint | Terhubung |
| Register/login | Memanggil `/auth/register`, `/auth/login` dan menyimpan token | Login HTTP backend berhasil; UI perlu browser E2E ulang | Parsial terverifikasi |
| Beranda/katalog | `/home`, `/categories`, `/products`; produk detail `/products/{id}` | Endpoint katalog sebelumnya HTTP 200; build/lint | Terhubung |
| Cart | GET/POST/PATCH/DELETE item cart; varian ID API; pesan error/sukses UI | Authenticated API CRUD: `201/200/200/204` | API terverifikasi; browser UI belum E2E |
| Alamat | GET/POST/PATCH/DELETE `/profile/addresses`; jadikan default; pakai ID backend; GPS browser mengisi koordinat wajib | Authenticated API CRUD: `201/200/200/204`; lint/build terakhir lolos | API terverifikasi; browser GPS/UI belum E2E |
| Checkout | Memuat cart/alamat/jadwal; preview dari API; create order ke API | Route dan jadwal API dicek; lint/build lolos | Implementasi ada, E2E create order belum terbukti |

## Gap dan pekerjaan penerus

### P0 — Validasi alur checkout

- Jalankan browser flow nyata: login → tambah cart → buat alamat dengan izin GPS → pilih jadwal → preview → create order.
- Pastikan slot dan alamat lolos aturan backend/OSRM. Backend production OSRM bisa menolak checkout bila belum dikonfigurasi; jangan menganggap build sebagai bukti order sukses.
- UI sekarang checkout memakai seluruh cart backend. Seleksi item pada halaman cart tidak dikirim sebagai subset; selaraskan dengan rancangan/backend atau jelaskan bahwa checkout selalu memproses seluruh isi cart.
- Pastikan setelah order dibuat cart dikosongkan oleh backend dan halaman menampilkan nomor order dari `order_number`.

### P0 — Pembayaran QRIS/COD

- `PaymentQRIS.jsx` masih membuat QR visual sintetis, menampilkan status demo, dan meneruskan `simulated: true`. QR ini **tidak dapat dipakai membayar**.
- Integrasikan create-payment/transaction dari Midtrans sandbox setelah backend menyediakan kontrak yang selesai; tampilkan Snap URL/QR/token asli.
- Ambil status payment/order dari API; hapus tombol “Saya Sudah Membayar” yang hanya mensimulasikan sukses.
- COD harus menunjukkan status order nyata, bukan hanya navigasi halaman daftar.
- Backend progress menyebut gateway Midtrans sandbox/live, invoice/e-receipt belum diverifikasi/selesai.

### P1 — Order lifecycle

- Integrasikan `GET /orders`, detail `/orders/{id}`, status polling `/orders/{id}/status`, cancel, reorder, rating, payment.
- Ubah halaman Pesanan, LacakPesanan, BeliLagi, BeriPenilaian, StrukBelanja yang masih memakai data demo atau state navigasi agar membaca order backend.
- Uji refresh/deep link: halaman detail harus bisa mengambil data berdasarkan order ID tanpa bergantung state navigasi.

### P1 — Promo, voucher, coins, rewards

- `Promo.jsx` masih memiliki `DEMO_PROMOS`; endpoint yang dipanggil perlu dicocokkan dengan routes/backend saat ini.
- Integrasikan voucher milik customer, validasi voucher server, koin dan reward; gunakan response server sebagai sumber kebenaran.
- Jangan menghitung diskon final di frontend.

### P1 — Profil dan notifikasi

- Profil nama masih memakai `localStorage` dan fallback identitas contoh. Hubungkan GET/PATCH `/profile` dan hapus data contoh.
- Metode pembayaran masih disimpan lokal; kontrak pembayaran backend belum sepenuhnya membuktikan pilihan itu tersimpan/berlaku.
- Notifikasi punya data statis; hubungkan `/notifications`, mark-read, read-all dan refresh.
- Hubungkan ganti password, ganti nomor/OTP, email verification, hapus akun ke API; uji token invalidasi dan error validasi.

### P2 — Bantuan, legal, dan UX

- Halaman bantuan/legal/kontak dukungan masih perlu dicocokkan dengan API backend. Backend progress mencatat endpoint pusat bantuan/legal/kontak belum lengkap.
- Tambahkan loading, empty state, retry, validasi server, dan error state konsisten untuk seluruh halaman API.
- Pastikan fitur GPS memakai HTTPS atau localhost dan menangani izin ditolak/timeout; saat ini tidak ada peta interaktif/geocoding.

### P2 — Kebersihan data statis

Audit pencarian menemukan data atau state lokal di:

- `pages/promo/Promo.jsx` — `DEMO_PROMOS`
- `pages/pembayaran/PaymentQRIS.jsx` — QR dan status simulasi
- `pages/pesanan/BeriPenilaian.jsx` — `DEMO_ORDER`
- `pages/pesanan/LacakPesanan.jsx` — `DEMO_ORDER`
- `pages/profil/Profil.jsx` — fallback nama lokal
- `pages/profil/PengaturanKeamanan.jsx` — fallback nama lokal
- `pages/profil/UbahNama.jsx` — nama disimpan lokal
- `pages/profil/paymentMethodData.js` — metode pembayaran disimpan lokal

`localStorage` auth token boleh dipertahankan sebagai mekanisme sesi jika sesuai keputusan implementasi. Jangan gunakan localStorage sebagai sumber kebenaran data domain.

## Urutan pengerjaan yang disarankan

1. Selesaikan browser E2E alamat + checkout preview + create order; perbaiki setiap mismatch request/resource.
2. Uji order history/detail/cancel/reorder/rating/struk dengan API dan refresh halaman.
3. Selesaikan kontrak payment Midtrans sandbox di backend, lalu integrasikan UI pembayaran.
4. Hubungkan profil, verifikasi akun, notifikasi, voucher, coins/rewards.
5. Hubungkan pusat bantuan/legal setelah endpoint backend tersedia.
6. Hapus semua `DEMO_*`, data pelanggan contoh, simulasi pembayaran, dan fallback lokal untuk data backend.
7. Tambahkan regression tests / browser E2E untuk alur utama.
8. Jalankan `npm run lint`, `npm run build`, tes backend terbaru, dan `git diff --check`; catat hasil aktual di dokumen ini.

## Kriteria selesai fitur

- Endpoint dan payload sesuai FormRequest/resource Laravel.
- Create/update/delete benar-benar mengubah database dan ownership customer dibatasi backend.
- Data tetap benar setelah refresh atau membuka route langsung.
- Harga, stok, voucher, ongkir, total, payment status, order status bersumber dari backend.
- Error, loading, empty state terlihat jelas.
- Tidak ada data dummy yang diam-diam menggantikan kegagalan API.
- Ada hasil uji authenticated untuk sukses, validasi gagal, dan akses tanpa izin.
