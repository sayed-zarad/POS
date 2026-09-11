import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createSale } from "../api/sales.api";

const TAX_RATE = 0.14;

const PAYMENT_METHODS = [
  { value: "CASH", label: "نقداً" },
  { value: "CARD", label: "بطاقة بنكية" },
  { value: "E_WALLET", label: "محفظة إلكترونية" },
];

const PAYMENT_METHOD_LABELS = {
  CASH: "نقداً",
  CARD: "بطاقة بنكية",
  E_WALLET: "محفظة إلكترونية",
};

// ── Receipt Component ──────────────────────────────────────────
function Receipt({ sale, paymentMethod, onNewOrder }) {
  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <aside className="pos-cart-panel">
      <div className="receipt-wrapper" id="receipt-print-area">
        {/* Header */}
        <div className="receipt-header">
          <h2 className="receipt-store-name">نقطة البيع — POS</h2>
          <p className="receipt-sub">فاتورة ضريبية مبسطة</p>
          <p className="receipt-meta">
            <span>#{sale.id}</span>
          </p>
        </div>

        <div className="receipt-divider" />

        {/* Info */}
        <div className="receipt-info">
          <div className="receipt-info-row">
            <span>الكاشير</span>
            <span>{sale.user?.name ?? "—"}</span>
          </div>
          <div className="receipt-info-row">
            <span>التاريخ</span>
            <span>{dateStr}</span>
          </div>
          <div className="receipt-info-row">
            <span>الوقت</span>
            <span>{timeStr}</span>
          </div>
          <div className="receipt-info-row">
            <span>طريقة الدفع</span>
            <span>{PAYMENT_METHOD_LABELS[paymentMethod]}</span>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* Items */}
        <table className="receipt-items-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
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

        <div className="receipt-divider" />

        {/* Totals */}
        <div className="receipt-totals">
          <div className="receipt-total-row">
            <span>المجموع</span>
            <span>{Number(sale.subtotal).toFixed(2)} ج.م</span>
          </div>
          {Number(sale.discountAmount) > 0 && (
            <div className="receipt-total-row receipt-discount">
              <span>الخصم</span>
              <span>- {Number(sale.discountAmount).toFixed(2)} ج.م</span>
            </div>
          )}
          <div className="receipt-total-row">
            <span>ضريبة القيمة المضافة (14%)</span>
            <span>{Number(sale.taxAmount).toFixed(2)} ج.م</span>
          </div>
          <div className="receipt-total-row receipt-grand-total">
            <span>الإجمالي الكلي</span>
            <span>{Number(sale.totalAmount).toFixed(2)} ج.م</span>
          </div>
        </div>

        <div className="receipt-divider" />

        <p className="receipt-footer">شكراً لتسوقكم معنا</p>
      </div>

      {/* Action buttons — hidden when printing */}
      <div className="receipt-actions no-print">
        <button
          className="btn btn-primary"
          onClick={() => window.print()}
          type="button"
        >
          🖨 طباعة الفاتورة
        </button>
        <button
          className="btn btn-secondary"
          onClick={onNewOrder}
          type="button"
        >
          طلب جديد
        </button>
      </div>
    </aside>
  );
}

// ── CartPanel Component ────────────────────────────────────────
export default function CartPanel() {
  const {
    getCartItemsWithProducts,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [completedSale, setCompletedSale] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const cartItems = getCartItemsWithProducts();
  const subtotal = getCartTotal();
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount;

  async function handlePlaceOrder() {
    setOrderError(null);
    setIsSubmitting(true);

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const result = await createSale({
        items,
        discountAmount: 0,
        taxRate: TAX_RATE,
      });
      // inject current user name if API doesn't return it populated
      const saleData = {
        ...result.data,
        user: result.data?.user ?? { name: user?.name ?? "—" },
      };
      setCompletedSale(saleData);
      clearCart();
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNewOrder() {
    setCompletedSale(null);
  }

  // Show receipt after successful order
  if (completedSale) {
    return (
      <Receipt
        sale={completedSale}
        paymentMethod={paymentMethod}
        onNewOrder={handleNewOrder}
      />
    );
  }

  return (
    <aside className="pos-cart-panel">
      <div className="pos-cart-header">
        <div>
          <span className="pos-cart-eyebrow">العربة الحالية</span>
          <h2 className="pos-cart-title">المنتجات ({cartItems.length})</h2>
        </div>
        {cartItems.length > 0 && (
          <button className="cart-clear-button" onClick={clearCart}>
            مسح الكل
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="pos-cart-empty">
          <p>العربة فارغة</p>
          <span>أضف منتجاً لبدء طلب جديد.</span>
        </div>
      ) : (
        <>
          <div className="pos-cart-items">
            {cartItems.map((item) => (
              <div className="pos-cart-item" key={item.id}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="pos-cart-item-image"
                />
                <div className="pos-cart-item-content">
                  <div className="pos-cart-item-heading">
                    <h3>{item.product.name}</h3>
                    <button
                      className="cart-remove-button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`إزالة ${item.product.name}`}
                    >
                      ×
                    </button>
                  </div>
                  <span className="pos-cart-item-price">
                    {Number(item.product.price).toFixed(2)} ج.م
                  </span>
                  <div className="pos-cart-item-footer">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <strong>
                      {(Number(item.product.price) * item.quantity).toFixed(2)}{" "}
                      ج.م
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pos-cart-summary">
            <div className="checkout-total">
              <span className="checkout-total-label">إجمالي المنتجات</span>
              <strong className="checkout-total-value">
                {subtotal.toFixed(2)} ج.م
              </strong>
            </div>
            <div className="checkout-total">
              <span className="checkout-total-label">الخصم</span>
              <strong className="checkout-total-value checkout-total-discount">
                0.00 ج.م
              </strong>
            </div>
            <div className="checkout-total">
              <span className="checkout-total-label">
                ضريبة القيمة المضافة ({(TAX_RATE * 100).toFixed(0)}%)
              </span>
              <strong className="checkout-total-value">
                {taxAmount.toFixed(2)} ج.م
              </strong>
            </div>
            <div className="checkout-total checkout-total-row-final">
              <span className="checkout-total-label">الإجمالي الكلي</span>
              <strong className="checkout-total-value checkout-total-final">
                {total.toFixed(2)} ج.م
              </strong>
            </div>

            <button
              className="btn btn-primary btn-large btn-block"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري إتمام الطلب..." : "إتمام الدفع"}
            </button>

            {orderError && <p className="pos-order-error">{orderError}</p>}

            <div className="pos-payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  className={`pos-payment-method-btn${
                    paymentMethod === method.value
                      ? " pos-payment-method-btn-active"
                      : ""
                  }`}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
