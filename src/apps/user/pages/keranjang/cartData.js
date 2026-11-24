export const CART_STORAGE_KEY = "sembakoplus.cart.items";
export const CART_UPDATED_EVENT = "sembakoplus:cart-updated";

export const DEFAULT_CART_ITEMS = [
  {
    id: "1::250 gram",
    productId: 1,
    name: "Bayam Hijau Segar",
    unit: "250 gram",
    price: 3500,
    originalPrice: 4500,
    icon: "🥬",
    quantity: 1,
    selected: true,
  },
  {
    id: "13::500 gram",
    productId: 13,
    name: "Daging Sapi Rawon Segar Potong Pack",
    unit: "500 gram",
    price: 64000,
    originalPrice: 70000,
    icon: "🥩",
    quantity: 1,
    selected: true,
  },
  {
    id: "14::300 gram",
    productId: 14,
    name: "Fillet Ikan Laut Segar Hasil Nelayan",
    unit: "300 gram",
    price: 32000,
    originalPrice: 38000,
    icon: "🐟",
    quantity: 1,
    selected: true,
  },
];

export function getCartItems() {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (saved === null) return DEFAULT_CART_ITEMS;

  try {
    const items = JSON.parse(saved);
    if (Array.isArray(items)) return items;
    throw new TypeError("Data keranjang tersimpan bukan daftar produk.");
  } catch (error) {
    console.error("Gagal membaca data keranjang:", error);
    return DEFAULT_CART_ITEMS;
  }
}

export function saveCartItems(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function makeCartItem(product, variant) {
  const unit = variant.label ?? product.unit ?? "";
  const price = Number(variant.price ?? product.price);
  const originalPrice = Number(variant.original_price ?? product.original_price ?? price);

  return {
    id: `${product.id ?? product.name}::${unit}`,
    productId: product.id,
    name: product.name,
    unit,
    price,
    originalPrice,
    image: variant.image ?? product.image ?? "",
    icon: product.icon ?? "🛒",
    quantity: 1,
    selected: true,
  };
}

export function createCartItem(product, variant = product) {
  return makeCartItem(product, variant);
}

export function addCartItem(product, variant = product, quantity = 1) {
  const newItem = createCartItem(product, variant);
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  newItem.quantity = amount;
  const items = getCartItems();
  const existing = items.find((item) => item.id === newItem.id);

  if (existing) {
    saveCartItems(items.map((item) => (
      item.id === newItem.id ? { ...item, quantity: item.quantity + amount } : item
    )));
    return;
  }

  saveCartItems([...items, newItem]);
}

export function changeCartQuantity(id, amount) {
  const items = getCartItems()
    .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
    .filter((item) => item.quantity > 0);
  saveCartItems(items);
}

export function setCartItemSelected(id, selected) {
  saveCartItems(getCartItems().map((item) => (
    item.id === id ? { ...item, selected } : item
  )));
}

export function setAllCartItemsSelected(selected) {
  saveCartItems(getCartItems().map((item) => ({ ...item, selected })));
}

export function removeSelectedCartItems() {
  saveCartItems(getCartItems().filter((item) => !item.selected));
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
