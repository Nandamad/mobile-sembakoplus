import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sun,
} from "lucide-react";
import "./BeliLagi.css";

const PRODUCTS = [
  {
    image: "🥬",
    name: "Bayam Hijau Segar",
    detail: "1 Ikat | 250g • 1x",
    price: "Rp 3.500",
    original: "Rp 4.500",
  },
  {
    image: "🥩",
    name: "Daging Sapi Rawon Segar",
    detail: "Pack 500 gram • 1x",
    price: "Rp 64.000",
    original: "Rp 70.000",
  },
  {
    image: "🐟",
    name: "Fillet Ikan Laut Segar",
    detail: "Pack 300 gram • 1x",
    price: "Rp 32.000",
    original: "Rp 38.000",
  },
];

export default function BeliLagi() {
  const navigate = useNavigate();
  const [deliveryTime, setDeliveryTime] = useState("Pagi");

  return (
    <main className="reorder">
      <header className="reorder__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h1>Beli Lagi</h1>
      </header>

      <section className="reorder__panel reorder__address">
        <span className="reorder__address-icon"><MapPin size={18} /></span>
        <div className="reorder__address-copy">
          <div className="reorder__address-title">
            <strong>Rumah Hanif</strong>
            <span>Utama</span>
          </div>
          <p>Jl. Raya No. 33, Sidakaya, Cilacap Selatan</p>
        </div>
        <button type="button" className="reorder__change">Ganti</button>
      </section>

      <section className="reorder__panel reorder__items">
        <header className="reorder__section-head">
          <h2>Daftar Pesanan (3 Barang)</h2>
          <span>SembakoPlus Fresh</span>
        </header>
        {PRODUCTS.map((product) => (
          <div className="reorder__product" key={product.name}>
            <span className="reorder__product-image" aria-hidden="true">
              {product.image}
            </span>
            <div className="reorder__product-copy">
              <strong>{product.name}</strong>
              <small>{product.detail}</small>
            </div>
            <div className="reorder__product-price">
              <strong>{product.price}</strong>
              <s>{product.original}</s>
            </div>
          </div>
        ))}
      </section>

      <section className="reorder__panel reorder__delivery">
        <header className="reorder__section-head">
          <h2>Waktu Pengiriman</h2>
          <span className="reorder__free">Ongkir Rp 0</span>
        </header>
        <div className="reorder__slots">
          <button
            type="button"
            className={deliveryTime === "Pagi" ? "is-selected" : ""}
            onClick={() => setDeliveryTime("Pagi")}
          >
            <Sun size={15} />
            <span><strong>Pagi</strong><small>06.00 - 11.00 WIB</small></span>
          </button>
          <button
            type="button"
            className={deliveryTime === "Siang / Sore" ? "is-selected" : ""}
            onClick={() => setDeliveryTime("Siang / Sore")}
          >
            <Clock size={15} />
            <span><strong>Siang / Sore</strong><small>12.00 - 17.00 WIB</small></span>
          </button>
        </div>
        <p className="reorder__delivery-note">
          * Pembelian di atas jam 17.00 WIB akan dikirim besok pagi
        </p>
      </section>

      <button type="button" className="reorder__panel reorder__payment">
        <strong>Metode Pembayaran</strong>
        <span>COD (Bayar di Tempat) <ChevronRight size={14} /></span>
      </button>

      <section className="reorder__panel reorder__bill">
        <h2>Rincian Tagihan</h2>
        <div><span>Subtotal Belanja</span><strong>Rp 112.500</strong></div>
        <div><span>Diskon Produk</span><strong className="is-discount">-Rp 13.000</strong></div>
        <div><span>Voucher Belanja</span><strong>Rp 0</strong></div>
        <div>
          <span>Total Ongkos Kirim</span>
          <strong><s>Rp 8.000</s> <b>GRATIS</b></strong>
        </div>
        <div className="reorder__bill-total">
          <span>Total Tagihan</span><strong>Rp 99.500</strong>
        </div>
      </section>

      <footer className="reorder__paybar">
        <div>
          <span>Total Pembayaran</span>
          <strong>Rp 99.500</strong>
        </div>
        <button type="button">Beli Lagi</button>
      </footer>
    </main>
  );
}
