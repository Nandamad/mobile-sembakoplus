import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../shared/services/api";
import { Bell, Minus, Plus, ShoppingCart } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import {
  addCartItem,
  CART_UPDATED_EVENT,
  changeCartQuantity,
  getCartCount,
  getCartItems,
} from "../keranjang/cartData";
import "./Promo.css";

const DEMO_PROMOS = [
  { id: 7, name: "Paha Ayam Broiler", category: "Ayam & Daging", unit: "500 gram", price: 19500, original_price: 24500, icon: "🍗", sold: 38, stock: 50 },
  { id: 8, name: "Fillet Ikan Salmon", category: "Ikan Laut", unit: "250 gram", price: 26000, original_price: 32000, icon: "🐟", sold: 12, stock: 30 },
  { id: 1, name: "Bayam Hijau Segar", category: "Sayuran", unit: "250 gram", price: 3500, original_price: 4500, icon: "🥬", sold: 46, stock: 50 },
  { id: 13, name: "Daging Sapi Rawon", category: "Daging", unit: "500 gram", price: 64000, original_price: 70000, icon: "🥩", sold: 8, stock: 15 },
  { id: 2, name: "Brokoli Hijau Segar", category: "Sayuran", unit: "500 gram", price: 12000, original_price: 15000, icon: "🥦", sold: 22, stock: 35 },
  { id: 14, name: "Udang Vaname Segar", category: "Seafood", unit: "250 gram", price: 28000, original_price: 35000, icon: "🦐", sold: 16, stock: 30 },
  { id: 9, name: "Cabai Merah Besar", category: "Bumbu Dapur", unit: "250 gram", price: 11500, original_price: 15000, icon: "🌶️", sold: 31, stock: 40 },
  { id: 10, name: "Minyak Bimoli 2L", category: "Minyak Goreng", unit: "2 liter", price: 34500, original_price: 39000, icon: "🛢️", sold: 19, stock: 30 },
];

const rupiah = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;

function getPromoList(payload) {
  const promos = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(promos)) {
    throw new TypeError("Format data promo dari server tidak valid.");
  }
  return promos;
}

function PromoProduct({ product, quantity, onChangeQuantity, onOpen }) {
  const discount = product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;
  const sold = Number(product.sold) || 0;
  const stock = Number(product.stock) || 0;
  const salesProgress = stock > 0 ? Math.min(100, (sold / stock) * 100) : 0;

  return (
    <article className="promo__card">
      <button
        type="button"
        className="promo__product-open"
        onClick={() => onOpen(product)}
        aria-label={`Lihat ${product.name}`}
      >
        <span className="promo__discount">-{discount}%</span>
        <span className="promo__image">
          {product.image
            ? <img src={product.image} alt={product.name} />
            : <span aria-hidden="true">{product.icon || "🛒"}</span>}
        </span>
        <span className="promo__category">{product.category}</span>
        <strong className="promo__name">{product.name}</strong>
        <span className="promo__unit">{product.unit}</span>
        <span className="promo__price">{rupiah(product.price)}</span>
        <s className="promo__original">{rupiah(product.original_price)}</s>
      </button>

      {stock > 0 && (
        <div className="promo__sales">
          <div
            className="promo__sales-bar"
            role="progressbar"
            aria-label={`Terjual ${sold} dari stok ${stock}`}
            aria-valuemin={0}
            aria-valuemax={stock}
            aria-valuenow={Math.min(sold, stock)}
          >
            <span style={{ width: `${salesProgress}%` }} />
          </div>
          <div className="promo__sales-label">
            <strong>Terjual: {sold}</strong>
            <span>Stok: {stock}</span>
          </div>
        </div>
      )}

      <div className="promo__card-foot">
        {quantity > 0 ? (
          <div className="promo__quantity" aria-label={`Jumlah ${product.name}`}>
            <button
              type="button"
              aria-label={`Kurangi ${product.name}`}
              onClick={() => onChangeQuantity(product.id, -1)}
            >
              <Minus size={12} />
            </button>
            <strong>{quantity}</strong>
            <button
              type="button"
              aria-label={`Tambah ${product.name}`}
              onClick={() => onChangeQuantity(product.id, 1)}
            >
              <Plus size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="promo__add"
            onClick={() => onChangeQuantity(product.id, 1)}
          >
            <Plus size={12} />
            Tambah
          </button>
        )}
      </div>
    </article>
  );
}

export default function Promo() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState(DEMO_PROMOS);
  const [loadError, setLoadError] = useState("");
  const [quantities, setQuantities] = useState(() => Object.fromEntries(
    getCartItems().map((item) => [item.productId, item.quantity])
  ));
  const [cartCount, setCartCount] = useState(getCartCount);

  useEffect(() => {
    let active = true;

    api.get("/api/promos")
      .then(({ data }) => {
        const items = getPromoList(data);
        if (active) {
          setPromos(items);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active) {
          console.error("Gagal memuat promo dari API:", error);
          setLoadError("Promo contoh ditampilkan. Data promo admin belum dapat dimuat.");
        }
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());
    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
    return () => window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
  }, []);

  function changeQuantity(id, amount) {
    const product = promos.find((item) => item.id === id);
    if (product) {
      if (amount > 0) {
        addCartItem(product, product);
      } else {
        changeCartQuantity(`${product.id}::${product.unit}`, amount);
      }
    }

    setQuantities((current) => {
      const next = Math.max(0, (current[id] || 0) + amount);
      return { ...current, [id]: next };
    });
  }

  function openProduct(product) {
    navigate(`/produk/${product.id}`, { state: { product } });
  }

  return (
    <main className="promo">
      <header className="promo__header">
        <img src="/logo.svg" alt="" className="promo__logo" />
        <div className="promo__brand">
          <strong>SembakoPlus</strong>
          <span>Cilacap Tengah • Pasar Selatan</span>
        </div>
        <button type="button" className="promo__header-icon" aria-label="Notifikasi" onClick={() => navigate("/notifikasi")}>
          <Bell size={17} />
        </button>
        <button type="button" className="promo__header-icon" aria-label={`Keranjang, ${cartCount} barang`} onClick={() => navigate("/keranjang")}>
          <ShoppingCart size={17} />
          {cartCount > 0 && <i>{cartCount}</i>}
        </button>
      </header>

      <div className="promo__heading">
        <h1>Daftar Produk Sedang Diskon</h1>
        <span>{promos.length} Produk</span>
      </div>

      {loadError && <p className="promo__notice" role="status">{loadError}</p>}

      {promos.length ? (
        <section className="promo__grid" aria-label="Produk promo">
          {promos.map((product) => (
            <PromoProduct
              key={product.id}
              product={product}
              quantity={quantities[product.id] || 0}
              onChangeQuantity={changeQuantity}
              onOpen={openProduct}
            />
          ))}
        </section>
      ) : (
        <p className="promo__empty">Belum ada promo aktif saat ini.</p>
      )}

      <BottomNav />
    </main>
  );
}
