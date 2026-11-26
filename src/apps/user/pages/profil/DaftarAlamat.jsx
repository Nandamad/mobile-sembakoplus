import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Navigation,
  Share2,
  Plus,
} from "lucide-react";
import { getAddresses, setPrimaryAddress } from "./addressData";
import "./DaftarAlamat.css";

export default function DaftarAlamat() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [message, setMessage] = useState("");

  async function refreshAddresses() {
    try {
      const nextAddresses = await getAddresses();
      setAddresses(nextAddresses);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.error?.message || "Gagal memuat alamat. Login ulang lalu coba lagi.");
    }
  }

  useEffect(() => {
    let active = true;
    getAddresses()
      .then((nextAddresses) => {
        if (active) setAddresses(nextAddresses);
      })
      .catch((error) => {
        if (active) setMessage(error.response?.data?.error?.message || "Gagal memuat alamat. Login ulang lalu coba lagi.");
      });
    return () => { active = false; };
  }, []);

  async function makePrimary(id) {
    try {
      await setPrimaryAddress(id);
      await refreshAddresses();
    } catch (error) {
      setMessage(error.response?.data?.error?.message || "Alamat utama belum berhasil diubah.");
    }
  }

  return (
    <main className="addresses">
      <header className="addresses__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Daftar Alamat Pengiriman</h1>
      </header>

      <div className="addresses__list">
        {addresses.map((address) => (
          <article className="addresses__card" key={address.id}>
            <header>
              <span className="addresses__pin"><MapPin size={14} /></span>
              <strong>{address.label}</strong>
              {address.primary && <span className="addresses__primary">✓ Utama</span>}
            </header>
            <p className="addresses__contact">{address.contact}</p>
            <p className="addresses__text">{address.address}</p>
            {address.note && (
              <p className="addresses__note">
                <Navigation size={10} />
                {address.note}
              </p>
            )}
            <footer>
              {!address.primary && (
                <button type="button" className="addresses__secondary" onClick={() => makePrimary(address.id)}>
                  Jadikan Utama
                </button>
              )}
              <button
                type="button"
                className="addresses__secondary"
                onClick={() => navigate("/profil/alamat/ubah", { state: { address } })}
              >
                Ubah Alamat
              </button>
              {address.primary && (
                <button type="button" className="addresses__secondary">
                  <Share2 size={11} />
                  Bagikan
                </button>
              )}
            </footer>
          </article>
        ))}
        {message && <p className="addresses__message" role="alert">{message}</p>}
      </div>

      <footer className="addresses__footer">
        <button type="button" onClick={() => navigate("/profil/alamat/tambah")}>
          <Plus size={14} />
          Tambah Alamat Baru
        </button>
      </footer>
    </main>
  );
}
