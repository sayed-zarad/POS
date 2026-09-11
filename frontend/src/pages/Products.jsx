import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getCategories } from "../api/categories.api";
import {
  clearProductListCache,
  deactivateProduct,
  getProducts,
  updateProduct,
} from "../api/products.api";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: "", categoryId: "", price: "", image: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthLoading || user?.role !== "ADMIN") return undefined;
    const controller = new AbortController();

    Promise.all([
      getProducts({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }, { signal: controller.signal }),
      getCategories({ page: 1, limit: 100 }, { signal: controller.signal }),
    ])
      .then(([productsResult, categoriesResult]) => {
        setProducts(productsResult.data);
        setCategories(categoriesResult.data);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [isAuthLoading, user?.role]);

  function startEditing(product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      categoryId: String(product.categoryId),
      price: String(product.price),
      image: product.image || "",
    });
    setError(null);
  }

  function cancelEditing() {
    setEditingProduct(null);
    setForm({ name: "", categoryId: "", price: "", image: "" });
    setError(null);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function saveProduct(event) {
    event.preventDefault();
    const price = Number(form.price);
    if (!editingProduct || form.name.trim().length < 2 || !form.categoryId || !Number.isFinite(price) || price < 0) {
      setError("Enter a name, category, and valid price.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const result = await updateProduct(editingProduct.id, {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        price,
        image: form.image.trim() || null,
      });
      setProducts((currentProducts) => currentProducts.map((product) => product.id === result.data.id ? result.data : product));
      clearProductListCache();
      cancelEditing();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(product) {
    if (!window.confirm(`Deactivate "${product.name}"? It will be removed from the point of sale.`)) return;

    setError(null);
    try {
      await deactivateProduct(product.id);
      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));
      clearProductListCache();
      if (editingProduct?.id === product.id) cancelEditing();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (isAuthLoading) return null;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return (
    <main className="page product-management-page">
      <div className="container product-management-layout">
        <section className="product-management-heading">
          <div>
            <p className="pos-section-eyebrow">Catalog management</p>
            <h1 className="page-title">Products</h1>
          </div>
          <Link className="btn btn-primary" to="/products/new">+ Add new product</Link>
        </section>

        <section className="product-management-list-card">
          <div className="product-management-list-header"><h2>Active products</h2><span>{products.length}</span></div>
          {isLoading ? <p className="category-list-state">Loading products...</p> : products.length === 0 ? <p className="category-list-state">No active products yet.</p> : (
            <div className="product-management-list">
              {products.map((product) => (
                <article className="product-management-item" key={product.id}>
                  <img alt="" className="product-management-image" src={product.image || "https://placehold.co/96x96?text=Product"} />
                  <div className="product-management-info"><h3>{product.name}</h3><span>{product.category?.name || "No category"} · ${Number(product.price).toFixed(2)}</span></div>
                  <div className="category-item-actions">
                    <button className="category-edit-button" onClick={() => startEditing(product)} type="button">Edit</button>
                    <button className="category-deactivate-button" onClick={() => handleDeactivate(product)} type="button">Deactivate</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="product-edit-card">
          <h2>{editingProduct ? `Edit: ${editingProduct.name}` : "Edit product"}</h2>
          {!editingProduct ? <p className="category-list-state">Choose a product from the list to edit it.</p> : (
            <form onSubmit={saveProduct}>
              <div className="form-group"><label className="form-label" htmlFor="edit-product-name">Product name</label><input className="form-input" id="edit-product-name" name="name" onChange={updateField} value={form.name} /></div>
              <div className="product-form-row">
                <div className="form-group"><label className="form-label" htmlFor="edit-product-category">Category</label><select className="form-input" id="edit-product-category" name="categoryId" onChange={updateField} value={form.categoryId}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label" htmlFor="edit-product-price">Price</label><input className="form-input" id="edit-product-price" min="0" name="price" onChange={updateField} step="0.01" type="number" value={form.price} /></div>
              </div>
              <div className="form-group"><label className="form-label" htmlFor="edit-product-image">Image URL</label><input className="form-input" id="edit-product-image" name="image" onChange={updateField} type="url" value={form.image} /></div>
              {error && <p className="error-message">{error}</p>}
              <div className="category-form-actions"><button className="btn btn-secondary" onClick={cancelEditing} type="button">Cancel</button><button className="btn btn-primary" disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save changes"}</button></div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
