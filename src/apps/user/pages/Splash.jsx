import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // setelah 2,5 detik pindah ke halaman login
    const timer = setTimeout(() => {
      navigate("/masuk", { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="splash">
      <span className="splash__circle splash__circle--green" />
      <span className="splash__circle splash__circle--peach" />

      <div className="splash__center">
        <img src="/logo.svg" alt="" className="splash__logo" />
        <h1 className="splash__title">SembakoPlus</h1>
        <p className="splash__tagline">Pasar &amp; Grosir Cilacap</p>
      </div>
    </main>
  );
}