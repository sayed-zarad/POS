import { apiRequest } from "./client";

export function getCategories(params = {}, options = {}) {
  const query = new URLSearchParams(params);
  return apiRequest(`/api/categories?${query.toString()}`, options);
}

export function createCategory(data) {
  return apiRequest("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(id, data) {
  return apiRequest(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deactivateCategory(id) {
  return apiRequest(`/api/categories/${id}`, { method: "DELETE" });
}
