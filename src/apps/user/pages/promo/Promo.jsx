import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../shared/services/api";
import { mapApiProduct } from "../../../../shared/utils/productMapper";
import { Bell, Minus, Plus, ShoppingCart } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import {
  addCartItem,
  CART_UPDATED_EVENT,
  changeCartQuantity,
  getCartCount,
  getCartItems,
  loadCart,
} from "../keranjang/cartData";
import "./Promo.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function PromoProduct({ product, quantity, onChangeQuantity, onOpen }) {
  const discount = product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;
  const stock = Number(product.stock) || 0;

  return (
    <article className="promo__card">
      <button
        type="button"
        className="promo__product-open"
        onClick={() => onOpen(product)}
        aria-label={`Lihat ${product.name}`}
      >
        {discount > 0 && <span className="promo__discount">-{discount}%</span>}
        <span className="promo__image">
          {product.image
            ? <img src={product.image} alt={product.name} />
            : <span aria-hidden="true">🛒</span>}
        </span>
        <span className="promo__category">{product.categoryName || "Promo"}</span>
        <strong className="promo__name">{product.name}</strong>
        <span className="promo__unit">{product.unit}</span>
        <span className="promo__price">{rupiah(product.price)}</span>
        {product.original_price > product.price && (
          <s className="promo__original">{rupiah(product.original_price)}</s>
        )}
      </button>

      {stock > 0 && (
        <div className="promo__sales">
          <div className="promo__sales-label">
            <span>Stok tersedia: {stock}</span>
          </div>
        </div>
      )}

      <div className="promo__card-foot">
        {quantity > 0 ? (
          <div className="promo__quantity" aria-label={`Jumlah ${product.name}`}>
            <button
              type="button"
              aria-label={`Kurangi ${product.name}`}
              onClick={() => onChangeQuantity(product, -1)}
            >
              <Minus size={12} />
            </button>
            <strong>{quantity}</strong>
            <button
              type="button"
              aria-label={`Tambah ${product.name}`}
              onClick={() => onChangeQuantity(product, 1)}
            >
              <Plus size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="promo__add"
            disabled={stock < 1}
            onClick={() => onChangeQuantity(product, 1)}
          >
            <Plus size={12} />
            {stock < 1 ? "Habis" : "Tambah"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function Promo() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cartItems, setCartItems] = useState(getCartItems);
  const [cartCount, setCartCount] = useState(getCartCount);

  useEffect(() => {
    let active = true;
    api.get("/products", { params: { discounted: 1, per_page: 50 } })
      .then(({ data }) => {
        if (!active) return;
        const list = (data?.data ?? []).map(mapApiProduct).filter((item) => item?.hasDiscount);
        setPromos(list);
        setLoadError("");
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.response?.data?.error?.message || "Gagal memuat produk diskon dari server.");
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const syncCart = () => {
      setCartItems(getCartItems());
      setCartCount(getCartCount());
    };
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    if (localStorage.getItem("sembakoplus.auth.token")) {
      loadCart().catch(() => {});
    }
    return () => window.removeEventListener(CART_UPDATED_EVENT, syncCart);
  }, []);

  async function changeQuantity(product, amount) {
    const defaultVariant = product.variants?.find((variant) => variant.is_default) ?? product.variants?.[0];
    if (!defaultVariant?.id) return;

    try {
      setActionError("");
      if (amount > 0) {
        await addCartItem(product, defaultVariant, amount);
      } else {
        const existing = cartItems.find((item) => item.productVariantId === defaultVariant.id);
        if (existing) {
          await changeCartQuantity(existing.id, -1);
        }
      }
    } catch (error) {
      setActionError(error.response?.data?.error?.message || error.message || "Keranjang gagal diperbarui.");
    }
  }

  function quantityFor(product) {
    const defaultVariant = product.variants?.find((variant) => variant.is_default) ?? product.variants?.[0];
    if (!defaultVariant?.id) return 0;
    return cartItems.find((item) => item.productVariantId === defaultVariant.id)?.quantity ?? 0;
  }

  return (
    <main className="promo">
      <header className="promo__header">
        <img src="/logo.svg" alt="" className="promo__logo" />
        <div className="promo__brand">
          <strong>SembakoPlus</strong>
          <span>Promo Produk Diskon</span>
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

      {(loadError || actionError) && <p className="promo__notice" role="alert">{loadError || actionError}</p>}
      {loading && <p className="promo__empty">Memuat produk promo...</p>}

      {!loading && !loadError && (
        promos.length ? (
          <section className="promo__grid" aria-label="Produk promo">
            {promos.map((product) => (
              <PromoProduct
                key={product.id}
                product={product}
                quantity={quantityFor(product)}
                onChangeQuantity={changeQuantity}
                onOpen={(item) => navigate(`/produk/${item.id}`, { state: { product: item } })}
              />
            ))}
          </section>
        ) : (
          <p className="promo__empty">Belum ada produk promo aktif saat ini.</p>
        )
      )}

      <BottomNav />
    </main>
  );
}
