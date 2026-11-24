import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../shared/services/api";
import { Search, Bell, ShoppingCart, LayoutGrid, ArrowRight, Clock3, Zap } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import BottomNav from "../../components/BottomNav";
import { addCartItem, CART_UPDATED_EVENT, getCartCount } from "../keranjang/cartData";
import "./Beranda.css";

/* ===== DATA CONTOH =====
   Dipakai selama API Laravel belum ada. Kalau API sudah jalan,
   data dari API otomatis menggantikan ini (hapus saja setelah siap). */
const DUMMY = {
  banners: [
    { id: 1, title: "Sayur & Daging Segar Hemat s.d 40%", button_text: "Belanja Sekarang", link: "/promo", image: "", bg: "#2e6b14" },
    { id: 2, title: "Gratis Ongkir Belanja Pagi", button_text: "Lihat Promo", link: "/promo", image: "", bg: "#b8561f" },
  ],
  categories: [
    { id: "sayuran", name: "Sayuran", icon: "🥬" },
    { id: "daging", name: "Ayam & Daging", icon: "🍗" },
    { id: "ikan", name: "Ikan Laut", icon: "🐟" },
    { id: "rempah", name: "Bumbu Dapur", icon: "🌶️" },
    { id: "sembako", name: "Beras & Sembako", icon: "🍚" },
    { id: "buah", name: "Buah-buahan", icon: "🍎" },
    { id: "telur", name: "Telur & Susu", icon: "🥚" },
    { id: "instan", name: "Makanan Instan", icon: "🍜" },
    { id: "minyak", name: "Minyak Goreng", icon: "🛢️" },
    { id: "bersih", name: "Kebersihan", icon: "🧴" },
    { id: "snack", name: "Snack", icon: "🍪" },
  ],
  products: [
    {
  id: 1,
  name: "Bayam Hijau Segar",
  category: "sayuran",
  unit: "250 gram",
  price: 3500,
  icon: "🥬",
  original_price: 5000,
  rating: 4.9,
  reviews: "1.2k",
  sold: "4.8k+",
  variants: [
    { label: "250 gram", price: 3500, original_price: 5000 },
    { label: "500 gram", price: 6900, original_price: 9900 },
    { label: "1 Kilogram", price: 12000, original_price: 17000 },
  ],
  specs: [
    { label: "Kondisi", value: "Segar & Bebas Pestisida" },
    { label: "Asal Produk", value: "Pasar Sidodadi" },
    { label: "Masa Simpan", value: "3 - 4 Hari (simpan di chiller/kulkas)" },
    { label: "Pengemasan", value: "Higienis Food-Grade Wrapped Pack" },
  ],
  description: "Bayam hijau segar pilihan Grade A dari Pasar Sidodadi. Daun hijau segar, batang empuk, dikirim tanpa sisa tanah. Cocok untuk sayur bening, pecel, dan smoothie.",
  flash_sale: { active: true, price: 3500, original_price: 5000, sold: 38, stock: 50 },
},
    { id: 2, name: "Brokoli Hijau", category: "sayuran", unit: "500 gram", price: 12000, icon: "🥦" },
    { id: 3, name: "Wortel Segar", category: "sayuran", unit: "500 gram", price: 8000, icon: "🥕" },
    { id: 4, name: "Tomat Merah", category: "sayuran", unit: "500 gram", price: 6000, icon: "🍅" },
    { id: 5, name: "Terong Ungu", category: "sayuran", unit: "500 gram", price: 6320, icon: "🍆" },
    { id: 6, name: "Buncis / Ujung", category: "sayuran", unit: "500 gram", price: 7500, icon: "🫛" },
    { id: 7, name: "Paha Ayam Segar", category: "daging", unit: "500 gram", price: 24500, icon: "🍗", featured: true, flash_sale: { active: true, price: 19500, original_price: 24500, sold: 32, stock: 45 } },
    { id: 8, name: "Fillet Salmon", category: "ikan", unit: "250 gram", price: 48000, icon: "🐟", featured: true },
    { id: 9, name: "Cabai Merah Besar", category: "rempah", unit: "250 gram", price: 29000, icon: "🌶️", featured: true, flash_sale: { active: true, price: 11500, original_price: 15000, sold: 28, stock: 40 } },
    { id: 10, name: "Minyak Goreng 2L", category: "minyak", unit: "2 liter", price: 34500, icon: "🛢️" },
    { id: 11, name: "Telur Ayam Negeri", category: "telur", unit: "1 kg", price: 40000, icon: "🥚" },
    { id: 12, name: "Gula Pasir", category: "sembako", unit: "1 kg", price: 17000, icon: "🍚" },
  ],
};

const VISIBLE_CATEGORIES = 7; // sisanya muncul saat "Lainnya" ditekan

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
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);

  const b = items[i] ?? items[0];
  if (!b) return null;

  return (
    <section className="banner" style={{ background: b.bg || "#2e6b14" }}>
      <div className="banner__text">
        <h2>{b.title}</h2>
        <a href={b.link} className="banner__btn">
          {b.button_text} <ArrowRight size={14} />
        </a>
      </div>
      {b.image && <img src={b.image} alt="" className="banner__img" />}
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
  const [data, setData] = useState(DUMMY);
  const [active, setActive] = useState(null); // id kategori terpilih
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(getCartCount);
  const [flashSaleSeconds, setFlashSaleSeconds] = useState(2 * 60 * 60 + 15 * 60 + 20);
  const flashSaleProducts = getFlashSaleProducts(data.products);

  useEffect(() => {
    const updateCartCount = () => setCart(getCartCount());
    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
    return () => window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/api/banners"),
      api.get("/api/categories"),
      api.get("/api/products"),
    ])
      .then(([b, c, p]) =>
        setData({ banners: b.data, categories: c.data, products: p.data })
      )
      .catch(() => {}); // gagal / belum ada API: tetap pakai data contoh
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
      onAdd={() => addCartItem(p, { label: p.unit, price: p.price, original_price: p.original_price })}
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
                  onAdd={() => addCartItem(product, {
                    label: product.unit,
                    price: product.price,
                    original_price: product.original_price,
                  })}
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
              <a href="/pasar">Lihat Semua</a>
            </div>
            <div className="row">{data.products.filter((p) => p.featured).map(card)}</div>
          </section>

          <section>
            <div className="beranda__head">
              <h2 className="beranda__title">Kebutuhan Pokok Dapur</h2>
              <a href="/pasar">Lihat Semua</a>
            </div>
            <div className="row">
              {data.products
                .filter((p) => ["sembako", "minyak", "telur"].includes(p.category))
                .map(card)}
            </div>
          </section>
        </>
      )}

      <BottomNav />
    </main>
  );
}