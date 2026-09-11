import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api/categories.api";
import {
  getInventory,
  increaseInventory,
  setInventory,
} from "../api/inventory.api";

const PAGE_SIZE = 20;

export default function Inventory() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [inventory, setInventory_] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);

  // Editing
  const [editingItem, setEditingItem] = useState(null); // { productId, mode: 'set'|'add', value }
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Load categories once
  useEffect(() => {
    if (isAuthLoading || user?.role !== "ADMIN") return;
    getCategories({ page: 1, limit: 100 })
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, [isAuthLoading, user?.role]);

  // Load inventory whenever filters change
  useEffect(() => {
    if (isAuthLoading || user?.role !== "ADMIN") return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params = {
      page,
      limit: PAGE_SIZE,
      sortOrder,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
      ...(lowStock ? { lowStock: "true" } : {}),
    };

    getInventory(params, { signal: controller.signal })
      .then((res) => {
        setInventory_(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [
    isAuthLoading,
    user?.role,
    page,
    search,
    selectedCategoryId,
    lowStock,
    sortOrder,
  ]);

  function resetFilters() {
    setSearch("");
    setSelectedCategoryId("");
    setLowStock(false);
    setSortOrder("asc");
    setPage(1);
  }

  function startEdit(item, mode) {
    setEditingItem({ productId: item.productId, mode, value: "" });
    setSaveError(null);
  }

  function cancelEdit() {
    setEditingItem(null);
    setSaveError(null);
  }

  async function handleSave() {
    const qty = Number(editingItem.value);
    if (
      !Number.isFinite(qty) ||
      qty < 0 ||
      (editingItem.mode === "add" && qty <= 0)
    ) {
      setSaveError(
        editingItem.mode === "add"
          ? "أدخل كمية موجبة."
          : "أدخل كمية صحيحة (0 أو أكثر).",
      );
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const res =
        editingItem.mode === "add"
          ? await increaseInventory(editingItem.productId, qty)
          : await setInventory(editingItem.productId, qty);

      setInventory_((prev) =>
        prev.map((item) =>
          item.productId === editingItem.productId ? res.data : item,
        ),
      );
      cancelEdit();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading) return null;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  const hasMore = pagination && page < pagination.totalPages;

  return (
    <main className="page inventory-page">
      <div className="container">
        {/* Header */}
        <section className="inventory-header">
          <div>
            <p className="pos-section-eyebrow">إدارة المخزون</p>
            <h1 className="page-title">المخزون</h1>
          </div>
          {pagination && (
            <span className="pos-products-count">{pagination.total} منتج</span>
          )}
        </section>

        {/* Filters */}
        <div className="inventory-filters">
          <input
            className="form-input"
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="form-input"
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">كل الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="form-input"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
          >
            <option value="asc">الكمية: الأقل أولاً</option>
            <option value="desc">الكمية: الأكثر أولاً</option>
          </select>
          <label className="inventory-low-stock-label">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => {
                setLowStock(e.target.checked);
                setPage(1);
              }}
            />
            مخزون منخفض فقط (≤ 10)
          </label>
          <button
            className="btn btn-secondary"
            onClick={resetFilters}
            type="button"
          >
            إعادة تعيين
          </button>
        </div>

        {/* Error */}
        {error && <p className="error-message">{error}</p>}

        {/* Table */}
        {isLoading ? (
          <p className="category-list-state">جاري تحميل المخزون...</p>
        ) : inventory.length === 0 ? (
          <p className="category-list-state">لا توجد نتائج.</p>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>القسم</th>
                  <th>الكمية</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isEditing = editingItem?.productId === item.productId;
                  const isLow = item.quantity <= 10;

                  return (
                    <tr
                      key={item.id}
                      className={isLow ? "inventory-row-low" : ""}
                    >
                      <td className="inventory-product-cell">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="inventory-product-img"
                          />
                        )}
                        <span>{item.product?.name ?? "—"}</span>
                      </td>
                      <td>{item.product?.category?.name ?? "—"}</td>
                      <td className="inventory-qty">{item.quantity}</td>
                      <td>
                        <span
                          className={`inventory-badge ${isLow ? "inventory-badge-low" : "inventory-badge-ok"}`}
                        >
                          {isLow ? "منخفض" : "متاح"}
                        </span>
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="inventory-edit-row">
                            <span className="inventory-edit-mode-label">
                              {editingItem.mode === "add"
                                ? "إضافة كمية"
                                : "تعيين كمية"}
                            </span>
                            <input
                              autoFocus
                              className="form-input inventory-edit-input"
                              min={editingItem.mode === "set" ? 0 : 1}
                              step="1"
                              type="number"
                              value={editingItem.value}
                              onChange={(e) =>
                                setEditingItem((prev) => ({
                                  ...prev,
                                  value: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave();
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                            {saveError && (
                              <span className="form-error">{saveError}</span>
                            )}
                            <button
                              className="btn btn-primary btn-small"
                              disabled={isSaving}
                              onClick={handleSave}
                              type="button"
                            >
                              {isSaving ? "..." : "حفظ"}
                            </button>
                            <button
                              className="btn btn-secondary btn-small"
                              disabled={isSaving}
                              onClick={cancelEdit}
                              type="button"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <div className="inventory-actions">
                            <button
                              className="category-edit-button"
                              onClick={() => startEdit(item, "add")}
                              type="button"
                            >
                              + إضافة
                            </button>
                            <button
                              className="category-edit-button"
                              onClick={() => startEdit(item, "set")}
                              type="button"
                            >
                              تعيين
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {hasMore && (
          <div className="pos-load-more">
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              تحميل المزيد
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
