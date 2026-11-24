import { useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  FileText,
  Share2,
  ShoppingBasket,
  UserRound,
  Star,
} from "lucide-react";
import "./LacakPesanan.css";

const TIMELINE = [
  { title: "Pesanan Dibuat", time: "09:10 WIB", done: true },
  { title: "Pesanan Telah Dibayar", time: "09:12 WIB", done: true },
  { title: "Pesanan Dikonfirmasi", time: "09:15 WIB", done: true },
  { title: "Pesanan Disiapkan", time: "09:20 WIB", done: true },
  {
    title: "Pesanan Sedang Diantar",
    time: "09:35 WIB",
    current: true,
  },
  { title: "Pesanan Sampai", time: "", pending: true },
  { title: "Pesanan Selesai", time: "", pending: true },
];

const PRODUCTS = [
  { icon: "🥬", name: "Bayam Hijau", unit: "1 Ikat (250g)", quantity: "1x", price: "Rp 3.500", originalPrice: "Rp 4.500" },
  { icon: "🥩", name: "Daging Sapi Rawon", unit: "Pack 500 gram", quantity: "1x", price: "Rp 64.000", originalPrice: "Rp 70.000" },
  { icon: "🐟", name: "Fillet Ikan Laut", unit: "Pack 300 gram", quantity: "1x", price: "Rp 32.000", originalPrice: "Rp 38.000" },
];

const DEMO_ORDER = {
  id: "#SP-26012-AGYTLJP",
  date: "18 Nov 2026",
  total: "Rp 99.500",
  payment: "QRIS",
};

function TrackingTimeline() {
  return (
    <section className="tracking__panel tracking__journey">
      <h2>Perjalanan Pengantaran Pesanan</h2>
      <div className="tracking__events">
        {TIMELINE.map((event) => (
          <div
            className={[
              "tracking__event",
              event.done ? "is-done" : "",
              event.current ? "is-current" : "",
              event.pending ? "is-pending" : "",
            ].filter(Boolean).join(" ")}
            key={event.title}
          >
            <span className="tracking__dot">
              {event.done ? <Check size={9} strokeWidth={3} /> : null}
            </span>
            <div className="tracking__event-copy">
              <strong>{event.title}</strong>
              {event.detail && <small>{event.detail}</small>}
            </div>
            <time>{event.time}</time>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrderInformation({ order }) {
  const payment = order?.payment ?? "QRIS";
  const paymentLabel = payment.toLowerCase().includes("cod")
    ? "COD"
    : payment;

  return (
    <section className="tracking__panel tracking__information">
      <header className="tracking__courier">
        <span><UserRound size={17} /></span>
        <strong>Kurir Internal Toko</strong>
        <button type="button" aria-label="Hubungi kurir">
          <Share2 size={14} />
        </button>
      </header>
      <div className="tracking__metadata">
        <div><span>No. Pesanan</span><strong>{order?.id ?? "#SP-26012-AGYTLJP"}</strong></div>
        <div><span>Metode Pembayaran</span><strong>{paymentLabel}</strong></div>
        <div><span>Jumlah Pengiriman</span><strong>1 Pengiriman</strong></div>
        <div className="tracking__subhead">Toko Pengirim</div>
        <div className="tracking__full-row"><strong>PT Generasi Digital Sinergi</strong></div>
        <div className="tracking__full-row"><span>Alamat Pengiriman</span></div>
        <p>Hanif S. (0812-3456-7890)<br />Jl. Jend. Sudirman No. 42, RT 03 / RW 05, Kel. Sidakaya<br />Cilacap Selatan, Kab. Cilacap, Jawa Tengah 53211</p>
      </div>
    </section>
  );
}

function ProductList() {
  return (
    <section className="tracking__panel tracking__products">
      <h2>Daftar Pesanan</h2>
      {PRODUCTS.map((product) => (
        <div className="tracking__product" key={product.name}>
          <span className="tracking__product-image" aria-hidden="true">{product.icon}</span>
          <div className="tracking__product-copy">
            <strong>{product.name}</strong>
            <small>{product.unit}</small>
          </div>
          <span className="tracking__quantity">{product.quantity}</span>
          <span className="tracking__product-prices">
            <strong className="tracking__price">{product.price}</strong>
            <s>{product.originalPrice}</s>
          </span>
        </div>
      ))}
    </section>
  );
}

function PaymentSummary({ order }) {
  const total = order?.total ?? "Rp 99.500";

  return (
    <section className="tracking__panel tracking__bill">
      <h2>Rincian Tagihan</h2>
      <div><span>Subtotal Belanja</span><strong>Rp 112.500</strong></div>
      <div><span>Diskon Belanja</span><strong className="is-discount">-Rp 13.000</strong></div>
      <div><span>Voucher Belanja</span><strong>Rp 0</strong></div>
      <div><span>Total Ongkir</span><strong>Rp 0</strong></div>
      <div className="tracking__bill-total"><span>Total Pembayaran</span><strong>{total}</strong></div>
    </section>
  );
}

export default function LacakPesanan() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order ?? DEMO_ORDER;

  return (
    <main className="tracking">
      <header className="tracking__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <div>
          <h1>Lacak Pesanan</h1>
          <p>Order {order.id} • {order.date}</p>
        </div>
      </header>

      <TrackingTimeline />
      <OrderInformation order={order} />
      <ProductList />
      <PaymentSummary order={order} />

      <div className="tracking__receipt-actions">
        <button type="button" onClick={() => navigate("/pesanan/struk", { state: { order } })}>
          <FileText size={13} />
          Lihat Struk
        </button>
        <button
          type="button"
          onClick={() => navigate("/pesanan/ulasan", {
            state: {
              order: {
                ...order,
                product: PRODUCTS.map((product) => product.name).join(", "),
                image: PRODUCTS[0].icon,
              },
            },
          })}
        >
          <Star size={13} />
          Beri Penilaian
        </button>
      </div>

      <footer className="tracking__footer">
        <button type="button" onClick={() => navigate("/pesanan/beli-lagi", { state: { order } })}>
          <ShoppingBasket size={14} />
          Beli Lagi
        </button>
      </footer>
    </main>
  );
}
