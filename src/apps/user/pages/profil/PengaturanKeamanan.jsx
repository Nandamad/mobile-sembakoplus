import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../../shared/services/api";
import "./PengaturanKeamanan.css";

export default function PengaturanKeamanan() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/profile")
      .then(({ data }) => {
        if (active) setUser(data?.data ?? null);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Gagal memuat data keamanan akun.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function resendEmailVerification() {
    try {
      setNotice("");
      setError("");
      await api.post("/auth/email/verification-notification");
      setNotice("Tautan verifikasi email telah dikirim ulang.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal mengirim tautan verifikasi.");
    }
  }

  return (
    <main className="security">
      <header className="security__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Pengaturan Akun &amp; Keamanan</h1>
      </header>

      {loading && <p className="security__eyebrow">Memuat data akun...</p>}
      {error && <p className="security__eyebrow" role="alert">{error}</p>}
      {notice && <p className="security__eyebrow" role="status">{notice}</p>}

      {user && (
        <>
          <h2 className="security__eyebrow">Data Profil Pengguna</h2>
          <section className="security__card">
            <div className="security__row">
              <div><small>Nama Lengkap</small><strong>{user.name}</strong></div>
              <button type="button" onClick={() => navigate("/profil/ubah-nama", { state: { user } })}>
                Ubah <ChevronRight size={12} />
              </button>
            </div>
            <div className="security__row">
              <div>
                <small>Nomor Handphone (Akun)</small>
                <strong>{user.phone || "Belum diatur"}</strong>
              </div>
              <button type="button" onClick={() => navigate("/profil/ubah-telepon", { state: { user } })}>
                Ubah <ChevronRight size={12} />
              </button>
            </div>
            <div className="security__row">
              <div><small>Alamat Email</small><strong>{user.email || "Belum diatur"}</strong></div>
              {user.email_verified ? (
                <span className="security__state">✓ Terverifikasi</span>
              ) : user.email ? (
                <button type="button" onClick={resendEmailVerification}>Verifikasi</button>
              ) : null}
            </div>
          </section>

          <h2 className="security__eyebrow">Keamanan &amp; Autentikasi</h2>
          <button
            type="button"
            className="security__password"
            onClick={() => navigate("/profil/ubah-sandi")}
          >
            <span><strong>Kata Sandi (Password)</strong><small>Ubah kata sandi akun Anda</small></span>
            <b>Ubah Sandi <ChevronRight size={12} /></b>
          </button>

          <button
            type="button"
            className="security__delete"
            onClick={() => navigate("/profil/hapus-akun")}
          >
            <span>⚠</span>
            Ajukan Penutupan / Hapus Akun Permanen
          </button>
        </>
      )}
    </main>
  );
}
