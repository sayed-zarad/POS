import { apiRequest } from "./client";

/**
 * Create a new sale.
 * @param {{ items: {productId: number, quantity: number}[], discountAmount?: number, taxRate?: number }} data
 */
export function createSale(data) {
  return apiRequest("/api/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** List all sales (ADMIN only). */
export function getSales(params = {}) {
  const query = new URLSearchParams(params);
  return apiRequest(`/api/sales?${query.toString()}`);
}

/** Get a single sale by id (ADMIN only). */
export function getSaleById(id) {
  return apiRequest(`/api/sales/${id}`);
}

/** Cancel a sale and restore inventory (ADMIN only). */
export function cancelSale(id) {
  return apiRequest(`/api/sales/${id}/cancel`, { method: "PATCH" });
}
