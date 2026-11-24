export const PAYMENT_METHOD_STORAGE_KEY = "sembakoplus.profile.payment-method";

export function getPrimaryPaymentMethod() {
  return localStorage.getItem(PAYMENT_METHOD_STORAGE_KEY) === "cod" ? "cod" : "qris";
}

export function savePrimaryPaymentMethod(method) {
  if (method !== "qris" && method !== "cod") {
    throw new TypeError("Metode pembayaran tidak dikenal.");
  }
  localStorage.setItem(PAYMENT_METHOD_STORAGE_KEY, method);
}
