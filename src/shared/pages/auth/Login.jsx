import { useState } from "react";
import api, { saveAuthToken } from "../../services/api";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import "./Login.css";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  const [login, setLogin] = useState(""); // No. HP atau email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        identifier: login,
        password,
      });
      saveAuthToken(response.data?.data?.token);
      window.location.href = "/beranda";
    } catch (err) {
      setError(
        err.response?.data?.error?.message || err.response?.data?.message || "No. HP/email atau password salah."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    setError("Login Google belum dikonfigurasi. Gunakan email/nomor HP dan password.");
  }

  return (
    <main className="login">
      <header className="login__top">
        <img src="/logo.svg" width="35" alt="SembakoPlus" className="login__logo" />
      </header>

      <h1 className="login__title">Masuk Akun</h1>
      <p className="login__subtitle">
        Masuk untuk melanjutkan belanja kebutuhan dapur segar dari pasar Cilacap.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label className="login__label" htmlFor="login">No. HP / Email</label>
        <div className="login__field">
          <User size={18} className="login__icon" />
          <input
            id="login"
            type="text"
            autoComplete="username"
            placeholder="Masukkan No. HP / Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>

        <label className="login__label" htmlFor="password">Password</label>
        <div className="login__field">
          <Lock size={18} className="login__icon" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Masukkan Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="login__eye"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <a href="/lupa-password" className="login__forgot">Lupa password?</a>

        {error && <p className="login__error" role="alert">{error}</p>}

        <button type="submit" className="login__submit" disabled={loading}>
          {loading ? "Memproses..." : "Masuk Sekarang"}
        </button>
      </form>

      <div className="login__divider"><span>atau masuk dengan</span></div>

      <button type="button" className="login__google" onClick={handleGoogle}>
        <GoogleIcon />
        Login dengan Google
      </button>

      <p className="login__register">
        Belum punya akun? <a href="/daftar">Daftar Sekarang</a>
      </p>
    </main>
  );
}