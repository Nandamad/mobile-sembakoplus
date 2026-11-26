import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, X } from "lucide-react";
import api from "../../../../shared/services/api";
import "./UbahNama.css";

const MAX_NAME_LENGTH = 100;

export default function UbahNama() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [name, setName] = useState(state?.user?.name || "");
  const [loading, setLoading] = useState(!state?.user?.name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state?.user?.name) return undefined;
    let active = true;
    api.get("/profile")
      .then(({ data }) => {
        if (active) setName(data?.data?.name || "");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Gagal memuat profil.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [state?.user?.name]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setSubmitting(true);
      setError("");
      await api.patch("/profile", { name: trimmedName });
      navigate("/profil", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || "Nama gagal diperbarui.");
    } finally {
      setSubmitting(false);
    }
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
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            disabled={loading}
            required
          />
          {name && (
            <button type="button" aria-label="Hapus nama" onClick={() => setName("")}>
              <X size={12} />
            </button>
          )}
        </div>
        <p>Gunakan nama asli Anda untuk memudahkan kurir mengonfirmasi pesanan saat pengantaran.</p>
        {error && <p role="alert">{error}</p>}
        <footer className="edit-name__footer">
          <button type="submit" disabled={!name.trim() || loading || submitting}>
            <Check size={13} />
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </footer>
      </form>
    </main>
  );
}
