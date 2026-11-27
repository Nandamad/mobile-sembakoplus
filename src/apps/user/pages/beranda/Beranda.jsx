import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../shared/services/api";
import { Search, Bell, ShoppingCart, LayoutGrid, ArrowRight, Clock3, Zap } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import BottomNav from "../../components/BottomNav";
import { addCartItem, CART_UPDATED_EVENT, getCartCount, loadCart } from "../keranjang/cartData";
import { mapApiProduct } from "../../../../shared/utils/productMapper";
import "./Beranda.css";

const VISIBLE_CATEGORIES = 7; // sisanya muncul saat "Lainnya" ditekan
const CATALOG_CACHE_KEY = "sembakoplus.catalog.cache.v1";
const CATALOG_CACHE_TTL = 60 * 1000;

function readCatalogCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CATALOG_CACHE_KEY) || "null");
    if (!cached?.savedAt || Date.now() - cached.savedAt > CATALOG_CACHE_TTL) return null;
    return cached.data ?? null;
  } catch {
    return null;
  }
}

function writeCatalogCache(data) {
  try {
    sessionStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage penuh/private mode: API tetap menjadi sumber data.
  }
}

function normalizeCatalog(homeResponse, categoryResponse, productResponse) {
  const home = homeResponse.data?.data ?? {};
  const categories = categoryResponse.data?.data ?? [];
  const products = productResponse.data?.data ?? [];
  return {
    banners: (home.banners ?? []).map((banner) => ({
      ...banner,
      image: banner.image_url ?? banner.image ?? "",
      bg: banner.background_color ?? banner.bg ?? "#2e6b14",
    })),
    categories: categories.map((category) => ({ ...category, icon: category.icon ?? "🛒" })),
    products: products.map(mapApiProduct),
  };
}

function getFlashSaleProducts(products) {
  return products.flatMap((product) => {
    const sale = product.flash_sale;
    if (!sale || typeof sale !== "object" || sale.active === false) return [];

    const price = Number(sale.price);
    const originalPrice = Number(sale.original_price ?? product.original_price);
    if (!Number.isFinite(price) || !Number.isFinite(originalPrice) || price >= originalPrice) return [];

    return [{
      ...product,
      price,
      original_price: originalPrice,
      flashSale: {
        ...sale,
        sold: Math.max(0, Number(sale.sold) || 0),
        stock: Math.max(0, Number(sale.stock) || 0),
      },
    }];
  });
}

