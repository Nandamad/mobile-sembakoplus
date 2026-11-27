import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { ChevronLeft, Mail, Lock } from "lucide-react";
import "./Login.css"; // dipakai bersama (.login, .login__field, .login__submit)
import "./LupaPassword.css";

export default function LupaPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError("Masukkan alamat email terlebih dulu.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      setNotice(response.data?.message || "Jika email terdaftar, tautan reset akan dikirim.");
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal mengirim tautan reset. Periksa konfigurasi email atau coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <header className="forgot__top">
        <button
          type="button"
          className="forgot__back"
          aria-label="Kembali"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} />
        </button>
        <img src="/logo.svg" alt="SembakoPlus" className="forgot__logo" />
      </header>

      <div className="forgot__hero">
        <Mail size={36} strokeWidth={1.6} />
        <span className="forgot__badge">
          <Lock size={13} />
        </span>
      </div>

      <h1 className="forgot__title">Lupa Kata Sandi?</h1>
      <p className="forgot__subtitle">
        Masukkan email terdaftar. Kami akan mengirim tautan aman untuk mengatur ulang kata sandi.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="login__field">
          <Mail size={18} className="login__icon" />
          <input
            type="email"
            autoComplete="email"
            placeholder="Masukkan alamat email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="login__error" role="alert">{error}</p>}
        {notice && <p className="login__notice" role="status">{notice}</p>}

        <button type="submit" className="login__submit" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Kode OTP"}
        </button>
      </form>

      <p className="forgot__hint">
        Ingat kata sandi? <Link to="/masuk">Masuk di sini</Link>
      </p>
    </main>
  );
}