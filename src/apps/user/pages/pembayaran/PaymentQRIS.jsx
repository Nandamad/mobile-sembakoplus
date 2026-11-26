import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Clock3, Copy, Share2 } from "lucide-react";
import "./Pembayaran.css";

const WALLET_NAMES = ["GoPay", "OVO", "DANA", "ShopeePay", "BCA", "Mandiri"];
const QR_SIZE = 25;

function isFinderCell(row, column, startRow, startColumn) {
  const localRow = row - startRow;
  const localColumn = column - startColumn;
  if (localRow < 0 || localRow > 6 || localColumn < 0 || localColumn > 6) return null;
  return localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6
    || (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4);
}

function isDarkCell(row, column) {
  for (const [startRow, startColumn] of [[0, 0], [0, QR_SIZE - 7], [QR_SIZE - 7, 0]]) {
    const finderCell = isFinderCell(row, column, startRow, startColumn);
    if (finderCell !== null) return finderCell;
  }
  return (row * 17 + column * 23 + row * column * 7) % 11 < 5;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

const QR_CELLS = Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
  const row = Math.floor(index / QR_SIZE);
  const column = index % QR_SIZE;
  return isDarkCell(row, column);
});

const rupiah = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;

export default function PaymentQRIS() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [remainingSeconds, setRemainingSeconds] = useState(899);
  const [notice, setNotice] = useState("");
  const order = state?.order ?? null;
  const [orderReference] = useState(() => state?.orderReference ?? order?.order_number ?? `SP-${Date.now().toString().slice(-10)}`);
  const items = Array.isArray(order?.items) ? order.items : [];
  const total = Number(order?.total ?? 0);

  useEffect(() => {
    if (remainingSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  function showUnavailableMessage() {
    setNotice("QRIS demo belum terhubung ke payment gateway dan tidak dapat digunakan untuk membayar.");
  }

  function showDemoStatus() {
    navigate("/pembayaran/status", {
      state: {
        paymentData: state,
        orderReference,
        paidAt: new Date().toISOString(),
        simulated: true,
      },
    });
  }

  return (
    <main className="qris-payment">
      <header className="payment-flow__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={17} />
        </button>
        <h1>Pembayaran QRIS</h1>
      </header>

      {items.length ? (
        <>
          <div className={`qris-payment__timer${remainingSeconds === 0 ? " is-expired" : ""}`}>
            <Clock3 size={12} />
            {remainingSeconds > 0
              ? <>Selesaikan pembayaran dalam <strong>{formatTime(remainingSeconds)}</strong></>
              : <strong>Waktu pembayaran telah habis</strong>}
          </div>

          <section className="qris-payment__card">
            <div className="qris-payment__merchant">
              <span><b>QRIS</b><small>STANDAR PEMBAYARAN NASIONAL</small></span>
              <strong>SembakoPlus Fresh Cilacap</strong>
              <small>ID Merchant: DEMO SEMBAKOPLUS • Detail Otomatis</small>
            </div>

            <div className="qris-payment__qr-wrap">
              <div className="qris-payment__qr" role="img" aria-label="Kode QRIS demo, tidak dapat digunakan untuk membayar">
                {QR_CELLS.map((dark, index) => <span className={dark ? "is-dark" : ""} key={index} />)}
                <b>DEMO</b>
              </div>
              <p>Arahkan kamera ke QR Code di atas</p>
            </div>

            <div className="qris-payment__wallets" aria-label="Aplikasi yang didukung">
              {WALLET_NAMES.map((wallet) => <span key={wallet}>{wallet}</span>)}
            </div>

            <div className="qris-payment__total">
              <span>Total Nominal Pembayaran</span>
              <strong>{rupiah(total)}</strong>
            </div>
            <div className="qris-payment__qr-actions">
              <button type="button" onClick={showUnavailableMessage}><Copy size={10} /> Simpan Kode QR</button>
              <button type="button" onClick={showUnavailableMessage}><Share2 size={10} /> Bagikan QR</button>
            </div>
            {notice && <p className="qris-payment__notice" role="status">{notice}</p>}
          </section>

          <section className="qris-payment__instructions">
            <strong>Cara Pembayaran</strong>
            <ol>
              <li>Buka aplikasi e-wallet (GoPay/OVO/DANA) atau mobile banking.</li>
              <li>Pilih menu QR lalu pindai QRIS resmi dari payment gateway.</li>
              <li>Masukkan PIN dan pastikan nominal transaksi sudah benar.</li>
            </ol>
            <p>Ini hanya pratinjau. QR tidak valid untuk transaksi.</p>
          </section>

          <footer className="payment-flow__footer">
            <button type="button" disabled={!remainingSeconds} onClick={showDemoStatus}>
              <Check size={12} /> Saya Sudah Membayar
            </button>
          </footer>
        </>
      ) : (
        <section className="payment-flow__empty">
          <p>Data pembayaran tidak ditemukan. Silakan kembali ke checkout.</p>
          <button type="button" onClick={() => navigate("/keranjang")}>Kembali ke Keranjang</button>
        </section>
      )}
    </main>
  );
}
