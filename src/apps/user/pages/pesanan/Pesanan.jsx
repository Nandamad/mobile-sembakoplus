import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "./Pesanan.css";

const TABS = [
  { label: "Dalam Proses", count: 1 },
  { label: "Selesai", count: 2 },
  { label: "Dibatalkan", count: 1 },
];

const ORDERS = {
  "Dalam Proses": [
    {
      id: "#SP-26012-AGT",
      date: "Hari ini, 09:15 WIB",
      status: "Sedang Dikirim",
      statusTone: "shipping",
      image: "🥬",
      product: "Bayam Hijau Segar (1 Ikat)",
      more: "+ 2 produk lainnya (Daging, Ikan)",
      itemCount: "3 Barang Belanjaan",
      total: "Rp 99.500",
      payment: "Bayar di Tempat (COD)",
      actions: [{ label: "Lacak Kurir", style: "primary", icon: true }],
    },
  ],
  Selesai: [
    {
      id: "#SP-260205-SPK",
      date: "15 Nov 2026, 14:30 WIB",
      status: "Selesai",
      statusTone: "complete",
      image: "🍗",
      product: "Paha Ayam Broiler (500g)",
      more: "+ 1 produk lainnya (Bimoli 2L)",
      itemCount: "2 Barang Belanjaan",
      total: "Rp 54.000",
      payment: "Bayar di Tempat (COD)",
      actions: [
        { label: "Lihat Struk", style: "outline" },
        { label: "Beli Lagi", style: "primary" },
      ],
    },
    {
      id: "#SP-260101-SPK",
      date: "20 Nov 2026, 11:20 WIB",
      status: "Selesai",
      statusTone: "complete",
      image: "🥚",
      product: "Telur Tray 30 Btr Segar",
      more: "+ 2 produk lainnya (Beras 5kg, Gula 1kg)",
      itemCount: "3 Barang Belanjaan",
      total: "Rp 128.500",
      payment: "Transfer Bank BRI",
      actions: [
        { label: "Beri Ulasan", style: "outline" },
        { label: "Beli Lagi", style: "primary" },
      ],
    },
  ],
  Dibatalkan: [
    {
      id: "#SP-260208-CNC",
      date: "28 Sep 2026, 08:15 WIB",
      status: "Dibatalkan",
      statusTone: "cancelled",
      image: "🥩",
      product: "Daging Sapi Rawon Segar (500g)",
      more: "+ 1 produk lainnya (Lada Merah 250g)",
      itemCount: "2 Barang Belanjaan",
      total: "Rp 78.500",
      payment: "Refund Berhasil (Dana kembali)",
      actions: [
        { label: "Rincian Batal", style: "outline" },
        { label: "Pesan Ulang", style: "primary" },
      ],
    },
  ],
};

function OrderCard({ order, onAction }) {
  return (
    <article className="orders__card">
      <header className="orders__store">
        <div>
          <strong>PT Generasi Digital Sinergi</strong>
          <small>ID {order.id} • {order.date}</small>
        </div>
        <span className={`orders__status orders__status--${order.statusTone}`}>
          {order.status}
        </span>
      </header>

      <div className="orders__product">
        <div className="orders__product-image" aria-hidden="true">{order.image}</div>
        <div className="orders__product-info">
          <strong>{order.product}</strong>
          <span>{order.more}</span>
          <small>{order.itemCount}</small>
        </div>
      </div>

      <footer className="orders__summary">
        <div className="orders__total">
          <span>Total Belanja</span>
          <strong>{order.total}</strong>
          <small>{order.payment}</small>
        </div>
        <div className="orders__actions">
          {order.actions.map((action) => (
            <button
              type="button"
              className={`orders__action orders__action--${action.style}`}
              key={action.label}
              onClick={() => onAction(action.label, order)}
            >
              {action.icon && <MapPin size={13} />}
              {action.label}
              {action.icon && <ChevronRight size={13} />}
            </button>
          ))}
        </div>
      </footer>
    </article>
  );
}

export default function Pesanan() {
  const [activeTab, setActiveTab] = useState(TABS[0].label);
  const orders = ORDERS[activeTab];
  const navigate = useNavigate();

  function openAction(action, order) {
    if (action === "Beri Ulasan") {
      navigate("/pesanan/ulasan", { state: { order } });
      return;
    }
    const destinations = {
      "Lacak Kurir": "/pesanan/lacak",
      "Lihat Struk": "/pesanan/struk",
      "Beli Lagi": "/pesanan/beli-lagi",
      "Pesan Ulang": "/pesanan/beli-lagi",
    };
    const path = destinations[action];
    if (!path) return;
    navigate(path, { state: { order } });
  }

  return (
    <main className="orders">
      <header className="orders__header">
        <h1>Pesanan Saya</h1>
      </header>

      <nav className="orders__tabs" aria-label="Status pesanan">
        {TABS.map(({ label, count }) => (
          <button
            type="button"
            key={label}
            className={activeTab === label ? "is-active" : ""}
            aria-current={activeTab === label ? "page" : undefined}
            onClick={() => setActiveTab(label)}
          >
            {label} ({count})
          </button>
        ))}
      </nav>

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onAction={openAction} />
      ))}

      <BottomNav />
    </main>
  );
}
