import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Download, Share2, Store } from "lucide-react";
import "./StrukBelanja.css";

const PRODUCTS = [
  { name: "Bayam Hijau Segar", detail: "1 Ikat | 250g • 1x", price: "Rp 3.500" },
  { name: "Daging Sapi Rawon Segar", detail: "Pack 500 gram • 1x", price: "Rp 64.000" },
  { name: "Fillet Ikan Laut Segar", detail: "Pack 300 gram • 1x", price: "Rp 32.000" },
];

function ReceiptRow({ label, value, emphasis = false }) {
  return (
    <div className={`receipt__row${emphasis ? " receipt__row--emphasis" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function StrukBelanja() {
  const navigate = useNavigate();

  return (
    <main className="receipt">
      <header className="receipt__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1>Struk Belanja Digital</h1>
          <p>Order #SP-26012-AGYTLJP • 18 Nov 2026</p>
        </div>
      </header>

      <article className="receipt__paper">
        <div className="receipt__brand">
          <span className="receipt__logo"><Store size={17} /></span>
          <strong>SEMBAKOPLUS</strong>
          <span>PT Generasi Digital Sinergi</span>
          <small>Cilacap Tengah • Telp: 0282-xxxxxx</small>
          <b className="receipt__paid"><Check size={11} /> LUNAS (GoPay)</b>
        </div>

        <div className="receipt__metadata">
          <ReceiptRow label="No. Struk" value="RC-26012-AGYTLJP" />
          <ReceiptRow label="No. Pesanan" value="OP-26012-AGYTLJP" />
          <ReceiptRow label="Waktu Transaksi" value="18 Nov 2026, 08:35 WIB" />
          <ReceiptRow label="Nama Pelanggan" value="Hanif" />
          <ReceiptRow label="Alamat Kirim" value="Jl. Raya No.33, Sidakarya" />
          <ReceiptRow label="Kurir Pengantar" value="Dimas (Kurir Internal)" />
          <ReceiptRow label="Metode Bayar" value="GoPay (Lunas)" />
        </div>

        <section className="receipt__items">
          <header>
            <strong>Daftar Belanjaan</strong>
            <span>3 Produk</span>
          </header>
          {PRODUCTS.map((product) => (
            <div className="receipt__product" key={product.name}>
              <div>
                <strong>{product.name}</strong>
                <small>{product.detail}</small>
              </div>
              <b>{product.price}</b>
            </div>
          ))}
        </section>

        <section className="receipt__totals">
          <strong>Rincian Tagihan</strong>
          <ReceiptRow label="Subtotal Belanja (3 Item)" value="Rp 112.500" />
          <ReceiptRow label="Diskon Produk" value="-Rp 13.000" emphasis />
          <ReceiptRow label="Voucher Diskon" value="Rp 0" />
          <ReceiptRow label="Total Ongkos Kirim" value="Rp 0" />
          <ReceiptRow label="Total Pembayaran" value="Rp 99.500" emphasis />
        </section>

        <footer className="receipt__note">
          <span>••••••••••••••••••••••••••••••••</span>
          <p>SP-2602118-99500-BSMA</p>
          <small>
            Struk digital ini merupakan bukti transaksi yang diterbitkan oleh
            SembakoPlus Indonesia PT Generasi Digital Sinergi.
          </small>
        </footer>
      </article>

      <footer className="receipt__actions">
        <button type="button" className="receipt__action receipt__action--outline">
          <Download size={14} />
          Unduh PDF
        </button>
        <button type="button" className="receipt__action">
          <Share2 size={14} />
          Bagikan Struk
        </button>
      </footer>
    </main>
  );
}
