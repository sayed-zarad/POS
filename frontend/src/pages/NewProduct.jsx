import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getCategories } from "../api/categories.api";
import { clearProductListCache, createProduct } from "../api/products.api";
import { useAuth } from "../context/AuthContext";

export default function NewProduct() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", categoryId: "", price: "", image: "" });
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthLoading || user?.role !== "ADMIN") return undefined;
    const controller = new AbortController();
    getCategories({ page: 1, limit: 100 }, { signal: controller.signal })
      .then((result) => setCategories(result.data))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      });
    return () => controller.abort();
  }, [isAuthLoading, user?.role]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const price = Number(form.price);
    if (form.name.trim().length < 2 || !form.categoryId || !Number.isFinite(price) || price < 0) {
      setError("Enter a name, category, and valid price.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await createProduct({ name: form.name.trim(), categoryId: Number(form.categoryId), price, image: form.image.trim() || null });
      clearProductListCache();
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading) return null;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return (
    <main className="page product-form-page">
      <div className="container product-form-container">
        <div className="product-form-heading">
          <div><p className="pos-section-eyebrow">Catalog management</p><h1 className="page-title">Add new product</h1></div>
          <Link className="btn btn-secondary" to="/">Cancel</Link>
        </div>
        <form className="product-form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="product-name">Product name</label>
            <input className="form-input" id="product-name" name="name" onChange={updateField} placeholder="e.g. Orange juice 250 ml" value={form.name} />
          </div>
          <div className="product-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="product-category">Category</label>
              <select className="form-input" id="product-category" name="categoryId" onChange={updateField} value={form.categoryId}>
                <option value="">Select a category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="product-price">Price</label>
              <input className="form-input" id="product-price" min="0" name="price" onChange={updateField} placeholder="0.00" step="0.01" type="number" value={form.price} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="product-image">Image URL <span className="product-form-optional">(optional)</span></label>
            <input className="form-input" id="product-image" name="image" onChange={updateField} placeholder="https://example.com/product.jpg" type="url" value={form.image} />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="product-form-actions"><button className="btn btn-primary btn-large" disabled={isSaving} type="submit">{isSaving ? "Creating product..." : "Create product"}</button></div>
        </form>
      </div>
    </main>
  );
}
