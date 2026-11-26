import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock3, Coins, MapPin, PackageCheck, Ticket, Wallet } from "lucide-react";
import api from "../../../../shared/services/api";
import { getAddresses } from "../profil/addressData";
import { getPrimaryPaymentMethod } from "../profil/paymentMethodData";
import { loadCart } from "./cartData";
import "./Checkout.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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
  const [paymentMethod, setPaymentMethod] = useState(getPrimaryPaymentMethod);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState({ code: "", id: null });
  const [myVouchers, setMyVouchers] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  const canPreview = Boolean(address?.id && schedule?.id && items.length);
  const activePreview = canPreview ? preview : null;

  function refreshIdempotencyKey() {
    setIdempotencyKey(createIdempotencyKey());
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      loadCart(),
      getAddresses(),
      api.get("/delivery-schedules/available"),
      api.get("/vouchers").catch(() => ({ data: { data: { my_vouchers: [] } } })),
      api.get("/wallet").catch(() => ({ data: { data: null } })),
    ])
      .then(([cartItems, userAddresses, scheduleResponse, voucherResponse, walletResponse]) => {
        if (!active) return;
        const nextAddresses = userAddresses.map(displayAddress);
        const nextSchedules = scheduleResponse.data?.data ?? [];
        const availableVouchers = (voucherResponse.data?.data?.my_vouchers ?? [])
          .filter((item) => item.status === "available" && item.voucher);
        setItems(cartItems);
        setAddresses(nextAddresses);
        setAddress(nextAddresses.find((item) => item.primary) ?? nextAddresses[0] ?? null);
        setSchedules(nextSchedules);
        setSchedule(nextSchedules[0] ?? null);
        setMyVouchers(availableVouchers);
        setWallet(walletResponse.data?.data ?? null);
      })
      .catch((error) => {
        if (active) setMessage(error.response?.data?.error?.message || "Data checkout gagal dimuat.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!canPreview) return undefined;
    let active = true;
    api.post("/checkout/preview", {
      address_id: address.id,
      delivery_schedule_id: schedule.id,
      ...(appliedVoucher.code ? { voucher_code: appliedVoucher.code } : {}),
      ...(appliedVoucher.id ? { voucher_id: appliedVoucher.id } : {}),
      coins_to_redeem: useCoins ? Number(coinsToRedeem || 0) : 0,
    })
      .then(({ data }) => {
        if (active) {
          setPreview(data.data);
          setPreviewError("");
        }
      })
      .catch((error) => {
        if (active) {
          setPreview(null);
          setPreviewError(error.response?.data?.error?.message || "Perhitungan checkout gagal.");
        }
      });
    return () => { active = false; };
  }, [canPreview, address?.id, schedule?.id, appliedVoucher.code, appliedVoucher.id, useCoins, coinsToRedeem]);

  function applyVoucherCode(event) {
    event.preventDefault();
    const trimmed = voucherCodeInput.trim().toUpperCase();
    setMessage("");
    setAppliedVoucher({ code: trimmed, id: null });
    refreshIdempotencyKey();
  }

  function selectCustomerVoucher(voucher) {
    setMessage("");
    refreshIdempotencyKey();
    if (appliedVoucher.id === voucher.id) {
      setAppliedVoucher({ code: "", id: null });
      setVoucherCodeInput("");
      return;
    }
    setAppliedVoucher({ code: voucher.code || "", id: voucher.id });
    setVoucherCodeInput(voucher.code || voucher.name);
  }

  function toggleCoins(checked) {
    setUseCoins(checked);
    refreshIdempotencyKey();
    if (!checked) {
      setCoinsToRedeem(0);
      return;
    }
    const maxBalance = Number(wallet?.balance ?? 0);
    setCoinsToRedeem(maxBalance > 0 ? Math.min(maxBalance, Number(wallet?.balance ?? 0)) : 0);
  }

  async function handleCheckout() {
    if (!items.length) return setMessage("Keranjang kosong. Tambahkan produk sebelum checkout.");
    if (!address) return setMessage("Tambahkan alamat pengiriman terlebih dahulu.");
    if (!schedule) return setMessage("Pilih jadwal pengiriman terlebih dahulu.");
    if (previewError) return setMessage(previewError);

    try {
      setSubmitting(true);
      setMessage("");
      const { data } = await api.post("/checkout", {
        address_id: address.id,
        delivery_schedule_id: schedule.id,
        payment_method: paymentMethod,
        ...(appliedVoucher.code ? { voucher_code: appliedVoucher.code } : {}),
        ...(appliedVoucher.id ? { voucher_id: appliedVoucher.id } : {}),
        coins_to_redeem: useCoins ? Number(coinsToRedeem || 0) : 0,
      }, {
        headers: { "Idempotency-Key": idempotencyKey },
      });
      const order = data.data;
      await loadCart().catch(() => {});
      if (paymentMethod === "qris") {
        navigate(`/pembayaran/qris?orderId=${order.id}`, {
          state: { order, orderReference: order.order_number },
        });
      } else {
        navigate(`/pesanan/lacak?orderId=${order.id}`, {
          state: { order, justCreated: true },
        });
      }
    } catch (error) {
      setMessage(error.response?.data?.error?.message || "Pesanan gagal dibuat.");
      if (error.response?.status === 409) {
        refreshIdempotencyKey();
      }
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
              <button type="button" key={option.id} className={option.id === address.id ? "is-selected" : ""} onClick={() => { setAddress(option); setShowAddresses(false); refreshIdempotencyKey(); }}>
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
        <header><strong><Clock3 size={12} /> Jadwal Pengiriman</strong><span>{activePreview ? rupiah(activePreview.shipping_cost) : "-"}</span></header>
        <div className="checkout__slots">
          {schedules.map((option) => (
            <button type="button" key={option.id} className={schedule?.id === option.id ? "is-selected" : ""} aria-pressed={schedule?.id === option.id} onClick={() => { setSchedule(option); refreshIdempotencyKey(); }}>
              <i /><span><strong>{option.delivery_date}</strong><small>{option.start_time} - {option.end_time} WIB</small></span>
            </button>
          ))}
        </div>
        {!schedules.length && <p>Jadwal pengiriman belum tersedia.</p>}
      </section>

      <section className="checkout__section checkout__promo">
        <header><strong><Ticket size={12} /> Voucher &amp; Koin</strong></header>
        <form className="checkout__voucher-form" onSubmit={applyVoucherCode}>
          <input
            type="text"
            value={voucherCodeInput}
            placeholder="Masukkan kode voucher"
            onChange={(event) => setVoucherCodeInput(event.target.value)}
          />
          <button type="submit">Terapkan</button>
          {(appliedVoucher.code || appliedVoucher.id) && (
            <button type="button" onClick={() => { setAppliedVoucher({ code: "", id: null }); setVoucherCodeInput(""); refreshIdempotencyKey(); }}>
              Hapus
            </button>
          )}
        </form>
        {myVouchers.length > 0 && (
          <div className="checkout__voucher-chips">
            {myVouchers.map(({ voucher }) => (
              <button
                type="button"
                key={voucher.id}
                className={appliedVoucher.id === voucher.id ? "is-selected" : ""}
                onClick={() => selectCustomerVoucher(voucher)}
              >
                {voucher.name}
              </button>
            ))}
          </div>
        )}
        {wallet && Number(wallet.balance) > 0 && wallet.is_enabled && (
          <div className="checkout__coins-row">
            <label>
              <input
                type="checkbox"
                checked={useCoins}
                onChange={(event) => toggleCoins(event.target.checked)}
              />
              <span><Coins size={12} /> Tukar Koin (Saldo: {wallet.balance} • 1 koin = {rupiah(wallet.coin_value)})</span>
            </label>
            {useCoins && (
              <input
                type="number"
                min={wallet.minimum_redemption_coins || 1}
                max={wallet.balance}
                value={coinsToRedeem}
                onChange={(event) => {
                  setCoinsToRedeem(Math.max(0, Math.min(wallet.balance, Number(event.target.value) || 0)));
                  refreshIdempotencyKey();
                }}
              />
            )}
          </div>
        )}
      </section>

      <section className="checkout__section checkout__payment-methods">
        <div className="checkout__payment-head">
          <span><Wallet size={13} /> Metode Pembayaran</span>
          <button type="button" onClick={() => navigate("/profil/metode-pembayaran")}>
            {paymentLabel} <ChevronRight size={11} />
          </button>
        </div>
        <div className="checkout__payment-toggle">
          <button type="button" className={paymentMethod === "qris" ? "is-selected" : ""} onClick={() => { setPaymentMethod("qris"); refreshIdempotencyKey(); }}>QRIS</button>
          <button type="button" className={paymentMethod === "cod" ? "is-selected" : ""} onClick={() => { setPaymentMethod("cod"); refreshIdempotencyKey(); }}>COD Tunai</button>
        </div>
      </section>

      <section className="checkout__section checkout__bill">
        <h2>Rincian Tagihan</h2>
        <div><span>Subtotal Belanja</span><strong>{rupiah(activePreview?.subtotal)}</strong></div>
        <div><span>Diskon Produk</span><strong className="checkout__discount">-{rupiah(activePreview?.product_discount_total)}</strong></div>
        <div><span>Diskon Voucher</span><strong className="checkout__discount">-{rupiah(activePreview?.voucher_discount_total)}</strong></div>
        <div><span>Potongan Koin</span><strong className="checkout__discount">-{rupiah(activePreview?.coin_discount_total)}</strong></div>
        <div><span>Ongkos Kirim</span><strong>{rupiah(activePreview?.shipping_cost)}</strong></div>
        <div><span>Subsidi Ongkir</span><strong className="checkout__free">-{rupiah(activePreview?.shipping_discount)}</strong></div>
        <div className="checkout__bill-total"><span>Total Tagihan</span><strong>{rupiah(activePreview?.total)}</strong></div>
      </section>

      {(previewError || message) && <p className="checkout__message" role="alert">{previewError || message}</p>}
      <footer className="checkout__footer">
        <div><span>Total Pembayaran</span><strong>{rupiah(activePreview?.total)}</strong></div>
        <button type="button" disabled={submitting || loading || Boolean(previewError)} onClick={handleCheckout}>
          {submitting ? "Memproses..." : paymentMethod === "cod" ? "Buat Pesanan (COD)" : "Buat Pesanan (QRIS)"}
          <PackageCheck size={12} />
        </button>
      </footer>
    </main>
  );
}
