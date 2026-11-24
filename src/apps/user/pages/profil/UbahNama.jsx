import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, X } from "lucide-react";
import "./UbahNama.css";

const MAX_NAME_LENGTH = 50;

export default function UbahNama() {
  const navigate = useNavigate();
  const [name, setName] = useState(
    () => localStorage.getItem("sembakoplus.profile.name") || "Hanif Satria"
  );

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    localStorage.setItem("sembakoplus.profile.name", trimmedName);
    navigate("/profil", { replace: true });
  }

  return (
    <main className="edit-name">
      <header className="edit-name__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Ubah Nama Lengkap</h1>
      </header>

      <form className="edit-name__form" onSubmit={handleSubmit}>
        <label htmlFor="profile-name">Nama Lengkap Anda</label>
        <div className="edit-name__input">
          <input
            id="profile-name"
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            pattern="[A-Za-zÀ-ÖØ-öø-ÿ ]+"
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
          {name && (
            <button type="button" aria-label="Hapus nama" onClick={() => setName("")}>
              <X size={12} />
            </button>
          )}
        </div>
        <p>Gunakan nama asli Anda untuk memudahkan kurir mengonfirmasi pesanan saat pengantaran.</p>
        <aside>
          <span>ⓘ</span>
          Maksimal 50 karakter • Hanya menggunakan huruf dan spasi tanpa karakter khusus.
        </aside>
        <footer className="edit-name__footer">
          <button type="submit" disabled={!name.trim()}>
            <Check size={13} />
            Simpan Perubahan
          </button>
        </footer>
      </form>
    </main>
  );
}
