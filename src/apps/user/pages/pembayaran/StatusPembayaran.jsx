import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Clock3, FileText, MapPin, PackageCheck } from "lucide-react";
import api from "../../../../shared/services/api";
import "./Pembayaran.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function StatusPembayaran() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || state?.order?.id || state?.payment?.order_id;

  const [order, setOrder] = useState(state?.order ?? null);
  const [loading, setLoading] = useState(Boolean(orderId) && !state?.order?.items);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return undefined;
    let active = true;
    api.get(`/orders/${orderId}`)
      .then(({ data }) => {
        if (active) {
          setOrder(data?.data ?? null);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Status pembayaran gagal dimuat.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [orderId]);

  if (loading) {
    return (
      <main className="payment-status">
        <header className="payment-flow__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}><ChevronLeft size={17} /></button>
          <h1>Status Pembayaran</h1>
        </header>
        <p className="payment-flow__empty">Memuat status pembayaran...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="payment-status">
        <header className="payment-flow__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}>
            <ChevronLeft size={17} />
          </button>
          <h1>Status Pembayaran</h1>
        </header>
        <section className="payment-flow__empty">
          <p>{error || "Informasi transaksi tidak ditemukan."}</p>
          <button type="button" onClick={() => navigate("/pesanan")}>Ke Pesanan Saya</button>
        </section>
      </main>
    );
  }

  const isPaid = order.payment_status === "paid" || order.payment?.is_paid;
  const itemCount = (order.items ?? []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const paidAt = order.payment?.paid_at
    ? new Date(order.payment.paid_at).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <main className="payment-status">
      <header className="payment-flow__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}>
          <ChevronLeft size={17} />
        </button>
        <h1>Status Pembayaran</h1>
      </header>

      <div className="payment-status__success">
        <span>{isPaid ? <Check size={27} /> : <Clock3 size={27} />}</span>
        <h2>{isPaid ? "Pembayaran Berhasil!" : `Status: ${order.payment?.status || order.payment_status}`}</h2>
        <strong>{rupiah(order.total)}</strong>
        <small>{isPaid ? "TERVERIFIKASI SERVER" : "MENUNGGU KONFIRMASI GATEWAY"}</small>
      </div>

      <section className="payment-status__transaction">
        <h3>Rincian Transaksi</h3>
        <div><span>Waktu Pembayaran</span><strong>{paidAt}</strong></div>
        <div><span>Metode Pembayaran</span><strong>{String(order.payment?.payment_method || "qris").toUpperCase()}</strong></div>
        <div><span>No. Pesanan</span><strong>{order.order_number}</strong></div>
        {order.invoice_number && <div><span>No. Invoice</span><strong>{order.invoice_number}</strong></div>}
        <div><span>Total Belanja ({itemCount} Barang)</span><strong>{rupiah(order.total)}</strong></div>
      </section>

      <section className="payment-status__processing">
        <span><PackageCheck size={14} /></span>
        <div>
          <strong>Status Pesanan: {order.order_status}</strong>
          <b>Jadwal: {order.delivery_schedule?.delivery_date || "-"} ({order.delivery_schedule?.start_time} - {order.delivery_schedule?.end_time} WIB)</b>
          <p>{isPaid ? "Pembayaran telah diterima dan pesanan Anda sedang ditangani toko." : "Pembayaran belum tercatat lunas di server."}</p>
        </div>
      </section>

      <footer className="payment-status__footer">
        <button type="button" onClick={() => navigate(`/pesanan/lacak?orderId=${order.id}`, { state: { order } })}>
          <MapPin size={12} /> Lacak Pengiriman Pesanan
        </button>
        {isPaid && (
          <button type="button" className="is-secondary" onClick={() => navigate(`/pesanan/struk?orderId=${order.id}`, { state: { order } })}>
            <FileText size={12} /> Lihat Struk Digital
          </button>
        )}
      </footer>
    </main>
  );
}
