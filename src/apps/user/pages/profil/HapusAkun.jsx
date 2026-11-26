import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import api, { clearAuthToken } from "../../../../shared/services/api";
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!confirmed || !currentPassword) {
      setError("Masukkan kata sandi saat ini dan centang persetujuan terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await api.delete("/profile", {
        data: {
          confirm: true,
          current_password: currentPassword,
          reason,
        },
      });
      clearAuthToken();
      navigate("/masuk", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Penghapusan akun gagal diproses.");
    } finally {
      setSubmitting(false);
    }
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
            <li>Profil dan akses akun Anda akan dinonaktifkan serta seluruh token sesi dicabut.</li>
            <li>Data transaksi yang wajib dipertahankan disimpan sesuai kebijakan retensi yang berlaku.</li>
            <li>Email, nomor telepon, dan identitas login tidak dapat didaftarkan ulang selama 30 hari.</li>
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

        <section className="delete-account__reasons">
          <label htmlFor="delete-current-password">Konfirmasi Kata Sandi Saat Ini</label>
          <input
            id="delete-current-password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan kata sandi Anda"
            value={currentPassword}
            onChange={(event) => { setCurrentPassword(event.target.value); setError(""); }}
            required
          />
        </section>

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
          <button
            type="submit"
            className="delete-account__submit"
            disabled={!reason || !confirmed || !currentPassword || submitting}
          >
            {submitting ? "Memproses..." : "Hapus Akun Saya Secara Permanen"}
          </button>
          <button type="button" className="delete-account__cancel" onClick={() => navigate("/profil/keamanan")}>
            Batalkan &amp; Kembali ke Pengaturan
          </button>
        </footer>
      </form>
    </main>
  );
}
