import api from "../../../../shared/services/api";

export const CART_UPDATED_EVENT = "sembakoplus:cart-updated";
let cartItems = [];
let cartLoaded = false;

function mapItem(item) {
  const product = item.product ?? {};
  return {
    id: item.id,
    productVariantId: item.product_variant_id,
    productId: product.id,
    name: item.product_name,
    unit: item.variant_name,
    price: Number(item.effective_unit_price ?? item.unit_price ?? 0),
    originalPrice: Number(item.unit_price ?? 0),
    image: product.image_url ?? "",
    icon: "🛒",
    quantity: Number(item.quantity ?? 0),
    selected: true,
    stockAvailable: Number(item.stock_available ?? 0),
    isAvailable: Boolean(item.is_available),
  };
}

function setItems(items) {
  cartItems = items.map(mapItem);
  cartLoaded = true;
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  return cartItems;
}

export async function loadCart() {
  const response = await api.get("/cart");
  return setItems(response.data?.data?.items ?? []);
}

export function getCartItems() {
  return cartItems;
}

export function getCartCount() {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

export async function addCartItem(product, variant = product, quantity = 1) {
  if (!localStorage.getItem("sembakoplus.auth.token")) {
    throw new Error("Silakan login sebelum menambahkan produk ke keranjang.");
  }
  const productVariantId = variant?.id;
  if (!productVariantId) throw new Error("Varian produk tidak memiliki ID backend.");

  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  const snapshot = cartItems.map((item) => ({ ...item }));
  const existing = cartItems.find((item) => Number(item.productVariantId) === Number(productVariantId));
  if (existing) {
    cartItems = cartItems.map((item) => item.id === existing.id ? { ...item, quantity: item.quantity + amount } : item);
  } else {
    cartItems = [...cartItems, {
      id: `pending-${productVariantId}`,
      productVariantId,
      productId: product.id,
      name: product.name,
      unit: variant.name ?? variant.label ?? product.unit ?? "",
      price: Number(variant.price ?? product.price ?? 0),
      originalPrice: Number(variant.original_price ?? variant.price ?? product.price ?? 0),
      image: product.image_url ?? product.image ?? "",
      icon: "🛒",
      quantity: amount,
      selected: true,
      stockAvailable: Number(variant.stock ?? 0),
      isAvailable: true,
    }];
  }
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));

  try {
    const response = await api.post("/cart/items", {
      product_variant_id: productVariantId,
      quantity: amount,
    });
    const serverItem = response.data?.data;
    if (serverItem?.id != null) {
      const confirmed = mapItem(serverItem);
      cartItems = cartItems.filter((item) =>
        Number(item.productVariantId) !== Number(productVariantId) && item.id !== `pending-${productVariantId}`
      );
      cartItems.push(confirmed);
      cartLoaded = true;
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    } else {
      await loadCart();
    }
    return cartItems;
  } catch (error) {
    cartItems = snapshot;
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    throw error;
  }
}

export async function changeCartQuantity(id, amount) {
  const current = cartItems.find((item) => item.id === id);
  const quantity = (current?.quantity ?? 0) + amount;
  if (quantity <= 0) {
    await api.delete(`/cart/items/${id}`);
  } else {
    await api.patch(`/cart/items/${id}`, { quantity });
  }
  return loadCart();
}

export async function setCartItemQuantity(id, quantity) {
  if (quantity <= 0) return changeCartQuantity(id, -999999);
  await api.patch(`/cart/items/${id}`, { quantity });
  return loadCart();
}

export async function removeCartItem(id) {
  await api.delete(`/cart/items/${id}`);
  return loadCart();
}

export function setCartItemSelected(id, selected) {
  cartItems = cartItems.map((item) => item.id === id ? { ...item, selected } : item);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function setAllCartItemsSelected(selected) {
  cartItems = cartItems.map((item) => ({ ...item, selected }));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export async function removeSelectedCartItems() {
  const selected = cartItems.filter((item) => item.selected);
  await Promise.all(selected.map((item) => api.delete(`/cart/items/${item.id}`)));
  return loadCart();
}

export function isCartLoaded() {
  return cartLoaded;
}
