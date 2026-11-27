import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ChevronLeft, Lock } from "lucide-react";
import "./Login.css";
import "./LupaPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [token] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!token || !email) return setError("Tautan reset tidak lengkap atau tidak valid.");
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    if (password !== confirmation) return setError("Konfirmasi password tidak sama.");

    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmation,
      });
      setNotice(response.data?.message || "Kata sandi berhasil diperbarui.");
      setPassword("");
      setConfirmation("");
    } catch (err) {
      setError(err.response?.data?.message || "Tautan reset tidak valid atau sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <header className="forgot__top">
        <button type="button" className="forgot__back" aria-label="Kembali" onClick={() => navigate("/masuk")}>
          <ChevronLeft size={20} />
        </button>
        <img src="/logo.svg" alt="SembakoPlus" className="forgot__logo" />
      </header>
      <div className="forgot__hero"><Lock size={36} strokeWidth={1.6} /></div>
      <h1 className="forgot__title">Buat Kata Sandi Baru</h1>
      <p className="forgot__subtitle">Masukkan email dan kata sandi baru untuk akun Anda.</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="login__field"><input type="email" placeholder="Email terdaftar" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="login__field"><input type="password" autoComplete="new-password" placeholder="Kata sandi baru" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <div className="login__field"><input type="password" autoComplete="new-password" placeholder="Ulangi kata sandi baru" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
        {error && <p className="login__error" role="alert">{error}</p>}
        {notice && <p className="login__notice" role="status">{notice}</p>}
        <button type="submit" className="login__submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Kata Sandi"}</button>
      </form>
      <p className="forgot__hint"><Link to="/masuk">Kembali ke halaman masuk</Link></p>
    </main>
  );
}
