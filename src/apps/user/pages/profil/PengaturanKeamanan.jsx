import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./PengaturanKeamanan.css";

export default function PengaturanKeamanan() {
  const navigate = useNavigate();
  const name = localStorage.getItem("sembakoplus.profile.name") || "Hanif Satria";

  return (
    <main className="security">
      <header className="security__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Pengaturan Akun &amp; Keamanan</h1>
      </header>

      <h2 className="security__eyebrow">Data Profil Pengguna</h2>
      <section className="security__card">
        <div className="security__row">
          <div><small>Nama Lengkap</small><strong>{name}</strong></div>
          <button type="button" onClick={() => navigate("/profil/ubah-nama")}>Ubah <ChevronRight size={12} /></button>
        </div>
        <div className="security__row">
          <div>
            <small>Nomor Handphone (Akun)</small>
            <strong>+62 812-3456-7890 (Aktif)</strong>
          </div>
          <button type="button" onClick={() => navigate("/profil/ubah-telepon")}>
            Ubah <ChevronRight size={12} />
          </button>
        </div>
        <div className="security__row">
          <div><small>Alamat Email</small><strong>hanif.satria@gmail.com</strong></div>
          <span className="security__state">✓ Terhubung</span>
        </div>
      </section>

      <h2 className="security__eyebrow">Keamanan &amp; Autentikasi</h2>
      <button
        type="button"
        className="security__password"
        onClick={() => navigate("/profil/ubah-sandi")}
      >
        <span><strong>Kata Sandi (Password)</strong><small>Diperbarui 30 hari yang lalu</small></span>
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
    </main>
  );
}
