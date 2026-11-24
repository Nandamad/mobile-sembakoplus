import { useState } from "react";
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
  const [addresses, setAddresses] = useState(getAddresses);
  const [message, setMessage] = useState("");

  function makePrimary(index) {
    try {
      setPrimaryAddress(index);
      setAddresses(getAddresses());
      setMessage("");
    } catch (error) {
      console.error("Gagal mengubah alamat utama:", error);
      setMessage("Alamat utama belum berhasil diubah. Silakan coba lagi.");
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
        {addresses.map((address, index) => (
          <article className="addresses__card" key={address.label}>
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
                <button type="button" className="addresses__secondary" onClick={() => makePrimary(index)}>
                  Jadikan Utama
                </button>
              )}
              <button
                type="button"
                className="addresses__secondary"
                onClick={() => navigate("/profil/alamat/ubah", { state: { address, addressIndex: index } })}
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
