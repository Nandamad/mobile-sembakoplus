import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, MapPin, PackageCheck } from "lucide-react";
import "./Pembayaran.css";

const rupiah = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;

export default function StatusPembayaran() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const paymentData = state?.paymentData;

  if (!paymentData?.items?.length) {
    return (
      <main className="payment-status">
        <header className="payment-flow__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate("/checkout")}>
            <ChevronLeft size={17} />
          </button>
          <h1>Status Pembayaran</h1>
        </header>
        <section className="payment-flow__empty">
          <p>Informasi transaksi tidak ditemukan. Status pembayaran belum dapat ditampilkan.</p>
          <button type="button" onClick={() => navigate("/beranda")}>Kembali ke Beranda</button>
        </section>
      </main>
    );
  }

  const items = paymentData.items;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const paidAt = new Date(state.paidAt).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="payment-status">
      <header className="payment-flow__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate("/pembayaran/qris", { state: paymentData })}>
          <ChevronLeft size={17} />
        </button>
        <h1>Status Pembayaran</h1>
      </header>

      <div className="payment-status__success">
        <span><Check size={27} /></span>
        <h2>Pembayaran Berhasil!</h2>
        <strong>{rupiah(total)}</strong>
        <small>SIMULASI • BELUM TERVERIFIKASI SERVER</small>
      </div>

      <section className="payment-status__transaction">
        <h3>Rincian Transaksi</h3>
        <div><span>Waktu Pembayaran</span><strong>{paidAt}</strong></div>
        <div><span>Metode Pembayaran</span><strong>QRIS (Simulasi)</strong></div>
        <div><span>No. Referensi (Demo)</span><strong>{state.orderReference}</strong></div>
        <div><span>No. Pesanan</span><strong>{state.orderReference}</strong></div>
        <div><span>Total Belanja ({itemCount} Barang)</span><strong>{rupiah(total)}</strong></div>
        <div><span>Biaya Layanan QR</span><strong className="is-free">Rp 0 (Gratis)</strong></div>
      </section>

      <section className="payment-status__processing">
        <span><PackageCheck size={14} /></span>
        <div>
          <strong>Pesanan Sedang Diproses Toko</strong>
          <b>Estimasi Tiba: Pagi (08:00 - 11:00 WIB)</b>
          <p>Ini tampilan simulasi. Toko belum menerima pesanan karena backend pembayaran belum aktif.</p>
        </div>
      </section>

      <footer className="payment-status__footer">
        <button type="button" onClick={() => navigate("/pesanan/lacak")}>
          <MapPin size={12} /> Lacak Pengiriman Pesanan
        </button>
        <button type="button" className="is-secondary" onClick={() => navigate("/beranda")}>
          Kembali ke Beranda
        </button>
      </footer>
    </main>
  );
}
