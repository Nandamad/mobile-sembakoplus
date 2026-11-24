import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Login from "../../shared/pages/auth/Login";
import Register from "../../shared/pages/auth/Register";
import LupaPassword from "../../shared/pages/auth/LupaPassword";
import VerifyOtp from "../../shared/pages/auth/VerifyOtp";
import Beranda from "./pages/beranda/Beranda";
import ProductDetail from "./pages/produk/ProductDetail";
import ProductReviews from "./pages/produk/ProductReviews";
import Profil from "./pages/profil/Profil";
import Voucher from "./pages/profil/Voucher";
import Pesanan from "./pages/pesanan/Pesanan";
import BeliLagi from "./pages/pesanan/BeliLagi";
import StrukBelanja from "./pages/pesanan/StrukBelanja";
import LacakPesanan from "./pages/pesanan/LacakPesanan";
import BeriPenilaian from "./pages/pesanan/BeriPenilaian";
import DaftarAlamat from "./pages/profil/DaftarAlamat";
import MetodePembayaran from "./pages/profil/MetodePembayaran";
import PusatBantuan from "./pages/profil/PusatBantuan";
import PanduanPembayaran from "./pages/profil/PanduanPembayaran";
import KebijakanPrivasi from "./pages/profil/KebijakanPrivasi";
import PengaturanKeamanan from "./pages/profil/PengaturanKeamanan";
import UbahNama from "./pages/profil/UbahNama";
import UbahSandi from "./pages/profil/UbahSandi";
import UbahTelepon from "./pages/profil/UbahTelepon";
import HapusAkun from "./pages/profil/HapusAkun";
import TambahAlamat from "./pages/profil/TambahAlamat";
import Promo from "./pages/promo/Promo";
import Notifikasi from "./pages/notifikasi/Notifikasi";
import Keranjang from "./pages/keranjang/Keranjang";
import Checkout from "./pages/keranjang/Checkout";
import PaymentQRIS from "./pages/pembayaran/PaymentQRIS";
import StatusPembayaran from "./pages/pembayaran/StatusPembayaran";

function App() {
  return (
    <BrowserRouter>
      <Routes>    
        <Route path="/" element={<Splash />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/daftar" element={<Register />} />
        <Route path="/lupa-password" element={<LupaPassword />} />
        <Route path="/verifikasi-otp" element={<VerifyOtp />} />
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/produk/:id/ulasan" element={<ProductReviews />} />
        <Route path="/produk/:id" element={<ProductDetail />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
        <Route path="/keranjang" element={<Keranjang />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pembayaran/qris" element={<PaymentQRIS />} />
        <Route path="/pembayaran/status" element={<StatusPembayaran />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/profil/voucher" element={<Voucher />} />
        <Route path="/profil/alamat" element={<DaftarAlamat />} />
        <Route path="/profil/alamat/ubah" element={<TambahAlamat />} />
        <Route path="/profil/metode-pembayaran" element={<MetodePembayaran />} />
        <Route path="/profil/bantuan" element={<PusatBantuan />} />
        <Route path="/profil/bantuan/pembayaran" element={<PanduanPembayaran />} />
        <Route path="/profil/kebijakan" element={<KebijakanPrivasi />} />
        <Route path="/profil/keamanan" element={<PengaturanKeamanan />} />
        <Route path="/profil/ubah-nama" element={<UbahNama />} />
        <Route path="/profil/ubah-sandi" element={<UbahSandi />} />
        <Route path="/profil/ubah-telepon" element={<UbahTelepon />} />
        <Route path="/profil/hapus-akun" element={<HapusAkun />} />
        <Route path="/profil/alamat/tambah" element={<TambahAlamat />} />
        <Route path="/promo" element={<Promo />} />
        <Route path="/pesanan" element={<Pesanan />} />
        <Route path="/pesanan/beli-lagi" element={<BeliLagi />} />
        <Route path="/pesanan/struk" element={<StrukBelanja />} />
        <Route path="/pesanan/lacak" element={<LacakPesanan />} />
        <Route path="/pesanan/ulasan" element={<BeriPenilaian />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;