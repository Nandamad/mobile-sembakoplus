import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock3, MapPin, PackageCheck, Wallet } from "lucide-react";
import api from "../../../../shared/services/api";
import { getAddresses } from "../profil/addressData";
import { getPrimaryPaymentMethod } from "../profil/paymentMethodData";
import { loadCart } from "./cartData";
import "./Checkout.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function displayAddress(address) {
  return address ? {
    ...address,
    primary: Boolean(address.is_default ?? address.primary),
    contact: address.contact ?? `${address.recipient_name} (${address.phone})`,
  } : null;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [showAddresses, setShowAddresses] = useState(false);
  const [paymentMethod] = useState(getPrimaryPaymentMethod);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([loadCart(), getAddresses(), api.get("/delivery-schedules/available")])
      .then(([cartItems, userAddresses, scheduleResponse]) => {
        if (!active) return;
        const nextAddresses = userAddresses.map(displayAddress);
        const nextSchedules = scheduleResponse.data?.data ?? [];
        setItems(cartItems);
        setAddresses(nextAddresses);
        setAddress(nextAddresses.find((item) => item.primary) ?? nextAddresses[0] ?? null);
        setSchedules(nextSchedules);
        setSchedule(nextSchedules[0] ?? null);
      })
      .catch((error) => {
        if (active) setMessage(error.response?.data?.error?.message || "Data checkout gagal dimuat.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!address?.id || !schedule?.id) return undefined;
    let active = true;
    api.post("/checkout/preview", {
      address_id: address.id,
      delivery_schedule_id: schedule.id,
    })
      .then(({ data }) => active && setPreview(data.data))
      .catch((error) => active && setMessage(error.response?.data?.error?.message || "Perhitungan checkout gagal."));
    return () => { active = false; };
  }, [address, schedule]);

  async function handleCheckout() {
    if (!items.length) return setMessage("Keranjang kosong. Tambahkan produk sebelum checkout.");
    if (!address) return setMessage("Tambahkan alamat pengiriman terlebih dahulu.");
    if (!schedule) return setMessage("Pilih jadwal pengiriman terlebih dahulu.");
    try {
      setSubmitting(true);
      setMessage("");
      const { data } = await api.post("/checkout", {
        address_id: address.id,
        delivery_schedule_id: schedule.id,
        payment_method: paymentMethod,
      });
      const order = data.data;
      navigate(paymentMethod === "qris" ? "/pembayaran/qris" : "/pesanan", {
        state: { order, orderReference: order.order_number },
      });
    } catch (error) {
      setMessage(error.response?.data?.error?.message || "Pesanan gagal dibuat.");
    } finally {
      setSubmitting(false);
    }
  }

  const paymentLabel = paymentMethod === "cod" ? "COD (Bayar Tunai di Tempat)" : "QRIS (Instan & Semua E-Wallet)";
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <main className="checkout">
      <header className="checkout__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}><ChevronLeft size={18} /></button>
        <h1>Checkout</h1>
      </header>

      {loading && <p className="checkout__message">Memuat data checkout...</p>}
      {!loading && address && (
        <section className="checkout__section checkout__address">
          <div className="checkout__address-icon"><MapPin size={13} /></div>
          <div className="checkout__address-copy">
            <strong>{address.label} {address.primary && <i>Utama</i>}</strong>
            <p>{address.contact}</p>
            <small>{address.address}</small>
          </div>
          <button type="button" onClick={() => setShowAddresses((value) => !value)}>Ganti</button>
          {showAddresses && <div className="checkout__address-options">
            {addresses.map((option) => (
              <button type="button" key={option.id} className={option.id === address.id ? "is-selected" : ""} onClick={() => { setAddress(option); setShowAddresses(false); }}>
                <strong>{option.label}</strong><span>{option.address}</span>
              </button>
            ))}
            <button type="button" className="checkout__add-address" onClick={() => navigate("/profil/alamat/tambah")}>+ Tambah Alamat Baru</button>
          </div>}
        </section>
      )}
      {!loading && !address && <button type="button" className="checkout__section checkout__add-address" onClick={() => navigate("/profil/alamat/tambah")}>+ Tambah alamat pengiriman</button>}

      <section className="checkout__section checkout__products">
        <header><strong>Daftar Pesanan ({totalQuantity} Barang)</strong><span>SembakoPlus Fresh</span></header>
        {items.length ? items.map((item) => (
          <article className="checkout__product" key={item.id}>
            <span className="checkout__product-image">{item.image ? <img src={item.image} alt="" /> : <span aria-hidden="true">{item.icon || "🛒"}</span>}</span>
            <div><strong>{item.name}</strong><small>{item.unit} • {item.quantity}x</small></div>
            <b>{rupiah(item.price * item.quantity)}</b>
          </article>
        )) : <p className="checkout__no-items">Tidak ada produk di keranjang.</p>}
      </section>

      <section className="checkout__section checkout__delivery">
        <header><strong><Clock3 size={12} /> Waktu Pengiriman</strong><span>{preview ? rupiah(preview.shipping_cost) : "-"}</span></header>
        <div className="checkout__slots">
          {schedules.map((option) => (
            <button type="button" key={option.id} className={schedule?.id === option.id ? "is-selected" : ""} aria-pressed={schedule?.id === option.id} onClick={() => setSchedule(option)}>
              <i /><span><strong>{option.delivery_date}</strong><small>{option.start_time} - {option.end_time} WIB</small></span>
            </button>
          ))}
        </div>
        {!schedules.length && <p>Jadwal pengiriman belum tersedia.</p>}
      </section>

      <button type="button" className="checkout__section checkout__payment" onClick={() => navigate("/profil/metode-pembayaran")}>
        <span><Wallet size={13} /> Metode Pembayaran</span><strong>{paymentLabel} <ChevronRight size={11} /></strong>
      </button>

      <section className="checkout__section checkout__bill">
        <h2>Rincian Tagihan</h2>
        <div><span>Subtotal Belanja</span><strong>{rupiah(preview?.subtotal)}</strong></div>
        <div><span>Diskon Produk</span><strong className="checkout__discount">-{rupiah(preview?.product_discount_total)}</strong></div>
        <div><span>Diskon Voucher</span><strong className="checkout__discount">-{rupiah(preview?.voucher_discount_total)}</strong></div>
        <div><span>Total Ongkir</span><strong>{rupiah(preview?.shipping_cost)}</strong></div>
        <div className="checkout__bill-total"><span>Total Tagihan</span><strong>{rupiah(preview?.total)}</strong></div>
      </section>

      {message && <p className="checkout__message" role="alert">{message}</p>}
      <footer className="checkout__footer">
        <div><span>Total Pembayaran</span><strong>{rupiah(preview?.total)}</strong></div>
        <button type="button" disabled={submitting || loading} onClick={handleCheckout}>{submitting ? "Memproses..." : paymentMethod === "cod" ? "Buat Pesanan (COD)" : "Buat Pesanan (QRIS)"}<PackageCheck size={12} /></button>
      </footer>
    </main>
  );
}
