import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";

import {
  CART_UPDATED_EVENT,
  changeCartQuantity,
  getCartItems,
  loadCart,
  removeSelectedCartItems,
  setAllCartItemsSelected,
  setCartItemSelected,
} from "./cartData";
import "./Keranjang.css";

const rupiah = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;

function CartImage({ item }) {
  return (
    <span className="cart__image">
      {item.image ? <img src={item.image} alt="" /> : <span aria-hidden="true">{item.icon || "🛒"}</span>}
    </span>
  );
}

export default function Keranjang() {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCartItems);
  const [error, setError] = useState("");

  useEffect(() => {
    const updateCart = () => setItems(getCartItems());
    window.addEventListener(CART_UPDATED_EVENT, updateCart);
    loadCart().catch((requestError) => {
      setError(requestError.response?.data?.error?.message || "Gagal memuat keranjang. Masuk kembali lalu coba lagi.");
    });
    return () => window.removeEventListener(CART_UPDATED_EVENT, updateCart);
  }, []);

  const selectedItems = items.filter((item) => item.selected);
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const discount = originalTotal - total;

  async function updateQuantity(id, amount) {
    try {
      setError("");
      await changeCartQuantity(id, amount);
      setItems(getCartItems());
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Jumlah produk gagal diubah.");
    }
  }

  function updateSelection(id, checked) {
    setCartItemSelected(id, checked);
    setItems(getCartItems());
  }

  function toggleAll(checked) {
    setAllCartItemsSelected(checked);
    setItems(getCartItems());
  }

  async function removeSelected() {
    try {
      setError("");
      await removeSelectedCartItems();
      setItems(getCartItems());
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Produk gagal dihapus.");
    }
  }

  return (
    <main className="cart">
      <header className="cart__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
        </button>
        <h1>Keranjang</h1>
      </header>

      <section className="cart__address">
        <span className="cart__address-icon">⌂</span>
        <div>
          <strong>Alamat Pengiriman</strong>
          <p>Alamat dipilih saat checkout.</p>
        </div>
        <button type="button" onClick={() => navigate("/profil/alamat")}>Ganti</button>
      </section>

      {error && <p className="cart__message" role="alert">{error}</p>}

      <div className="cart__select-all">
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(event) => toggleAll(event.target.checked)}
            aria-label="Pilih semua produk"
          />
          <span>Pilih Semua</span>
        </label>
        <button type="button" onClick={removeSelected} disabled={!selectedItems.length}>
          <Trash2 size={11} /> Hapus
        </button>
      </div>

      {items.length ? (
        <section className="cart__items" aria-label="Produk di keranjang">
          {items.map((item) => (
            <article className="cart__item" key={item.id}>
              <input
                type="checkbox"
                checked={Boolean(item.selected)}
                onChange={(event) => updateSelection(item.id, event.target.checked)}
                aria-label={`Pilih ${item.name}`}
              />
              <CartImage item={item} />
              <div className="cart__item-info">
                <h2>{item.name}</h2>
                <small>Pack {item.unit} • 1x</small>
                <strong>{rupiah(item.price)}</strong>
                {item.originalPrice > item.price && <s>{rupiah(item.originalPrice)}</s>}
              </div>
              <div className="cart__quantity" aria-label={`Jumlah ${item.name}`}>
                <button type="button" aria-label={`Kurangi ${item.name}`} onClick={() => updateQuantity(item.id, -1)}>
                  <Minus size={10} />
                </button>
                <span>{item.quantity}</span>
                <button type="button" aria-label={`Tambah ${item.name}`} onClick={() => updateQuantity(item.id, 1)}>
                  <Plus size={10} />
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="cart__empty">
          <span>🛒</span>
          <strong>Keranjang masih kosong</strong>
          <button type="button" onClick={() => navigate("/beranda")}>Mulai Belanja</button>
        </div>
      )}

      <footer className="cart__footer">
        <button type="button" disabled={!items.length} onClick={() => navigate("/checkout")}>
          <span className="cart__total">
            {discount > 0 && <s>{rupiah(originalTotal)}</s>}
            <strong>{rupiah(total)}</strong>
          </span>
          <span>Checkout Semua ({items.length}) <ChevronRight size={14} /></span>
        </button>
      </footer>
    </main>
  );
}
