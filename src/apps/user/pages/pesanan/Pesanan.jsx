import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin } from "lucide-react";
import api from "../../../../shared/services/api";
import BottomNav from "../../components/BottomNav";
import "./Pesanan.css";

const TABS = [
  { id: "process", label: "Dalam Proses" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

const STATUS_LABELS = {
  created: "Menunggu Konfirmasi",
  processing: "Sedang Diproses",
  scheduled_tomorrow: "Dijadwalkan Besok",
  delivering: "Sedang Dikirim",
  arrived: "Pesanan Tiba",
  failed_delivery: "Pengantaran Gagal",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusTone(status) {
  if (status === "completed") return "complete";
  if (status === "cancelled" || status === "failed_delivery") return "cancelled";
  return "shipping";
}

function OrderCard({ order, onAction, cancellingId }) {
  const firstItem = order.items?.[0];
  const extraCount = Math.max(0, (order.items?.length ?? 0) - 1);
  const paymentMethod = String(order.payment?.payment_method || "cod").toUpperCase();
  const isPaid = order.payment_status === "paid" || order.payment?.status === "paid";
  const canCancel = order.order_status === "created" && !isPaid;
  const canPayQris = paymentMethod === "QRIS" && !isPaid && order.order_status !== "cancelled";

  return (
    <article className="orders__card">
      <header className="orders__store">
        <div>
          <strong>SembakoPlus</strong>
          <small>#{order.order_number} • {formatDate(order.placed_at)}</small>
        </div>
        <span className={`orders__status orders__status--${getStatusTone(order.order_status)}`}>
          {STATUS_LABELS[order.order_status] || order.order_status}
        </span>
      </header>

      <div className="orders__product">
        <div className="orders__product-image" aria-hidden="true">🛒</div>
        <div className="orders__product-info">
          <strong>{firstItem ? `${firstItem.product_name} (${firstItem.variant_name || ""})` : "Pesanan SembakoPlus"}</strong>
          <span>{extraCount > 0 ? `+ ${extraCount} produk lainnya` : `${firstItem?.quantity || 1}x kemasan`}</span>
          <small>{order.items?.length || 0} Jenis Barang</small>
        </div>
      </div>

      <footer className="orders__summary">
        <div className="orders__total">
          <span>Total Belanja</span>
          <strong>{rupiah(order.total)}</strong>
          <small>{paymentMethod} • {isPaid ? "Lunas" : "Belum Lunas"}</small>
        </div>
        <div className="orders__actions">
          {canCancel && (
            <button
              type="button"
              className="orders__action orders__action--outline"
              disabled={cancellingId === order.id}
              onClick={() => onAction("cancel", order)}
            >
              {cancellingId === order.id ? "Membatalkan..." : "Batalkan"}
            </button>
          )}
          {canPayQris && (
            <button
              type="button"
              className="orders__action orders__action--primary"
              onClick={() => onAction("pay", order)}
            >
              Bayar QRIS
            </button>
          )}
          {order.order_status === "completed" && (
            <>
              {isPaid && (
                <button
                  type="button"
                  className="orders__action orders__action--outline"
                  onClick={() => onAction("receipt", order)}
                >
                  Lihat Struk
                </button>
              )}
              <button
                type="button"
                className="orders__action orders__action--outline"
                onClick={() => onAction("rate", order)}
              >
                Beri Ulasan
              </button>
              <button
                type="button"
                className="orders__action orders__action--primary"
                onClick={() => onAction("reorder", order)}
              >
                Beli Lagi
              </button>
            </>
          )}
          {order.order_status !== "completed" && (
            <button
              type="button"
              className="orders__action orders__action--primary"
              onClick={() => onAction("track", order)}
            >
              <MapPin size={13} />
              Lacak
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}

export default function Pesanan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("process");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/orders");
      setOrders(data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Riwayat pesanan gagal dimuat. Pastikan Anda sudah masuk.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api.get("/orders")
      .then(({ data }) => {
        if (active) {
          setOrders(data?.data ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Riwayat pesanan gagal dimuat. Pastikan Anda sudah masuk.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const grouped = useMemo(() => ({
    process: orders.filter((order) => !["completed", "cancelled"].includes(order.order_status)),
    completed: orders.filter((order) => order.order_status === "completed"),
    cancelled: orders.filter((order) => order.order_status === "cancelled"),
  }), [orders]);

  async function handleAction(action, order) {
    if (action === "track") {
      navigate(`/pesanan/lacak?orderId=${order.id}`, { state: { order } });
    } else if (action === "pay") {
      navigate(`/pembayaran/qris?orderId=${order.id}`, { state: { order } });
    } else if (action === "receipt") {
      navigate(`/pesanan/struk?orderId=${order.id}`, { state: { order } });
    } else if (action === "rate") {
      navigate(`/pesanan/ulasan?orderId=${order.id}`, { state: { order } });
    } else if (action === "reorder") {
      navigate(`/pesanan/beli-lagi?orderId=${order.id}`, { state: { order } });
    } else if (action === "cancel") {
      try {
        setCancellingId(order.id);
        setError("");
        await api.post(`/orders/${order.id}/cancel`, { reason: "Dibatalkan oleh pelanggan" });
        await loadOrders();
      } catch (err) {
        setError(err.response?.data?.error?.message || "Pesanan gagal dibatalkan.");
      } finally {
        setCancellingId(null);
      }
    }
  }

  const visibleOrders = grouped[activeTab] ?? [];

  return (
    <main className="orders">
      <header className="orders__header">
        <h1>Pesanan Saya</h1>
      </header>

      <nav className="orders__tabs" aria-label="Status pesanan">
        {TABS.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            className={activeTab === id ? "is-active" : ""}
            aria-current={activeTab === id ? "page" : undefined}
            onClick={() => setActiveTab(id)}
          >
            {label} ({grouped[id].length})
          </button>
        ))}
      </nav>

      {error && <p className="orders__empty" role="alert">{error}</p>}
      {loading && <p className="orders__empty">Memuat pesanan...</p>}

      {!loading && !error && !visibleOrders.length && (
        <p className="orders__empty">Belum ada pesanan pada kategori ini.</p>
      )}

      {!loading && visibleOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onAction={handleAction}
          cancellingId={cancellingId}
        />
      ))}

      <BottomNav />
    </main>
  );
}
