import { apiRequest } from "./client";

export function getInventory(params = {}, options = {}) {
  const query = new URLSearchParams(params);
  return apiRequest(`/api/inventory?${query.toString()}`, options);
}

export function getInventoryByProduct(productId) {
  return apiRequest(`/api/inventory/${productId}`);
}

/** إضافة كمية فوق الكمية الحالية (POST) */
export function increaseInventory(productId, quantity) {
  return apiRequest(`/api/inventory/${productId}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}

/** تعيين كمية محددة (PUT) */
export function setInventory(productId, quantity) {
  return apiRequest(`/api/inventory/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}
