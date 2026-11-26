import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Mail, Smartphone } from "lucide-react";
import api from "../../../../shared/services/api";
import "./UbahTelepon.css";

export default function UbahTelepon() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [user, setUser] = useState(state?.user ?? null);
  const [phone, setPhone] = useState("");
  const [changeRequestId, setChangeRequestId] = useState(null);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (state?.user) return undefined;
    let active = true;
    api.get("/profile")
      .then(({ data }) => active && setUser(data?.data ?? null))
      .catch(() => {});
    return () => { active = false; };
  }, [state?.user]);

  async function handleRequestOtp(event) {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    const normalizedPhone = digits.startsWith("0") ? digits : digits.startsWith("62") ? `+${digits}` : `0${digits}`;

    try {
      setSubmitting(true);
      setError("");
      setNotice("");
      const { data } = await api.post("/profile/phone/change-requests", {
        phone: normalizedPhone,
      });
      const req = data?.data;
      setChangeRequestId(req?.id ?? null);
      setNotice(`Kode OTP 6 digit telah dikirim ke email terverifikasi (${user?.email || "akun Anda"}).`);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Gagal mengirim OTP perubahan nomor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    if (!changeRequestId) return;

    try {
      setSubmitting(true);
      setError("");
      await api.post(`/profile/phone/change-requests/${changeRequestId}/verify`, {
        otp: otp.trim(),
      });
      navigate("/profil/keamanan", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Kode OTP tidak valid.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="change-phone">
      <header className="change-phone__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Ubah Nomor Handphone</h1>
      </header>

      {!changeRequestId ? (
        <form className="change-phone__form" onSubmit={handleRequestOtp}>
          <div className="change-phone__notice">
            <span>
              Untuk keamanan akun, kode verifikasi OTP akan dikirim ke alamat email terverifikasi Anda untuk mengotorisasi perubahan nomor handphone.
            </span>
          </div>

          <section className="change-phone__card">
            <label>Nomor Handphone Terdaftar</label>
            <strong className="change-phone__current">{user?.phone || "Belum diatur"}</strong>

            <label htmlFor="new-phone">Nomor Handphone Baru</label>
            <div className="change-phone__input">
              <span>+62</span>
              <input
                id="new-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="81234567890"
                value={phone}
                onChange={(event) => { setPhone(event.target.value); setError(""); }}
                required
              />
            </div>

            <fieldset>
              <legend>Saluran Pengiriman OTP:</legend>
              <label className="is-selected">
                <Mail size={13} />
                Email Terverifikasi ({user?.email || "Email akun"})
              </label>
            </fieldset>
          </section>

          {error && <p className="change-phone__error" role="alert">{error}</p>}

          <footer className="change-phone__footer">
            <button type="submit" disabled={phone.replace(/\D/g, "").length < 8 || submitting}>
              <Smartphone size={13} />
              {submitting ? "Mengirim OTP..." : "Kirim OTP ke Email"}
            </button>
          </footer>
        </form>
      ) : (
        <form className="change-phone__form" onSubmit={handleVerifyOtp}>
          {notice && <div className="change-phone__notice"><span>{notice}</span></div>}
          <section className="change-phone__card">
            <label htmlFor="otp-code">Masukkan Kode OTP (6 Digit)</label>
            <div className="change-phone__input">
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "")); setError(""); }}
                required
              />
            </div>
          </section>

          {error && <p className="change-phone__error" role="alert">{error}</p>}

          <footer className="change-phone__footer">
            <button type="submit" disabled={otp.length !== 6 || submitting}>
              <Check size={13} />
              {submitting ? "Memverifikasi..." : "Verifikasi & Simpan Nomor"}
            </button>
          </footer>
        </form>
      )}
    </main>
  );
}
