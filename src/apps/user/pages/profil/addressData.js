import api from "../../../../shared/services/api";

function mapAddress(address) {
  return {
    ...address,
    primary: Boolean(address.is_default),
    contact: `${address.recipient_name} (${address.phone})`,
    note: address.address_notes,
  };
}

export async function getAddresses() {
  const response = await api.get("/profile/addresses");
  return (response.data?.data ?? []).map(mapAddress);
}

export async function saveAddress(address) {
  const response = await api.post("/profile/addresses", address);
  return mapAddress(response.data.data);
}

export async function updateAddress(id, address) {
  const response = await api.patch(`/profile/addresses/${id}`, address);
  return mapAddress(response.data.data);
}

export async function setPrimaryAddress(id) {
  const response = await api.patch(`/profile/addresses/${id}`, { is_default: true });
  return mapAddress(response.data.data);
}

export async function deleteAddress(id) {
  await api.delete(`/profile/addresses/${id}`);
}
