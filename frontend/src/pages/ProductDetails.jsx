import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../api/products.api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { addToCart, cartItems } = useCart();

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProductById(id)
      .then((result) => setProduct(result.data))
      .catch(() => navigate("/"));
  }, [id, navigate]);

  if (!product) {
    return <p>Loading...</p>;
  }
  const productInCart = cartItems.find((item) => item.id === product.id);
  const productQuantityLabel = productInCart
    ? `(${productInCart.quantity})`
    : "";

  return (
    <div className="page">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-detail-content">
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-price">
              ${Number(product.price).toFixed(2)}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => addToCart(product)}
            >
              Add To Cart {productQuantityLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