function formatCountdown(seconds) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${remainder}`;
}

function FlashSaleCard({ product, onOpen, onAdd }) {
  const discount = Math.round((1 - product.price / product.original_price) * 100);
  const { sold, stock } = product.flashSale;
  const progress = stock > 0 ? Math.min(100, (sold / stock) * 100) : 0;

  return (
    <article className="flash-sale__card">
      <button type="button" className="flash-sale__product" onClick={onOpen}>
        <span className="flash-sale__image">
          {product.image
            ? <img src={product.image} alt={product.name} />
            : <span aria-hidden="true">{product.icon || "🛒"}</span>}
          <span className="flash-sale__discount">-{discount}%</span>
        </span>
        <strong className="flash-sale__name">{product.name}</strong>
        <small className="flash-sale__unit">{product.unit}</small>
        <span className="flash-sale__price">{`Rp ${product.price.toLocaleString("id-ID")}`}</span>
        <s className="flash-sale__original">{`Rp ${product.original_price.toLocaleString("id-ID")}`}</s>
      </button>
      {stock > 0 && (
        <div className="flash-sale__stock">
          <span role="progressbar" aria-label={`Terjual ${sold} dari stok flash sale ${stock}`} aria-valuemin={0} aria-valuemax={stock} aria-valuenow={Math.min(sold, stock)}>
            <i style={{ width: `${progress}%` }} />
          </span>
          <small>{sold}/{stock} terjual</small>
        </div>
      )}
      <button type="button" className="flash-sale__add" onClick={onAdd}>+ Tambah</button>
    </article>
  );
}

function Banners({ items }) {
  const navigate = useNavigate();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);

  const b = items[i] ?? items[0];
  if (!b) return null;

  function openBanner() {
    if (b.target_type === "product" && b.target_id) {
      navigate(`/produk/${b.target_id}`);
    } else if (b.target_type === "internal_path" && b.target_path?.startsWith("/")) {
      navigate(b.target_path);
    } else if (b.link?.startsWith("/")) {
      navigate(b.link);
    }
  }

  return (
    <section className="banner" style={{ background: b.bg || "#2e6b14" }}>
      <div className="banner__text">
        <h2>{b.title}</h2>
        {(b.target_type && b.target_type !== "none") || b.link ? (
          <button type="button" className="banner__btn" onClick={openBanner}>
            {b.button_text || "Lihat Detail"} <ArrowRight size={14} />
          </button>
        ) : null}
      </div>
      {b.image && <img src={b.image} alt={b.alt_text || b.title || ""} className="banner__img" />}
      <div className="banner__dots">
        {items.map((x, n) => (
          <button
            key={x.id}
            className={n === i ? "is-on" : ""}
            onClick={() => setI(n)}
            aria-label={`Banner ${n + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function Categories({ items, active, onPick }) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, VISIBLE_CATEGORIES);

  return (
    <section className="cats">
      {shown.map((c) => (
        <button
          key={c.id}
          className={"cat" + (active === c.id ? " is-active" : "")}
          onClick={() => onPick(c.id)}
        >
          <span className="cat__icon">
            {c.image ? <img src={c.image} alt="" /> : c.icon}
          </span>
          <span className="cat__name">{c.name}</span>
        </button>
      ))}
      {items.length > VISIBLE_CATEGORIES && (
        <button className="cat" onClick={() => setOpen(!open)}>
          <span className="cat__icon cat__icon--more"><LayoutGrid size={20} /></span>
          <span className="cat__name">{open ? "Tutup" : "Lainnya"}</span>
        </button>
      )}
    </section>
  );
}

