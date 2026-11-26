import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  FileText,
  QrCode,
  ShoppingBasket,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import api from "../../../../shared/services/api";
import "./LacakPesanan.css";

const STATUS_TEXT = {
  created: "Pesanan Dibuat",
  processing: "Pesanan Diproses Toko",
  scheduled_tomorrow: "Dijadwalkan Besok",
  delivering: "Pesanan Sedang Diantar",
  arrived: "Pesanan Tiba",
  failed_delivery: "Pengantaran Gagal",
  completed: "Pesanan Selesai",
  cancelled: "Pesanan Dibatalkan",
};

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LacakPesanan() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || state?.order?.id || null;

  const [order, setOrder] = useState(state?.order ?? null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data?.data ?? null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Detail pesanan gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

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
        if (active) setError(err.response?.data?.error?.message || "Detail pesanan gagal dimuat.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !order || ["completed", "cancelled"].includes(order.order_status)) return undefined;
    const timer = window.setInterval(() => {
      api.get(`/orders/${orderId}/status`)
        .then(({ data }) => {
          const next = data?.data;
          if (next && (next.order_status !== order.order_status || next.payment_status !== order.payment_status)) {
            fetchOrder();
          }
        })
        .catch(() => {});
    }, 8000);
    return () => window.clearInterval(timer);
  }, [orderId, order, fetchOrder]);

  async function handleCancel() {
    if (!order) return;
    try {
      setCancelling(true);
      setError("");
      await api.post(`/orders/${order.id}/cancel`, { reason: "Dibatalkan oleh pelanggan" });
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Pesanan tidak dapat dibatalkan.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading && !order) {
    return (
      <main className="tracking">
        <header className="tracking__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}><ChevronLeft size={19} /></button>
          <div><h1>Lacak Pesanan</h1></div>
        </header>
        <p className="tracking__panel">Memuat detail pesanan...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="tracking">
        <header className="tracking__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}><ChevronLeft size={19} /></button>
          <div><h1>Lacak Pesanan</h1></div>
        </header>
        <section className="tracking__panel">
          <p>{error || "Pesanan tidak ditemukan."}</p>
          <button type="button" onClick={() => navigate("/pesanan")}>Kembali ke Pesanan</button>
        </section>
      </main>
    );
  }

  const timeline = Array.isArray(order.timeline) && order.timeline.length > 0
    ? order.timeline
    : [{ new_status: order.order_status, description: STATUS_TEXT[order.order_status] || order.order_status, created_at: order.placed_at }];
  const activeCourier = order.courier_assignments?.[order.courier_assignments.length - 1]?.courier;
  const isPaid = order.payment_status === "paid" || order.payment?.is_paid;
  const isQrisPending = order.payment?.payment_method === "qris" && !isPaid && order.order_status !== "cancelled";
  const canCancel = order.order_status === "created" && !isPaid;

  return (
    <main className="tracking">
      <header className="tracking__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}>
          <ChevronLeft size={19} />
        </button>
        <div>
          <h1>Lacak Pesanan</h1>
          <p>Order #{order.order_number} • {formatTime(order.placed_at)}</p>
        </div>
      </header>

      {error && <p className="tracking__panel" role="alert">{error}</p>}

      <section className="tracking__panel tracking__journey">
        <h2>Perjalanan Status Pesanan</h2>
        <div className="tracking__events">
          {timeline.map((event, index) => {
            const isLast = index === timeline.length - 1;
            const isDone = !isLast || order.order_status === "completed";
            return (
              <div
                className={`tracking__event ${isDone ? "is-done" : "is-current"}`}
                key={`${event.new_status}-${index}`}
              >
                <span className="tracking__dot">
                  {isDone ? <Check size={9} strokeWidth={3} /> : null}
                </span>
                <div className="tracking__event-copy">
                  <strong>{STATUS_TEXT[event.new_status] || event.new_status}</strong>
                  {event.description && <small>{event.description}</small>}
                </div>
                <time>{formatTime(event.created_at)}</time>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tracking__panel tracking__information">
        <header className="tracking__courier">
          <span><UserRound size={17} /></span>
          <strong>{activeCourier ? `Kurir: ${activeCourier.name}` : "Menunggu Penugasan Kurir"}</strong>
        </header>
        <div className="tracking__metadata">
          <div><span>No. Pesanan</span><strong>{order.order_number}</strong></div>
          <div><span>Metode Pembayaran</span><strong>{String(order.payment?.payment_method || "-").toUpperCase()} ({isPaid ? "Lunas" : "Belum Lunas"})</strong></div>
          <div><span>Jadwal Pengiriman</span><strong>{order.delivery_schedule?.delivery_date || "-"} ({order.delivery_schedule?.start_time} - {order.delivery_schedule?.end_time})</strong></div>
          <div className="tracking__full-row"><span>Alamat Pengiriman</span></div>
          <p>
            {order.recipient_name} ({order.recipient_phone})<br />
            {order.address_snapshot}
            {order.address_notes_snapshot ? <><br />Catatan: {order.address_notes_snapshot}</> : null}
          </p>
        </div>
      </section>

      <section className="tracking__panel tracking__products">
        <h2>Daftar Pesanan</h2>
        {(order.items ?? []).map((item) => (
          <div className="tracking__product" key={item.id}>
            <span className="tracking__product-image" aria-hidden="true">🛒</span>
            <div className="tracking__product-copy">
              <strong>{item.product_name}</strong>
              <small>{item.variant_name}</small>
            </div>
            <span className="tracking__quantity">{item.quantity}x</span>
            <span className="tracking__product-prices">
              <strong className="tracking__price">{rupiah(item.line_total)}</strong>
            </span>
          </div>
        ))}
      </section>

      <section className="tracking__panel tracking__bill">
        <h2>Rincian Tagihan</h2>
        <div><span>Subtotal Belanja</span><strong>{rupiah(order.subtotal)}</strong></div>
        <div><span>Diskon Produk</span><strong className="is-discount">-{rupiah(order.product_discount_total)}</strong></div>
        <div><span>Voucher Diskon</span><strong className="is-discount">-{rupiah(order.voucher_discount_total)}</strong></div>
        <div><span>Potongan Koin</span><strong className="is-discount">-{rupiah(order.coin_discount_total)}</strong></div>
        <div><span>Ongkos Kirim</span><strong>{rupiah(order.shipping_cost)}</strong></div>
        <div><span>Subsidi Ongkir</span><strong className="is-discount">-{rupiah(order.shipping_discount)}</strong></div>
        <div className="tracking__bill-total"><span>Total Pembayaran</span><strong>{rupiah(order.total)}</strong></div>
      </section>

      <div className="tracking__receipt-actions">
        {isQrisPending && (
          <button type="button" onClick={() => navigate(`/pembayaran/qris?orderId=${order.id}`, { state: { order } })}>
            <QrCode size={13} />
            Bayar QRIS
          </button>
        )}
        {isPaid && (
          <button type="button" onClick={() => navigate(`/pesanan/struk?orderId=${order.id}`, { state: { order } })}>
            <FileText size={13} />
            Lihat Struk
          </button>
        )}
        {order.order_status === "completed" && !order.rating && (
          <button
            type="button"
            onClick={() => navigate(`/pesanan/ulasan?orderId=${order.id}`, { state: { order } })}
          >
            <Star size={13} />
            Beri Penilaian
          </button>
        )}
        {canCancel && (
          <button type="button" disabled={cancelling} onClick={handleCancel}>
            <XCircle size={13} />
            {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
          </button>
        )}
      </div>

      {order.order_status === "completed" && (
        <footer className="tracking__footer">
          <button type="button" onClick={() => navigate(`/pesanan/beli-lagi?orderId=${order.id}`, { state: { order } })}>
            <ShoppingBasket size={14} />
            Beli Lagi
          </button>
        </footer>
      )}
    </main>
  );
}
