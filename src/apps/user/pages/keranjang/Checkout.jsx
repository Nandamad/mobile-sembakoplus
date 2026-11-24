import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock3, MapPin, PackageCheck, Wallet } from "lucide-react";
import { getAddresses } from "../profil/addressData";
import { getPrimaryPaymentMethod } from "../profil/paymentMethodData";
import { CART_UPDATED_EVENT, getCartItems } from "./cartData";
import "./Checkout.css";

const rupiah = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;

export default function Checkout() {
  const navigate = useNavigate();
  const { state: navigationState } = useLocation();
  const checkoutItems = Array.isArray(navigationState?.checkoutItems) ? navigationState.checkoutItems : null;
  const [items, setItems] = useState(() => checkoutItems ?? getCartItems().filter((item) => item.selected));
  const [addresses] = useState(getAddresses);
  const [address, setAddress] = useState(() => {
    const options = getAddresses();
    return options.find((item) => item.primary) ?? options[0] ?? null;
  });
  const [showAddresses, setShowAddresses] = useState(false);
  const [delivery, setDelivery] = useState("pagi");
  const [paymentMethod] = useState(getPrimaryPaymentMethod);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (checkoutItems) return undefined;
    const updateCart = () => setItems(getCartItems().filter((item) => item.selected));
    window.addEventListener(CART_UPDATED_EVENT, updateCart);
    return () => window.removeEventListener(CART_UPDATED_EVENT, updateCart);
  }, [checkoutItems]);

  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const discount = originalTotal - itemTotal;
  const paymentLabel = paymentMethod === "cod" ? "COD (Bayar Tunai di Tempat)" : "QRIS (Instan & Semua E-Wallet)";

  function handlePayment() {
    if (!items.length) {
      setMessage("Keranjang kosong. Tambahkan produk sebelum melanjutkan.");
      return;
    }
    if (!address) {
      setMessage("Tambahkan alamat pengiriman terlebih dahulu.");
      return;
    }
    if (paymentMethod === "cod") {
      setMessage("Pemesanan COD belum terhubung ke layanan pemesanan. Pesanan belum dibuat.");
      return;
    }
    navigate("/pembayaran/qris", {
      state: { items, address, delivery, paymentMethod },
    });
  }

  return (
    <main className="checkout">
      <header className="checkout__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
        </button>
        <h1>Checkout</h1>
      </header>

      {address && (
        <section className="checkout__section checkout__address">
          <div className="checkout__address-icon"><MapPin size={13} /></div>
          <div className="checkout__address-copy">
            <strong>{address.label} <i>Utama</i></strong>
            <p>{address.contact}</p>
            <small>{address.address}</small>
          </div>
          <button type="button" onClick={() => setShowAddresses((value) => !value)}>
            Ganti
          </button>
          {showAddresses && (
            <div className="checkout__address-options">
              {addresses.map((option) => (
                <button
                  type="button"
                  key={option.label}
                  className={option.label === address.label ? "is-selected" : ""}
                  onClick={() => {
                    setAddress(option);
                    setShowAddresses(false);
                  }}
                >
                  <strong>{option.label}</strong>
                  <span>{option.address}</span>
                </button>
              ))}
              <button type="button" className="checkout__add-address" onClick={() => navigate("/profil/alamat/tambah")}>
                + Tambah Alamat Baru
              </button>
            </div>
          )}
        </section>
      )}

      <section className="checkout__section checkout__products">
        <header>
          <strong>Daftar Pesanan ({items.reduce((sum, item) => sum + item.quantity, 0)} Barang)</strong>
          <span>SembakoPlus Fresh</span>
        </header>
        {items.length ? items.map((item) => (
          <article className="checkout__product" key={item.id}>
            <span className="checkout__product-image">
              {item.image ? <img src={item.image} alt="" /> : <span aria-hidden="true">{item.icon || "🛒"}</span>}
            </span>
            <div>
              <strong>{item.name}</strong>
              <small>Pack {item.unit} • {item.quantity}x</small>
            </div>
            <b>{rupiah(item.price * item.quantity)}</b>
          </article>
        )) : (
          <p className="checkout__no-items">Tidak ada produk yang dipilih.</p>
        )}
      </section>

      <section className="checkout__section checkout__delivery">
        <header>
          <strong><Clock3 size={12} /> Waktu Pengiriman</strong>
          <span>Ongkir: Rp 0</span>
        </header>
        <div className="checkout__slots">
          <button
            type="button"
            className={delivery === "pagi" ? "is-selected" : ""}
            aria-pressed={delivery === "pagi"}
            onClick={() => setDelivery("pagi")}
          >
            <i />
            <span><strong>Pagi</strong><small>07:00 - 10:00 WIB</small></span>
          </button>
          <button
            type="button"
            className={delivery === "siang" ? "is-selected" : ""}
            aria-pressed={delivery === "siang"}
            onClick={() => setDelivery("siang")}
          >
            <i />
            <span><strong>Siang</strong><small>10:00 - 14:00 WIB</small></span>
          </button>
        </div>
        <p>Perbelanjaan di atas jam 17:00 WIB akan dikirim besok pagi.</p>
      </section>

      <button
        type="button"
        className="checkout__section checkout__payment"
        onClick={() => navigate("/profil/metode-pembayaran")}
      >
        <span><Wallet size={13} /> Metode Pembayaran</span>
        <strong>{paymentLabel} <ChevronRight size={11} /></strong>
      </button>

      <section className="checkout__section checkout__bill">
        <h2>Rincian Tagihan</h2>
        <div><span>Subtotal Belanja</span><strong>{rupiah(originalTotal)}</strong></div>
        <div><span>Diskon Produk</span><strong className="checkout__discount">-{rupiah(discount)}</strong></div>
        <div><span>Voucher Belanja</span><strong>Rp 0</strong></div>
        <div><span>Total Ongkir</span><strong className="checkout__free">GRATIS</strong></div>
        <div className="checkout__bill-total"><span>Total Tagihan</span><strong>{rupiah(itemTotal)}</strong></div>
      </section>

      {message && <p className="checkout__message" role="status">{message}</p>}

      <footer className="checkout__footer">
        <div><span>Total Pembayaran</span><strong>{rupiah(itemTotal)}</strong></div>
        <button type="button" onClick={handlePayment}>
          {paymentMethod === "cod" ? "Buat Pesanan (COD)" : "Bayar Sekarang (QRIS)"}
          <PackageCheck size={12} />
        </button>
      </footer>
    </main>
  );
}
