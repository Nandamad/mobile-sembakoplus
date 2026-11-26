import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { ChevronLeft, Clock3, Download, RefreshCw } from "lucide-react";
import api from "../../../../shared/services/api";
import "./Pembayaran.css";

const WALLET_NAMES = ["GoPay", "OVO", "DANA", "ShopeePay", "BCA", "Mandiri"];
const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function PaymentQRIS() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get("orderId");
  const initialOrder = state?.order ?? null;
  const orderId = queryOrderId || initialOrder?.id || null;

  const [order, setOrder] = useState(initialOrder);
  const [payment, setPayment] = useState(initialOrder?.payment ?? null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return undefined;
    let active = true;

    async function loadQris() {
      try {
        let currentOrder = initialOrder;
        if (!currentOrder || !currentOrder.payment?.id) {
          const orderRes = await api.get(`/orders/${orderId}`);
          currentOrder = orderRes.data?.data ?? null;
          if (!active) return;
          setOrder(currentOrder);
        }

        const paymentId = currentOrder?.payment?.id;
        if (!paymentId) {
          throw new Error("Data pembayaran tidak ditemukan.");
        }

        let paymentData = currentOrder.payment;
        if (paymentData.status === "paid") {
          navigate(`/pembayaran/status?orderId=${currentOrder.id}`, {
            replace: true,
            state: { order: currentOrder, payment: paymentData },
          });
          return;
        }

        if (paymentData.status === "pending" && !paymentData.qr_string && !paymentData.qr_image_url) {
          const qrisRes = await api.post(`/payments/${paymentId}/create-qris`);
          paymentData = qrisRes.data?.data ?? paymentData;
        }

        if (!active) return;
        setPayment(paymentData);
        setError("");
        if (paymentData.expired_at) {
          const diff = Math.max(0, Math.floor((new Date(paymentData.expired_at).getTime() - Date.now()) / 1000));
          setRemainingSeconds(diff);
        }

        if (paymentData.qr_string) {
          const url = await QRCode.toDataURL(paymentData.qr_string, { width: 240, margin: 1 });
          if (active) setQrDataUrl(url);
        } else if (paymentData.qr_image_url) {
          setQrDataUrl(paymentData.qr_image_url);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.error?.message || err.message || "QRIS belum dapat dibuat.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    Promise.resolve().then(() => {
      if (active) loadQris();
    });

    return () => { active = false; };
  }, [orderId, initialOrder, navigate]);

  useEffect(() => {
    if (remainingSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  const checkStatus = useCallback(async (manual = false) => {
    if (!payment?.id) return;
    try {
      if (manual) setChecking(true);
      const { data } = await api.get(`/payments/${payment.id}?sync=1`);
      const updated = data?.data;
      if (!updated) return;
      setPayment(updated);
      if (updated.is_paid || updated.status === "paid") {
        navigate(`/pembayaran/status?orderId=${order?.id ?? updated.order_id}`, {
          replace: true,
          state: { order, payment: updated },
        });
      } else if (["expired", "cancelled", "failed"].includes(updated.status)) {
        setError(`Pembayaran berstatus ${updated.status}. Silakan buat pesanan baru jika diperlukan.`);
      } else if (manual) {
        setError("Pembayaran masih menunggu konfirmasi dari penyedia QRIS.");
      }
    } catch (err) {
      if (manual) {
        setError(err.response?.data?.error?.message || "Gagal memeriksa status pembayaran.");
      }
    } finally {
      if (manual) setChecking(false);
    }
  }, [payment, navigate, order]);

  useEffect(() => {
    if (!payment?.id || payment.status !== "pending") return undefined;
    const interval = window.setInterval(() => {
      checkStatus(false);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [payment?.id, payment?.status, checkStatus]);

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QRIS-${order?.order_number || orderId}.png`;
    link.click();
  }

  return (
    <main className="qris-payment">
      <header className="payment-flow__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}>
          <ChevronLeft size={17} />
        </button>
        <h1>Pembayaran QRIS</h1>
      </header>

      {loading && <p className="payment-flow__empty">Menyiapkan kode QRIS resmi...</p>}

      {!loading && (!orderId || !order) && (
        <section className="payment-flow__empty">
          <p>{error || "Data pembayaran tidak ditemukan. Silakan cek daftar pesanan Anda."}</p>
          <button type="button" onClick={() => navigate("/pesanan")}>Lihat Pesanan Saya</button>
        </section>
      )}

      {!loading && order && (
        <>
          <div className={`qris-payment__timer${remainingSeconds === 0 && payment?.expired_at ? " is-expired" : ""}`}>
            <Clock3 size={12} />
            {payment?.expired_at ? (
              remainingSeconds > 0
                ? <>Selesaikan pembayaran dalam <strong>{formatTime(remainingSeconds)}</strong></>
                : <strong>Waktu pembayaran telah habis</strong>
            ) : (
              <span>Menunggu pembayaran untuk pesanan <strong>{order.order_number}</strong></span>
            )}
          </div>

          <section className="qris-payment__card">
            <div className="qris-payment__merchant">
              <span><b>QRIS</b><small>STANDAR PEMBAYARAN NASIONAL</small></span>
              <strong>SembakoPlus</strong>
              <small>No. Pesanan: {order.order_number} • {payment?.provider?.toUpperCase() || "MIDTRANS"}</small>
            </div>

            <div className="qris-payment__qr-wrap">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QRIS untuk pesanan ${order.order_number}`} className="qris-payment__qr-img" />
              ) : (
                <div className="qris-payment__qr-unavailable">
                  <p>{error || "Kode QRIS belum tersedia dari payment gateway."}</p>
                </div>
              )}
              <p>Pindai QR Code di atas dengan aplikasi e-wallet atau mobile banking</p>
            </div>

            <div className="qris-payment__wallets" aria-label="Aplikasi yang didukung">
              {WALLET_NAMES.map((wallet) => <span key={wallet}>{wallet}</span>)}
            </div>

            <div className="qris-payment__total">
              <span>Total Nominal Pembayaran</span>
              <strong>{rupiah(payment?.gross_amount ?? order.total)}</strong>
            </div>

            {qrDataUrl && (
              <div className="qris-payment__qr-actions">
                <button type="button" onClick={downloadQr}><Download size={10} /> Simpan QR</button>
                <button type="button" onClick={() => checkStatus(true)} disabled={checking}>
                  <RefreshCw size={10} /> {checking ? "Memeriksa..." : "Cek Status"}
                </button>
              </div>
            )}

            {error && <p className="qris-payment__notice" role="alert">{error}</p>}
          </section>

          <section className="qris-payment__instructions">
            <strong>Cara Pembayaran</strong>
            <ol>
              <li>Buka aplikasi e-wallet (GoPay/OVO/DANA) atau mobile banking.</li>
              <li>Pilih menu QR lalu pindai QRIS resmi di atas.</li>
              <li>Status pesanan berubah otomatis setelah konfirmasi dari server pembayaran.</li>
            </ol>
          </section>

          <footer className="payment-flow__footer">
            <button type="button" disabled={checking || !payment?.id} onClick={() => checkStatus(true)}>
              <RefreshCw size={12} /> {checking ? "Memeriksa Status..." : "Periksa Status Pembayaran"}
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
