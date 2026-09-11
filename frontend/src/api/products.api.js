import { apiRequest } from "./client";

const productListCache = new Map();

export function getProducts(params = {}, options = {}) {
  const query = new URLSearchParams(params);
  return apiRequest(`/api/products?${query.toString()}`, options);
}

export function getCachedProductList(key) {
  return productListCache.get(key);
}

export function setCachedProductList(key, result) {
  productListCache.set(key, result);
}

export function clearProductListCache() {
  productListCache.clear();
}

export function createProduct(data) {
  return apiRequest("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(id, data) {
  return apiRequest(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deactivateProduct(id) {
  return apiRequest(`/api/products/${id}`, { method: "DELETE" });
}

export function getProductById(id) {
  return apiRequest(`/api/products/${id}`);
}
