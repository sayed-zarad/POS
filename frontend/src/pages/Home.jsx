import ProductCard from "../components/ProductCard";
import CartPanel from "../components/CartPanel";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCachedProductList,
  getProducts,
  setCachedProductList,
} from "../api/products.api";
import { getCategories } from "../api/categories.api";

const PAGE_SIZE = 24;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() || "";

  useEffect(() => {
    const controller = new AbortController();
    const request = getCategories(
      { page: 1, limit: 100 },
      { signal: controller.signal },
    );

    request
      .then((result) => {
        setCategories(result.data);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setCategories([]);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = `${search}:${selectedCategoryId || "all"}:${page}`;
    const cachedResult = getCachedProductList(cacheKey);
    const request = cachedResult
      ? Promise.resolve(cachedResult)
      : getProducts(
          {
            page,
            limit: PAGE_SIZE,
            ...(search ? { search } : {}),
            ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
          },
          { signal: controller.signal },
        );

    request
      .then((result) => {
        setCachedProductList(cacheKey, result);
        setProducts((currentProducts) =>
          page === 1 ? result.data : [...currentProducts, ...result.data],
        );
        setPagination(result.pagination);
        setError(null);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingMore(false);
      });

    return () => controller.abort();
  }, [page, search, selectedCategoryId]);

  function selectCategory(categoryId) {
    if (categoryId === selectedCategoryId) {
      return;
    }

    setSelectedCategoryId(categoryId);
    setPage(1);
  }

  function loadMore() {
    setIsLoadingMore(true);
    setPage((currentPage) => currentPage + 1);
  }

  const hasMoreProducts = pagination && page < pagination.totalPages;

  return (
    <main className="page pos-page">
      <div className="container pos-layout">
        <section className="pos-products-section">
          <div className="pos-products-header">
            <div>
              <p className="pos-section-eyebrow">Point of sale</p>
              <h1 className="page-title">
                {search ? `نتائج البحث عن: ${search}` : "Products"}
              </h1>
            </div>
            {!isLoading && !error && (
              <span className="pos-products-count">
                {products.length} products
              </span>
            )}
          </div>
          <div className="category-filter" aria-label="Product categories">
            <button
              className={`category-filter-button${selectedCategoryId === null ? " category-filter-button-active" : ""}`}
              onClick={() => selectCategory(null)}
              type="button"
            >
              All products
            </button>
            {categories.map((category) => (
              <button
                className={`category-filter-button${selectedCategoryId === category.id ? " category-filter-button-active" : ""}`}
                key={category.id}
                onClick={() => selectCategory(category.id)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
          {isLoading && <p>Loading products...</p>}
          {error && <p className="error-message">{error}</p>}
          <div className="product-grid pos-product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
          {hasMoreProducts && (
            <div className="pos-load-more">
              <button
                className="btn btn-secondary"
                disabled={isLoadingMore}
                onClick={loadMore}
                type="button"
              >
                {isLoadingMore ? "جاري تحميل المزيد..." : "تحميل المزيد"}
              </button>
            </div>
          )}
        </section>
        <CartPanel />
      </div>
    </main>
  );
}
