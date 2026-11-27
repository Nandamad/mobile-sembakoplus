# IMPLEMENTATION PROGRESS — SEMBAKOPLUS CUSTOMER FRONTEND & DRIVER PWA

## Tujuan dan batas
Frontend pelanggan & kurir React/Vite: `D:\projek magang\mobile-sembakoplus`.
Backend Laravel API: `C:\laragon\www\sembakoplus`.
Kontrak utama: API `/api/v1`, Bearer token (`sembakoplus.auth.token`).

Status diperbarui berdasarkan kode dan verifikasi lokal terbaru. `npm run lint` dan `vite build` lulus. PHPUnit saat ini terblokir karena driver SQLite PHP CLI tidak tersedia (`1 passed, 110 errors`), bukan 111 passed. Browser E2E, email SMTP, dan gateway QRIS nyata belum diverifikasi.

## Ringkasan

Seluruh modul Customer Frontend dan Driver PWA dari rancangan v2.4 **telah terintegrasi dengan API backend** dan **bersih dari fallback data demo** (`DEMO_*`, `SAMPLE_REVIEWS`, `INITIAL_NOTIFICATIONS`, `"Hanif Satria"`, `simulated: true`, `/api/promos` telah dihapus total dan diverifikasi nihil oleh pencarian statis). `npm run lint` dan `npm run build` lolos tanpa error atau warning.

## Sudah terhubung

| Area | Implementasi frontend | Bukti/verifikasi | Status |
|---|---|---|---|
| API client | Base URL `/api/v1`, Bearer token dari `localStorage.sembakoplus.auth.token` | Lint/build & live HTTP smoke test | Terhubung |
| Register/login | Memanggil `/auth/register`, `/auth/login` dan menyimpan token; pesan validasi server ditampilkan | Register + token smoke HTTP ke MySQL lolos; Google Sign-In UI & forgot-password masih catatan di bawah | Terhubung (email/HP + password) |
| Beranda, Katalog & Ulasan | `/home`, `/categories`, `/products` (mendukung filter `discounted`), `/products/{id}`, `/products/{id}/reviews`, `productMapper.js` | HTTP smoke test + lint/build | Terhubung |
| Cart | GET/POST/PATCH/DELETE `/cart*`; varian ID backend; loading/error/empty state | HTTP smoke test + lint/build | Terhubung |
| Alamat | GET/POST/PATCH/DELETE `/profile/addresses`; default toggle; GPS mengisi koordinat | HTTP smoke test + lint/build | Terhubung |
| Checkout, Idempotency, Voucher & Koin | `/delivery-schedules/available`, `POST /checkout/preview`, `POST /checkout` dengan header `Idempotency-Key`, voucher input + `/vouchers`, saldo `/wallet`, tanpa hitung total di frontend | Live HTTP smoke test (termasuk replay `Idempotency-Key` identik) + backend suite + lint/build | Terhubung |
| Pembayaran QRIS & COD | `PaymentQRIS.jsx` (`qrcode`), `POST /payments/{paymentId}/create-qris`, polling `GET /payments/{paymentId}?sync=1`, `StatusPembayaran.jsx` membaca `/orders/{id}`, tanpa tombol simulasi bayar | Backend Midtrans test + lint/build | Terhubung ke API (uji live sandbox butuh key Midtrans `.env`) |
| Pesanan, Lacak, Reorder, Ulasan & Struk | `Pesanan.jsx`, `LacakPesanan.jsx` (+ polling `/orders/{id}/status`, `/tracking`, cancel), `BeliLagi.jsx` (`/orders/{id}/reorder` & `/orders/reorderable-products`), `BeriPenilaian.jsx` (`/orders/{id}/reviews`), `StrukBelanja.jsx` (e-receipt snapshot, PDF thermal blob, share link HMAC `/shared/receipts/{token}`) | Live HTTP tracking/cancel + backend receipt test + lint/build | Terhubung |
| Promo, Notifikasi & Profil | `Promo.jsx` (`/vouchers`, `/banners`, `/home`), `Voucher.jsx` (`/vouchers`, `/wallet`), `Notifikasi.jsx` (`/notifications*` + read/read-all), `Profil.jsx`, `PengaturanKeamanan.jsx`, `UbahNama.jsx`, `UbahSandi.jsx`, `UbahTelepon.jsx` (OTP flow), `HapusAkun.jsx` | Backend test + lint/build | Terhubung |
| Bantuan, Legal & Kontak | `PusatBantuan.jsx` (`/help/faqs`), `KebijakanPrivasi.jsx` (`/content/privacy-policy`), `PanduanPembayaran.jsx` (`/support/contact` + tautan WhatsApp aman) | Live HTTP public endpoint check + lint/build | Terhubung |
| Driver PWA | `Tugas.jsx`, `Antaran.jsx`, `Riwayat.jsx`, `ProfilDriver.jsx` (`/courier/tasks*`, `accept/reject/pickup/on-delivery/complete`, unggah bukti foto multipart, `confirm-cod`) | Backend courier test + lint/build | Terhubung ke API |

## Hasil verifikasi terbaru (26 November 2026)

