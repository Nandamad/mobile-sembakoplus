import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mail, MessageCircle, Smartphone } from "lucide-react";
import "./UbahTelepon.css";

export default function UbahTelepon() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("813-9876-5432");
  const [method, setMethod] = useState("whatsapp");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("OTP belum dapat dikirim karena layanan verifikasi belum terhubung ke server.");
  }

  return (
    <main className="change-phone">
      <header className="change-phone__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Ubah Nomor Handphone</h1>
      </header>

      <form className="change-phone__form" onSubmit={handleSubmit}>
        <div className="change-phone__notice">
          <span>Kode verifikasi OTP akan dikirimkan ke nomor handphone baru Anda untuk memastikan keabsahan nomor.</span>
        </div>

        <section className="change-phone__card">
          <label>Nomor Handphone Terdaftar</label>
          <strong className="change-phone__current">+62 812-3456-7890 (Aktif)</strong>

          <label htmlFor="new-phone">Nomor Handphone Baru</label>
          <div className="change-phone__input">
            <span>+62</span>
            <input
              id="new-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(event) => { setPhone(event.target.value); setError(""); }}
              required
            />
          </div>

          <fieldset>
            <legend>Kirim Kode Verifikasi Melalui:</legend>
            <label className={method === "whatsapp" ? "is-selected" : ""}>
              <input
                type="radio"
                name="delivery-method"
                value="whatsapp"
                checked={method === "whatsapp"}
                onChange={(event) => setMethod(event.target.value)}
              />
              <MessageCircle size={13} />
              WhatsApp (+62 813-9876-5432)
            </label>
            <label className={method === "email" ? "is-selected" : ""}>
              <input
                type="radio"
                name="delivery-method"
                value="email"
                checked={method === "email"}
                onChange={(event) => setMethod(event.target.value)}
              />
              <Mail size={13} />
              Email (hanif.s***@gmail.com)
            </label>
          </fieldset>
        </section>

        {error && <p className="change-phone__error" role="alert">{error}</p>}

        <footer className="change-phone__footer">
          <button type="submit" disabled={phone.replace(/\D/g, "").length < 9}>
            <Smartphone size={13} />
            Lanjutkan &amp; Kirim OTP
          </button>
        </footer>
      </form>
    </main>
  );
}
