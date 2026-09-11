import { createContext, useState, useContext } from "react";

const CartContext = createContext(null);

export default function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(product) {
    const existing = cartItems.find((item) => item.id === product.id);

    if (existing) {
      const currentQuantity = existing.quantity;
      const updatedCartItems = cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: currentQuantity + 1 }
          : item,
      );
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { product, id: product.id, quantity: 1 }]);
    }
  }

  function getCartItemsWithProducts() {
    return cartItems;
  }

  function removeFromCart(productId) {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  }

  function getCartTotal() {
    const total = cartItems.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity;
    }, 0);
    return total;
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        getCartItemsWithProducts,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context;
}
