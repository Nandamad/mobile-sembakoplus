import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, QrCode, Wallet } from "lucide-react";
import { getPrimaryPaymentMethod, savePrimaryPaymentMethod } from "./paymentMethodData";
import "./MetodePembayaran.css";

const WALLETS = ["GoPay", "OVO", "DANA", "ShopeePay", "BCA", "Mandiri"];

export default function MetodePembayaran() {
  const navigate = useNavigate();
  const [method, setMethod] = useState(getPrimaryPaymentMethod);
  const [savedMethod, setSavedMethod] = useState(getPrimaryPaymentMethod);
  const [confirmation, setConfirmation] = useState("");

  function chooseMethod(value) {
    setMethod(value);
    setConfirmation("");
  }

  function handleSubmit() {
    const label = method === "qris" ? "QRIS (Instan & Semua E-Wallet)" : "COD (Bayar Tunai di Tempat)";
    try {
      savePrimaryPaymentMethod(method);
      setSavedMethod(method);
      setConfirmation(`${label} berhasil digunakan sebagai metode utama.`);
    } catch (error) {
      console.error("Gagal menyimpan metode pembayaran:", error);
      setConfirmation("Metode pembayaran gagal disimpan. Silakan coba lagi.");
    }
  }

  return (
    <main className="payments">
      <header className="payments__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
        </button>
        <h1>Metode Pembayaran</h1>
      </header>

      <div className="payments__content">
        <section className="payments__notice">
          <strong>2 Pilihan Metode Pembayaran Resmi</strong>
          <p>
            SembakoPlus hanya melayani QRIS Instan dan COD tunai ke kurir demi
            kenyamanan belanja Anda.
          </p>
        </section>

        <h2 className="payments__section-title">Pilihan Metode Pembayaran</h2>

        <button
          type="button"
          className={`payments__method${method === "qris" ? " is-selected" : ""}`}
          aria-pressed={method === "qris"}
          onClick={() => chooseMethod("qris")}
        >
          <span className="payments__method-heading">
            <span className="payments__method-icon payments__method-icon--qris">
              <QrCode size={16} />
            </span>
            <span className="payments__method-name">
              <strong>QRIS (Instan &amp; Semua E-Wallet)</strong>
              <small>Praktis, aman, dan terverifikasi resmi</small>
            </span>
            <span className="payments__radio" aria-hidden="true">
              {method === "qris" && <span />}
            </span>
          </span>
          <span className="payments__description">
            Scan kode QR menggunakan GoPay, OVO, ShopeePay, DANA, BCA, Mandiri,
            BRI, atau aplikasi m-banking apa pun.
          </span>
          <span className="payments__wallets" aria-label="Metode yang didukung">
            {WALLETS.map((wallet) => <span key={wallet}>{wallet}</span>)}
          </span>
          {method === "qris" && (
            <span className="payments__selected-label">
              <Check size={9} />
              {savedMethod === method ? "Metode Utama Saat Ini" : "Pilih sebagai Metode Utama"}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`payments__method payments__method--cod${method === "cod" ? " is-selected" : ""}`}
          aria-pressed={method === "cod"}
          onClick={() => chooseMethod("cod")}
        >
          <span className="payments__method-heading">
            <span className="payments__method-icon">
              <Wallet size={15} />
            </span>
            <span className="payments__method-name">
              <strong>COD (Bayar Tunai di Tempat)</strong>
              <small>Bayar langsung ke kurir saat pesanan tiba</small>
            </span>
            <span className="payments__radio" aria-hidden="true">
              {method === "cod" && <span />}
            </span>
          </span>
          <span className="payments__description">
            Bayar langsung ke kurir saat paket sampai di alamat Anda. Cek
            ketersediaan berdasarkan area pengiriman.
          </span>
          <span className="payments__wallets payments__wallets--cod">
            <span>Tanpa Biaya Admin</span>
            <span>Cek Fisik Dahulu</span>
            <span>Uang Pas</span>
          </span>
          <span className="payments__availability">Tersedia di Seluruh Area Pengiriman</span>
          {method === "cod" && (
            <span className="payments__selected-label">
              <Check size={9} />
              {savedMethod === method ? "Metode Utama Saat Ini" : "Pilih sebagai Metode Utama"}
            </span>
          )}
        </button>

        <p className="payments__security-note">
          SembakoPlus tidak melayani transfer ke nomor rekening pribadi.
          Solusi aman hanya bayar tunai ke kurir atau melalui QRIS resmi.
        </p>

        {confirmation && (
          <p className="payments__confirmation" role="status">{confirmation}</p>
        )}
      </div>

      <footer className="payments__footer">
        <button type="button" onClick={handleSubmit}>Gunakan Metode Pembayaran</button>
      </footer>
    </main>
  );
}