export default function Beranda() {
  const navigate = useNavigate();
  const [data, setData] = useState(() => readCatalogCache() ?? { banners: [], categories: [], products: [] });
  const [active, setActive] = useState(null); // id kategori terpilih
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(getCartCount);
  const [actionMessage, setActionMessage] = useState("");
  const [flashSaleSeconds, setFlashSaleSeconds] = useState(2 * 60 * 60 + 15 * 60 + 20);

  async function handleAddProduct(product, variant) {
    try {
      const addPromise = addCartItem(product, variant);
      setActionMessage(`${product.name} ditambahkan ke keranjang.`);
      await addPromise;
      setActionMessage(`${product.name} masuk keranjang.`);
    } catch (error) {
      setActionMessage(error.response?.data?.error?.message || error.message || "Produk gagal dimasukkan ke keranjang.");
    }
  }
  const flashSaleProducts = getFlashSaleProducts(data.products);

  useEffect(() => {
    const updateCartCount = () => setCart(getCartCount());
    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
    if (localStorage.getItem("sembakoplus.auth.token")) {
      loadCart().catch((error) => console.error("Gagal memuat keranjang", error));
    }
    return () => window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
  }, []);

  useEffect(() => {
    let activeRequest = true;
    Promise.all([api.get("/home"), api.get("/categories"), api.get("/products")])
      .then(([homeResponse, categoryResponse, productResponse]) => {
        if (!activeRequest) return;
        const catalog = normalizeCatalog(homeResponse, categoryResponse, productResponse);
        writeCatalogCache(catalog);
        setData(catalog);
      })
      .catch((error) => {
        console.error("Gagal memuat katalog SembakoPlus API", error);
      });
    return () => { activeRequest = false; };
  }, []);

  useEffect(() => {
    if (!flashSaleProducts.length) return undefined;
    const timer = window.setInterval(() => {
      setFlashSaleSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [flashSaleProducts.length]);

  const q = query.trim().toLowerCase();
  const catName = (id) => data.categories.find((c) => c.id === id)?.name;
  const matched = data.products.filter((p) => p.name.toLowerCase().includes(q));
  const showGrid = active || q;
  const list = active ? matched.filter((p) => p.category === active) : matched;

  const card = (p) => (
    <ProductCard
      key={p.id}
      product={p}
      label={catName(p.category)}
      onAdd={() => handleAddProduct(p, p.variants?.find((variant) => variant.is_default) ?? p.variants?.[0])}
    />
  );

  return (
    <main className="beranda">
      <header className="beranda__top">
        <img src="/logo.svg" alt="" className="beranda__logo" />
        <div className="beranda__brand">
          <strong>SembakoPlus</strong>
          <span>Cilacap Tengah • Pasar Selatan</span>
        </div>
        <Link to="/notifikasi" className="beranda__icon" aria-label="Notifikasi">
          <Bell size={18} />
        </Link>
        <Link to="/keranjang" className="beranda__icon" aria-label="Keranjang">
          <ShoppingCart size={18} />
          {cart > 0 && <i className="beranda__badge">{cart}</i>}
        </Link>
      </header>

      <div className="beranda__search">
        <Search size={16} />
        <input
          placeholder="Cari sayur, ayam, daging, sembako..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {actionMessage && <p className="beranda__cart-message" role="status">{actionMessage}</p>}

      {!showGrid && <Banners items={data.banners} />}

      <Categories
        items={data.categories}
        active={active}
        onPick={(id) => setActive(id === active ? null : id)}
      />

      {!showGrid && flashSaleProducts.length > 0 && (
        <section className="flash-sale" aria-label="Flash sale">
          <div className="flash-sale__head">
            <h2><Zap size={15} fill="currentColor" /> FLASH SALE</h2>
            <span className="flash-sale__countdown" aria-label={`Berakhir dalam ${formatCountdown(flashSaleSeconds)}`}>
              <Clock3 size={10} /> {formatCountdown(flashSaleSeconds)}
            </span>
            <Link to="/promo">Lihat Semua <ArrowRight size={10} /></Link>
          </div>
          <div className="flash-sale__row">
            {flashSaleProducts.map((product) => {
              const productForDetail = {
                ...product,
                variants: product.variants?.length
                  ? product.variants.map((variant, index) => index === 0
                    ? { ...variant, price: product.price, original_price: product.original_price }
                    : variant)
                  : [{ label: product.unit, price: product.price, original_price: product.original_price }],
              };

              return (
                <FlashSaleCard
                  key={product.id}
                  product={product}
                  onOpen={() => navigate(`/produk/${product.id}`, { state: { product: productForDetail } })}
                  onAdd={() => handleAddProduct(product, product.variants?.find((variant) => variant.is_default) ?? product.variants?.[0])}
                />
              );
            })}
          </div>
        </section>
      )}

      {showGrid ? (
        <section>
          <h2 className="beranda__title">{catName(active) || "Hasil pencarian"}</h2>
          {list.length ? (
            <div className="grid">{list.map(card)}</div>
          ) : (
            <p className="beranda__empty">Produk belum tersedia.</p>
          )}
        </section>
      ) : (
        <>
          <section>
            <div className="beranda__head">
              <h2 className="beranda__title">Pilihan Terbaik</h2>
              <Link to="/promo">Lihat Promo</Link>
            </div>
            <div className="row">{data.products.slice(0, 6).map(card)}</div>
          </section>

          <section>
            <div className="beranda__head">
              <h2 className="beranda__title">Kebutuhan Pokok Dapur</h2>
              <button type="button" onClick={() => setActive(data.categories[0]?.id ?? null)}>Lihat Semua</button>
            </div>
            <div className="row">
              {data.products.map(card)}
            </div>
          </section>
        </>
      )}

      <BottomNav />
    </main>
  );
}