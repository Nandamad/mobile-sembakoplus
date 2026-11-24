import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, MapPin, Trash2 } from "lucide-react";
import { deleteAddress, saveAddress, updateAddress } from "./addressData";
import "./TambahAlamat.css";

const ADDRESS_TYPES = ["Rumah", "Kantor", "Lainnya"];

export default function TambahAlamat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingAddress = state?.address;
  const addressIndex = state?.addressIndex;
  const isEditing = Boolean(editingAddress && Number.isInteger(addressIndex));
  const [type, setType] = useState("Rumah");
  const [recipient, setRecipient] = useState("Hanif Sinergi");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [city, setCity] = useState("Cilacap Selatan, Sidakaya (53211)");
  const [street, setStreet] = useState("Jl. Laut No. 42, RT 03 / RW 02, Sidakaya");
  const [note, setNote] = useState("Pagar hitam samping warung Bu Siti");
  const [primary, setPrimary] = useState(true);
  const [error, setError] = useState("");
  const [editLabel, setEditLabel] = useState(editingAddress?.label ?? "");
  const [editContact, setEditContact] = useState(editingAddress?.contact ?? "");
  const [editAddress, setEditAddress] = useState(editingAddress?.address ?? "");
  const [editNote, setEditNote] = useState(editingAddress?.note ?? "");
  const [editPrimary, setEditPrimary] = useState(Boolean(editingAddress?.primary));
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  function handleEditSubmit(event) {
    event.preventDefault();
    try {
      updateAddress(addressIndex, {
        ...editingAddress,
        label: editLabel.trim(),
        contact: editContact.trim(),
        address: editAddress.trim(),
        note: editNote.trim(),
        primary: editPrimary,
      });
      navigate("/profil/alamat", { replace: true });
    } catch (saveError) {
      console.error("Gagal mengubah alamat pengiriman:", saveError);
      setError("Perubahan alamat belum tersimpan. Periksa ruang penyimpanan lalu coba lagi.");
    }
  }

  function handleDeleteAddress() {
    try {
      deleteAddress(addressIndex);
      navigate("/profil/alamat", { replace: true });
    } catch (deleteError) {
      console.error("Gagal menghapus alamat pengiriman:", deleteError);
      setError("Alamat belum berhasil dihapus. Silakan coba lagi.");
      setShowDeleteConfirmation(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const address = {
      label: `${type} ${recipient.split(" ")[0]}`,
      primary,
      contact: `${recipient} (${phone})`,
      address: `${street}, ${city}`,
      note: note.trim() ? `Titik GPS Sesuai • ${note.trim()}` : "Titik GPS Sesuai",
    };

    try {
      saveAddress(address);
      navigate("/profil/alamat");
    } catch (saveError) {
      console.error("Gagal menyimpan alamat pengiriman:", saveError);
      setError("Alamat belum tersimpan. Periksa ruang penyimpanan browser lalu coba lagi.");
    }
  }

  if (isEditing) {
    return (
      <main className="add-address">
        <header className="add-address__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate("/profil/alamat")}>
            <ChevronLeft size={19} />
          </button>
          <h1>Ubah Alamat</h1>
        </header>

        <form className="add-address__form" onSubmit={handleEditSubmit}>
          <section className="add-address__map">
            <div className="add-address__map-grid" aria-hidden="true" />
            <span className="add-address__marker"><MapPin size={20} fill="currentColor" /></span>
            <div className="add-address__map-info">
              <div>
                <strong>Lokasi Alamat</strong>
                <small>Perbarui detail alamat pengiriman Anda</small>
              </div>
            </div>
          </section>

          <section className="add-address__card">
            <label className="add-address__label" htmlFor="edit-address-label">Label Alamat</label>
            <input
              id="edit-address-label"
              className="add-address__input"
              value={editLabel}
              onChange={(event) => setEditLabel(event.target.value)}
              required
            />

            <label className="add-address__label" htmlFor="edit-address-contact">Nama dan Nomor Penerima</label>
            <input
              id="edit-address-contact"
              className="add-address__input"
              value={editContact}
              onChange={(event) => setEditContact(event.target.value)}
              required
            />

            <label className="add-address__label" htmlFor="edit-address-full">Alamat Lengkap</label>
            <textarea
              id="edit-address-full"
              className="add-address__input add-address__textarea"
              value={editAddress}
              onChange={(event) => setEditAddress(event.target.value)}
              required
            />

            <label className="add-address__label" htmlFor="edit-address-note">Catatan / Patokan Kurir (Opsional)</label>
            <input
              id="edit-address-note"
              className="add-address__input"
              value={editNote}
              onChange={(event) => setEditNote(event.target.value)}
            />
          </section>

          <label className="add-address__primary">
            <span><strong>Atur sebagai Alamat Utama</strong><small>Alamat tujuan default pesanan belanja Anda</small></span>
            <input
              type="checkbox"
              checked={editPrimary}
              onChange={(event) => setEditPrimary(event.target.checked)}
            />
            <i />
          </label>

          {error && <p className="add-address__error" role="alert">{error}</p>}

          <footer className="add-address__footer add-address__footer--edit">
            <button type="button" className="add-address__delete" onClick={() => setShowDeleteConfirmation(true)}>
              <Trash2 size={13} /> Hapus Alamat
            </button>
            <button type="submit">
              <Check size={14} /> Simpan Perubahan
            </button>
          </footer>
        </form>

        {showDeleteConfirmation && (
          <div className="add-address__dialog-backdrop" onClick={() => setShowDeleteConfirmation(false)}>
            <section
              className="add-address__dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-address-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="delete-address-title">Hapus alamat ini?</h2>
              <p>Alamat “{editLabel}” akan dihapus dari daftar alamat Anda.</p>
              <div>
                <button type="button" onClick={() => setShowDeleteConfirmation(false)}>Batal</button>
                <button type="button" className="add-address__dialog-confirm" onClick={handleDeleteAddress}>
                  Hapus Alamat
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="add-address">
      <header className="add-address__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Tambah Alamat Baru</h1>
      </header>

      <form className="add-address__form" onSubmit={handleSubmit}>
        <section className="add-address__map">
          <div className="add-address__map-grid" aria-hidden="true" />
          <span className="add-address__marker"><MapPin size={20} fill="currentColor" /></span>
          <div className="add-address__map-info">
            <div>
              <strong>Pemetaan Lokasi Akurat</strong>
              <small>Sesuai titik GPS rumah Anda</small>
            </div>
            <button type="button">Ubah di Peta ›</button>
          </div>
        </section>

        <section className="add-address__card">
          <fieldset className="add-address__types">
            <legend>Label Alamat</legend>
            {ADDRESS_TYPES.map((item) => (
              <label className={type === item ? "is-selected" : ""} key={item}>
                <input
                  type="radio"
                  name="address-type"
                  value={item}
                  checked={type === item}
                  onChange={() => setType(item)}
                />
                {item}
              </label>
            ))}
          </fieldset>

          <label className="add-address__label" htmlFor="address-recipient">Nama Penerima</label>
          <input
            id="address-recipient"
            className="add-address__input"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            required
          />

          <label className="add-address__label" htmlFor="address-phone">Nomor Handphone Penerima</label>
          <input
            id="address-phone"
            className="add-address__input"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />

          <label className="add-address__label" htmlFor="address-city">Kota / Kecamatan / Kode Pos</label>
          <select
            id="address-city"
            className="add-address__input"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          >
            <option>Cilacap Selatan, Sidakaya (53211)</option>
            <option>Cilacap Tengah, Sidanegara (53223)</option>
            <option>Cilacap Utara, Gumilir (53231)</option>
          </select>

          <label className="add-address__label" htmlFor="address-street">Nama Jalan, No. Rumah, RT/RW</label>
          <textarea
            id="address-street"
            className="add-address__input add-address__textarea"
            value={street}
            onChange={(event) => setStreet(event.target.value)}
            required
          />

          <label className="add-address__label" htmlFor="address-note">Catatan / Patokan Kurir (Opsional)</label>
          <input
            id="address-note"
            className="add-address__input"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </section>

        <label className="add-address__primary">
          <span><strong>Atur sebagai Alamat Utama</strong><small>Alamat tujuan default pesanan belanja Anda</small></span>
          <input
            type="checkbox"
            checked={primary}
            onChange={(event) => setPrimary(event.target.checked)}
          />
          <i />
        </label>

        {error && <p className="add-address__error" role="alert">{error}</p>}

        <footer className="add-address__footer">
          <button type="submit">
            <Check size={14} />
            Simpan &amp; Gunakan Alamat
          </button>
        </footer>
      </form>
    </main>
  );
}
