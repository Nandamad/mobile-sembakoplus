import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import api from "../../services/api";
import { ChevronLeft, Smartphone, Check } from "lucide-react";
import "./Login.css";
import "./LupaPassword.css";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  // fokus ke kotak pertama saat halaman dibuka
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // hitung mundur kirim ulang
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // kalau halaman dibuka langsung tanpa email, kembalikan ke langkah 1
  if (!email) return <Navigate to="/lupa-password" replace />;

  function handleChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const otp = digits.join("");

    if (otp.length < OTP_LENGTH) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/verify-otp", { email, otp });
      // langkah berikutnya: halaman buat kata sandi baru
      navigate("/reset-password", { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || "Kode OTP salah atau kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await api.post("/forgot-password", { email });
      setSeconds(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch {
      setError("Gagal mengirim ulang kode. Coba lagi.");
    }
  }

  const timeText = `00:${String(seconds).padStart(2, "0")}`;

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
        <img src="/logo.png" alt="SembakoPlus" className="forgot__logo" />
      </header>

      <div className="forgot__hero">
        <Smartphone size={36} strokeWidth={1.6} />
        <span className="forgot__badge">
          <Check size={14} strokeWidth={3} />
        </span>
      </div>

      <h1 className="forgot__title">Verifikasi Kode OTP</h1>
      <p className="forgot__subtitle">
        Kode 6 digit telah dikirimkan ke email Anda:
        <br />
        <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="otp__row" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              className="otp__box"
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              aria-label={`Digit ${i + 1}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        <p className="otp__timer">
          Belum menerima kode?{" "}
          {seconds > 0 ? (
            <>Kirim ulang dalam {timeText}</>
          ) : (
            <button type="button" className="otp__resend" onClick={handleResend}>
              Kirim ulang
            </button>
          )}
        </p>

        {error && <p className="login__error" role="alert">{error}</p>}

        <button type="submit" className="login__submit" disabled={loading}>
          {loading ? "Memverifikasi..." : "Verifikasi & Lanjutkan"}
        </button>
      </form>

      <p className="login__register">
        Salah email? <Link to="/lupa-password">Ubah alamat email</Link>
      </p>
    </main>
  );
}