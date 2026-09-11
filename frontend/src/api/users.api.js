import { apiRequest } from "./client";

export function getUsers(params = {}, options = {}) {
  const query = new URLSearchParams(params);
  return apiRequest(`/api/users?${query.toString()}`, options);
}

export function getUser(id, options = {}) {
  return apiRequest(`/api/users/${id}`, options);
}

export function createUser(data) {
  return apiRequest("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(id, data) {
  return apiRequest(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id) {
  return apiRequest(`/api/users/${id}`, {
    method: "DELETE",
  });
}
