import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSales, getSaleById, cancelSale } from "../api/sales.api";

const STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  COMPLETED: "مكتملة",
  CANCELLED: "ملغاة",
  REFUNDED: "مستردة",
};

const STATUS_CLASSES = {
  PENDING: "sale-badge-pending",
  COMPLETED: "sale-badge-completed",
  CANCELLED: "sale-badge-cancelled",
  REFUNDED: "sale-badge-refunded",
};

const PAGE_SIZE = 20;

export default function Sales() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Detail modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    if (isAuthLoading || user?.role !== "ADMIN") return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params = {
      page,
      limit: PAGE_SIZE,
      sortOrder,
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    getSales(params, { signal: controller.signal })
      .then((res) => {
        setSales(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [isAuthLoading, user?.role, page, statusFilter, sortOrder]);

  async function openDetail(saleId) {
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await getSaleById(saleId);
      setSelectedSale(res.data);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setIsLoadingDetail(false);
    }
  }

  function closeDetail() {
    setSelectedSale(null);
    setDetailError(null);
  }

  async function handleCancel(saleId) {
    if (
      !window.confirm("هل تريد إلغاء هذه العملية؟ سيتم إرجاع الكميات للمخزون.")
    )
      return;
    setIsCancelling(true);
    setDetailError(null);
    try {
      const res = await cancelSale(saleId);
      // Update in list
      setSales((prev) =>
        prev.map((s) =>
          s.id === saleId ? { ...s, status: res.data.status } : s,
        ),
      );
      setSelectedSale(res.data);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setIsCancelling(false);
    }
  }

  if (isAuthLoading) return null;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  const hasMore = pagination && page < pagination.totalPages;

  return (
    <main className="page sales-page">
      <div className="container">
        {/* Header */}
        <section className="inventory-header">
          <div>
            <p className="pos-section-eyebrow">سجل المبيعات</p>
            <h1 className="page-title">المبيعات</h1>
          </div>
          {pagination && (
            <span className="pos-products-count">{pagination.total} عملية</span>
          )}
        </section>

        {/* Filters */}
        <div className="sales-filters">
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">كل الحالات</option>
            <option value="COMPLETED">مكتملة</option>
            <option value="PENDING">قيد الانتظار</option>
            <option value="CANCELLED">ملغاة</option>
            <option value="REFUNDED">مستردة</option>
          </select>
          <select
            className="form-input"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
          >
            <option value="desc">الأحدث أولاً</option>
            <option value="asc">الأقدم أولاً</option>
          </select>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setStatusFilter("");
              setSortOrder("desc");
              setPage(1);
            }}
            type="button"
          >
            إعادة تعيين
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Table */}
        {isLoading ? (
          <p className="category-list-state">جاري تحميل المبيعات...</p>
        ) : sales.length === 0 ? (
          <p className="category-list-state">لا توجد مبيعات بعد.</p>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الكاشير</th>
                  <th>التاريخ والوقت</th>
                  <th>عدد المنتجات</th>
                  <th>الإجمالي</th>
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const date = new Date(sale.createdAt);
                  return (
                    <tr key={sale.id}>
                      <td className="sale-id-cell">#{sale.id}</td>
                      <td>{sale.user?.name ?? "—"}</td>
                      <td className="sale-date-cell">
                        <span>{date.toLocaleDateString("ar-EG")}</span>
                        <span className="sale-time">
                          {date.toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="receipt-cell-center">
                        {sale.items?.length ?? "—"}
                      </td>
                      <td className="sale-amount">
                        {Number(sale.totalAmount).toFixed(2)} ج.م
                      </td>
                      <td>
                        <span
                          className={`inventory-badge ${STATUS_CLASSES[sale.status]}`}
                        >
                          {STATUS_LABELS[sale.status]}
                        </span>
                      </td>
                      <td>
                        <button
                          className="category-edit-button"
                          onClick={() => openDetail(sale.id)}
                          type="button"
                        >
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Detail Modal */}
      {(isLoadingDetail || selectedSale) && (
        <div className="sale-modal-overlay" onClick={closeDetail}>
          <div className="sale-modal" onClick={(e) => e.stopPropagation()}>
            {isLoadingDetail ? (
              <p className="category-list-state">جاري التحميل...</p>
            ) : selectedSale ? (
              <>
                <div className="sale-modal-header">
                  <h2>تفاصيل العملية #{selectedSale.id}</h2>
                  <button className="sale-modal-close" onClick={closeDetail}>
                    ×
                  </button>
                </div>

                <div className="sale-modal-info">
                  <div className="receipt-info-row">
                    <span>الكاشير</span>
                    <span>{selectedSale.user?.name}</span>
                  </div>
                  <div className="receipt-info-row">
                    <span>التاريخ</span>
                    <span>
                      {new Date(selectedSale.createdAt).toLocaleString("ar-EG")}
                    </span>
                  </div>
                  <div className="receipt-info-row">
                    <span>الحالة</span>
                    <span
                      className={`inventory-badge ${STATUS_CLASSES[selectedSale.status]}`}
                    >
                      {STATUS_LABELS[selectedSale.status]}
                    </span>
                  </div>
                </div>

                <table className="receipt-items-table sale-modal-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>سعر الوحدة</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product?.name ?? `#${item.productId}`}</td>
                        <td className="receipt-cell-center">{item.quantity}</td>
                        <td className="receipt-cell-right">
                          {Number(item.unitPrice).toFixed(2)} ج.م
                        </td>
                        <td className="receipt-cell-right">
                          {Number(item.totalAmount).toFixed(2)} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="sale-modal-totals">
                  <div className="receipt-total-row">
                    <span>المجموع</span>
                    <span>{Number(selectedSale.subtotal).toFixed(2)} ج.م</span>
                  </div>
                  {Number(selectedSale.discountAmount) > 0 && (
                    <div className="receipt-total-row receipt-discount">
                      <span>الخصم</span>
                      <span>
                        - {Number(selectedSale.discountAmount).toFixed(2)} ج.م
                      </span>
                    </div>
                  )}
                  <div className="receipt-total-row">
                    <span>ضريبة القيمة المضافة (14%)</span>
                    <span>{Number(selectedSale.taxAmount).toFixed(2)} ج.م</span>
                  </div>
                  <div className="receipt-total-row receipt-grand-total">
                    <span>الإجمالي الكلي</span>
                    <span>
                      {Number(selectedSale.totalAmount).toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                {detailError && (
                  <p className="pos-order-error">{detailError}</p>
                )}

                {selectedSale.status === "COMPLETED" && (
                  <div className="sale-modal-actions">
                    <button
                      className="category-deactivate-button"
                      disabled={isCancelling}
                      onClick={() => handleCancel(selectedSale.id)}
                      type="button"
                    >
                      {isCancelling ? "جاري الإلغاء..." : "إلغاء العملية"}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