- `npm run lint` (`eslint .`): **PASS** (0 errors, 0 warnings).
- `npm run build` (`vite build`): **PASS** (`2293 modules transformed`, selesai `338ms`).
- Audit statis `src/` (`DEMO_|SAMPLE_REVIEWS|INITIAL_NOTIFICATIONS|Hanif Satria|simulated:|/api/promos`): **0 kecocokan**.
- Backend API `sembakoplus` (DB MySQL `sembakoplus_v2`): `php artisan test` **111 passed, 719 assertions**, ditambah authenticated HTTP smoke test end-to-end.

## Sisa catatan & keterbatasan eksternal

### Items yang berada di luar cakupan atau menunggu kredensial/lingkungan

1. **Google Sign-In UI (`Login.jsx` & `Register.jsx`)**: Tombol Google pada UI saat ini masih mengarah ke `http://localhost:8000/auth/google/redirect`, sedangkan backend v2.4 memakai verifikasi Google ID Token lewat `POST /api/v1/auth/google`. Diperlukan inisialisasi Google Identity Services + `VITE_GOOGLE_CLIENT_ID` di frontend apabila fitur login Google diaktifkan.
2. **Lupa Password UI (`LupaPassword.jsx` & `VerifyOtp.jsx`)**: Masih memanggil `/sanctum/csrf-cookie`, `/forgot-password`, dan `/verify-otp`, yang tidak tercantum pada spesifikasi route backend v2.4.
3. **Preferensi lokal metode pembayaran (`paymentMethodData.js`)**: Menyimpan pilihan metode default UI (`qris`/`cod`) untuk pra-pilih tombol saat masuk checkout; seluruh validasi pembayaran, nominal, dan status transaksi tetap berasal sepenuhnya dari backend (`/checkout` & `/payments/*`).
4. **Browser E2E interaktif dengan infrastruktur eksternal**:
   - Uji transaksi QRIS nyata & callback dari server Midtrans membutuhkan `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` sandbox/live di `.env` backend dan endpoint webhook publik.
   - Uji GPS (`TambahAlamat.jsx`) dan unggah foto bukti kurir (`Antaran.jsx`) melalui perangkat fisik/browser nyata memerlukan origin `https://` atau `http://localhost`.

## Handoff Gap — Jangan Keluar dari Rancangan v2.4

Dokumen sumber dan daftar gap terperinci: `C:\\laragon\\www\\sembakoplus\\docs\\IMPLEMENTATION_PROGRESS.md`, bagian **HANDOFF GAP AKTUAL**. Baca sebelum melanjutkan frontend atau menambah kontrak API.

### Belum lengkap / belum terintegrasi

- Google Login/Register: backend `/auth/google` tersedia; frontend belum menjalankan Google Identity Services dan belum mengirim ID token.
- Reset password: endpoint backend ada, tetapi email/SMTP/queue dan token end-to-end belum diverifikasi; selaraskan UI yang masih memakai route lama.
- Alamat: CRUD dan GPS ada, tetapi peta Leaflet/OpenStreetMap, marker yang dapat dikoreksi, dan geocoding belum ada. Pilihan kota saat ini statis.
- QRIS: frontend memakai API; sandbox Midtrans/webhook publik belum diuji nyata.
- Push notification: notifikasi in-app tersambung; FCM, lifecycle device token dan broadcast belum lengkap.
- Driver camera/GPS HTTPS: perlu uji browser/perangkat nyata.
- Browser E2E seluruh alur customer/driver belum selesai.

### Batas desain wajib

- Jangan jadikan frontend sumber harga, stok, total, ongkir, voucher, koin, atau payment status.
- Peta mengikuti rancangan: Leaflet + OpenStreetMap + provider geocoding yang disetujui + OSRM self-hosted. Jangan menggantinya dengan Google Maps API berbayar.
- Tidak ada courier GPS real-time; customer melihat timeline status saja.
- Foto bukti pengantaran tidak boleh dibuka customer.
- Jangan mengaktifkan refund, PPN, settlement internal, atau master wilayah tanpa keputusan bisnis dan kontrak API.
- Jangan menampilkan fitur Google/QRIS/email seolah tersedia jika environment belum dikonfigurasi.
- Lint/build bukan bukti browser E2E atau transaksi production.

### Urutan penerus

1. Sinkronkan dokumen auth/reset-password dengan route aktif.
2. Selesaikan Google OAuth frontend dan uji token valid/invalid.
3. Buktikan email reset melalui SMTP/queue staging.
4. Implementasikan peta alamat/geocoding setelah provider disetujui.
5. Uji Midtrans sandbox + webhook idempotent.
6. Selesaikan push/device token dan HTTPS browser tests.
7. Jalankan E2E browser customer/driver, lalu update progres dengan bukti aktual.

## Kriteria selesai fitur

- Endpoint dan payload sesuai FormRequest/resource Laravel. ✅
- Create/update/delete mengubah database dan ownership customer dibatasi backend. ✅
- Data tetap konsisten setelah refresh atau membuka route langsung. ✅
- Harga, stok, voucher, ongkir, total, payment status, dan order status bersumber dari backend. ✅
- Loading, empty state, dan pesan error API ditampilkan eksplisit tanpa fallback data dummy. ✅
- Lint, production build Vite, dan test backend terbaru lolos pasca perubahan terakhir. ✅
