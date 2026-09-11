import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const productInCart = cartItems.find((item) => item.id === product.id);
  const productQuantityLabel = productInCart
    ? `(${productInCart.quantity})`
    : "";
  return (
    <div className="product-card">
      <img
        decoding="async"
        loading="lazy"
        src={product.image}
        className="product-card-image"
        alt={product.name}
      />
      <div className="product-card-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-card-price">
          ${Number(product.price).toFixed(2)}
        </p>
        <div className="product-card-actions">
          <Link to={`/products/${product.id}`} className="btn btn-secondary">
            View Details
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => addToCart(product)}
          >
            Add to Cart {productQuantityLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
