import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import "./HapusAkun.css";

const REASONS = [
  "Sudah tidak membutuhkan layanan belanja sembako",
  "Ingin mengganti nomor handphone baru",
  "Menemukan kendala pada layanan pembayaran / kurir",
  "Jarang berbelanja kebutuhan di aplikasi",
  "Alasan lainnya",
];

export default function HapusAkun() {
  const navigate = useNavigate();
  const [reason, setReason] = useState(REASONS[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("Permintaan belum dikirim karena layanan penghapusan akun belum tersedia.");
  }

  return (
    <main className="delete-account">
      <header className="delete-account__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Hapus Akun Permanen</h1>
      </header>

      <form className="delete-account__form" onSubmit={handleSubmit}>
        <section className="delete-account__warning">
          <h2><AlertTriangle size={13} /> Perhatian: Tindakan Ini Tidak Dapat Dibatalkan</h2>
          <ul>
            <li>Seluruh riwayat pesanan, struk belanja, dan alamat tersimpan akan dihapus secara permanen.</li>
            <li>Sisa saldo voucher promo yang belum digunakan akan otomatis hangus.</li>
            <li>Nomor handphone tidak dapat digunakan kembali selama masa retensi 14 hari.</li>
          </ul>
        </section>

        <fieldset className="delete-account__reasons">
          <legend>Alasan Mengajukan Penghapusan Akun:</legend>
          {REASONS.map((item) => (
            <label className={reason === item ? "is-selected" : ""} key={item}>
              <input
                type="radio"
                name="delete-reason"
                value={item}
                checked={reason === item}
                onChange={() => { setReason(item); setError(""); }}
              />
              <span className="delete-account__radio-mark" aria-hidden="true" />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>

        <label className="delete-account__confirm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => { setConfirmed(event.target.checked); setError(""); }}
          />
          <span>
            Saya telah memahami dan menyetujui seluruh konsekuensi penghapusan
            akun SembakoPlus secara permanen.
          </span>
        </label>

        {error && <p className="delete-account__error" role="alert">{error}</p>}

        <footer className="delete-account__footer">
          <button type="submit" className="delete-account__submit" disabled={!reason || !confirmed}>
            Hapus Akun Saya Secara Permanen
          </button>
          <button type="button" className="delete-account__cancel" onClick={() => navigate("/profil/keamanan")}>
            Batalkan &amp; Kembali ke Pengaturan
          </button>
        </footer>
      </form>
    </main>
  );
}
