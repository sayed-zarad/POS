import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
} from "../api/categories.api";
import { useAuth } from "../context/AuthContext";

export default function Categories() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthLoading || user?.role !== "ADMIN") {
      return undefined;
    }

    const controller = new AbortController();

    getCategories({ page: 1, limit: 100 }, { signal: controller.signal })
      .then((result) => setCategories(result.data))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [isAuthLoading, user?.role]);

  function resetForm() {
    setName("");
    setEditingCategory(null);
    setError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, { name: trimmedName });
        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === result.data.id ? result.data : category,
          ),
        );
      } else {
        const result = await createCategory({ name: trimmedName });
        setCategories((currentCategories) => [...currentCategories, result.data]);
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(category) {
    setEditingCategory(category);
    setName(category.name);
    setError(null);
  }

  async function handleDeactivate(category) {
    const shouldDeactivate = window.confirm(
      `Deactivate "${category.name}"? It will no longer be available in the POS.`,
    );

    if (!shouldDeactivate) {
      return;
    }

    setError(null);
    try {
      await deactivateCategory(category.id);
      setCategories((currentCategories) =>
        currentCategories.filter((item) => item.id !== category.id),
      );
      if (editingCategory?.id === category.id) {
        resetForm();
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (isAuthLoading) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page category-management-page">
      <div className="container category-management-layout">
        <section>
          <p className="pos-section-eyebrow">Catalog management</p>
          <h1 className="page-title">Categories</h1>
          <p className="category-management-intro">
            Create, rename, or deactivate the categories available at the point of sale.
          </p>
        </section>

        <section className="category-form-card">
          <h2>{editingCategory ? "Edit category" : "Add category"}</h2>
          <form onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="category-name">Category name</label>
            <input
              className="form-input"
              id="category-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Beverages"
              value={name}
            />
            {error && <p className="form-error category-form-error">{error}</p>}
            <div className="category-form-actions">
              {editingCategory && (
                <button className="btn btn-secondary" onClick={resetForm} type="button">
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : editingCategory ? "Save changes" : "Add category"}
              </button>
            </div>
          </form>
        </section>

        <section className="category-list-card">
          <div className="category-list-header">
            <h2>Active categories</h2>
            <span>{categories.length}</span>
          </div>
          {isLoading ? (
            <p className="category-list-state">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="category-list-state">No active categories yet.</p>
          ) : (
            <div className="category-list">
              {categories.map((category) => (
                <article className="category-list-item" key={category.id}>
                  <div>
                    <h3>{category.name}</h3>
                    <span>{category.productsCount} products</span>
                  </div>
                  <div className="category-item-actions">
                    <button className="category-edit-button" onClick={() => startEditing(category)} type="button">
                      Edit
                    </button>
                    <button className="category-deactivate-button" onClick={() => handleDeactivate(category)} type="button">
                      Deactivate
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
