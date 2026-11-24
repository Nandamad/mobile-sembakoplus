export const ADDRESS_STORAGE_KEY = "sembakoplus.profile.addresses";

export const DEFAULT_ADDRESSES = [
  {
    label: "Rumah Hanif",
    primary: true,
    contact: "Hanif S. (0812-3456-7890)",
    address: "Jl. Jend. Sudirman No. 42, RT 03 / RW 05, Kel. Sidakaya Kec. Cilacap Selatan, Kab. Cilacap, Jawa Tengah 53211",
    note: "Titik GPS Sesuai • Pagar hitam samping warung Bu Siti",
  },
  {
    label: "Kantor PT GDS (Sinergi Hub)",
    primary: false,
    contact: "Hanif S. (0812-3456-7890)",
    address: "Gedung Sinergi Hub Lt. 2, Ruang Operasional, Jl. Gatot Subroto No. 18, Cilacap Tengah 53223",
  },
];

export function getAddresses() {
  const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
  if (!saved) return DEFAULT_ADDRESSES;

  try {
    const addresses = JSON.parse(saved);
    if (Array.isArray(addresses)) return addresses;
    throw new TypeError("Data alamat tersimpan bukan daftar alamat.");
  } catch (error) {
    console.error("Gagal membaca daftar alamat tersimpan:", error);
    return DEFAULT_ADDRESSES;
  }
}

export function saveAddress(newAddress) {
  const addresses = getAddresses();
  const updated = addresses.map((address) => ({
    ...address,
    primary: newAddress.primary ? false : address.primary,
  }));
  updated.push(newAddress);
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
}

export function updateAddress(addressIndex, updatedAddress) {
  const addresses = getAddresses();
  if (!Number.isInteger(addressIndex) || addressIndex < 0 || addressIndex >= addresses.length) {
    throw new RangeError("Alamat yang akan diubah tidak ditemukan.");
  }

  const wasPrimary = addresses[addressIndex].primary;
  const updated = addresses.map((address, index) => {
    if (updatedAddress.primary) {
      return index === addressIndex
        ? { ...updatedAddress, primary: true }
        : { ...address, primary: false };
    }
    if (index === addressIndex) {
      return { ...updatedAddress, primary: false };
    }
    return address;
  });

  if (wasPrimary && !updatedAddress.primary && updated.length) {
    updated[0].primary = true;
  }
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
}

export function setPrimaryAddress(addressIndex) {
  const addresses = getAddresses();
  if (!Number.isInteger(addressIndex) || addressIndex < 0 || addressIndex >= addresses.length) {
    throw new RangeError("Alamat yang akan dijadikan utama tidak ditemukan.");
  }
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(
    addresses.map((address, index) => ({ ...address, primary: index === addressIndex }))
  ));
}

export function deleteAddress(addressIndex) {
  const addresses = getAddresses();
  if (!Number.isInteger(addressIndex) || addressIndex < 0 || addressIndex >= addresses.length) {
    throw new RangeError("Alamat yang akan dihapus tidak ditemukan.");
  }

  const wasPrimary = addresses[addressIndex].primary;
  const updated = addresses.filter((_, index) => index !== addressIndex);
  if (wasPrimary && updated.length) updated[0].primary = true;
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
}
