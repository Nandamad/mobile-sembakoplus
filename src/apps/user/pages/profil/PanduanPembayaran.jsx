import { useLocation, useNavigate } from "react-router-dom";
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Info,
  QrCode,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import "./PanduanPembayaran.css";

const QRIS_STEPS = [
  {
    title: "Dapatkan Kode QRIS di Checkout",
    detail: "Pilih metode QRIS lalu tekan Bayar Sekarang. Kode pembayaran akan ditampilkan di halaman berikutnya.",
  },
  {
    title: "Buka E-Wallet / Mobile Banking",
    detail: "Gunakan aplikasi yang mendukung QRIS, seperti GoPay, OVO, DANA, ShopeePay, BCA, atau Mandiri.",
  },
  {
    title: "Scan QR & Masukkan PIN",
    detail: "Pastikan nama merchant dan nominal sudah sesuai sebelum mengonfirmasi pembayaran.",
  },
  {
    title: "Tunggu Konfirmasi Pembayaran",
    detail: "Status pesanan akan diperbarui setelah pembayaran dikonfirmasi oleh penyedia pembayaran.",
  },
];

const COD_STEPS = [
  {
    title: "Tunggu Kurir Tiba di Alamat",
    detail: "Pastikan nomor telepon aktif dan ada penerima di alamat saat pesanan diantar.",
  },
  {
    title: "Cek Kondisi & Kesegaran Produk",
    detail: "Periksa jumlah dan kondisi produk sesuai rincian pesanan sebelum menyelesaikan pembayaran.",
  },
  {
    title: "Bayar Tunai ke Kurir",
    detail: "Siapkan uang tunai sesuai total tagihan yang tertera di aplikasi. Minta bukti pembayaran setelah transaksi.",
  },
];

function GuideSteps({ steps }) {
  return (
    <ol className="payment-guide__steps">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="payment-guide__step-number">{index + 1}</span>
          <div>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function PanduanPembayaran() {
  const navigate = useNavigate();
  const { state } = useLocation();

  function returnToHelpCenter() {
    if (state?.fromHelpCenter) {
      navigate(-1);
      return;
    }
    navigate("/profil/bantuan", { replace: true });
  }

  return (
    <main className="payment-guide">
      <header className="payment-guide__header">
        <button type="button" aria-label="Kembali ke pusat bantuan" onClick={returnToHelpCenter}>
          <ChevronLeft size={16} />
        </button>
        <h1>Panduan Pembayaran</h1>
      </header>

      <div className="payment-guide__content">
        <section className="payment-guide__intro">
          <span><ShieldCheck size={15} /></span>
          <div>
            <strong>Pembayaran QRIS &amp; Tunai di Tempat</strong>
            <p>Pilih cara bayar yang paling nyaman. Metode tersedia mengikuti opsi saat checkout.</p>
          </div>
          <small>AMAN &amp; MUDAH</small>
        </section>

        <section className="payment-guide__section">
          <header className="payment-guide__section-title">
            <span className="payment-guide__icon payment-guide__icon--qris"><QrCode size={14} /></span>
            <strong>Cara Bayar via QRIS</strong>
            <small>Metode Non-tunai</small>
          </header>
          <GuideSteps steps={QRIS_STEPS} />
          <p className="payment-guide__note">
            <Info size={11} />
            Kode QRIS terhubung ke payment gateway Midtrans dan terkonfirmasi otomatis setelah pembayaran berhasil.
          </p>
        </section>

        <section className="payment-guide__section">
          <header className="payment-guide__section-title">
            <span className="payment-guide__icon payment-guide__icon--cod"><Banknote size={14} /></span>
            <strong>Cara Bayar COD (Tunai)</strong>
            <small>Bayar di Alamat</small>
          </header>
          <GuideSteps steps={COD_STEPS} />
          <p className="payment-guide__note payment-guide__note--safe">
            <CheckCircle2 size={11} />
            Bayar sesuai total tagihan yang tercantum di aplikasi.
          </p>
        </section>

        <div className="payment-guide__secure">
          <Wallet size={12} />
          <span>Butuh Bantuan Pembayaran?<small>Hubungi CS jika pembayaran belum terkonfirmasi atau ada kendala.</small></span>
          <Clock3 size={12} />
        </div>
      </div>

      <footer className="payment-guide__footer">
        <button type="button" onClick={returnToHelpCenter}>
          Saya Mengerti &amp; Kembali
        </button>
      </footer>
    </main>
  );
}
