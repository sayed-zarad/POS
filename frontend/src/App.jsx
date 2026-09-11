import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import NewProduct from "./pages/NewProduct";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Users from "./pages/Users";
import Navbar from "./components/NavBar";
import Sidebar from "./components/Sidebar";

import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";
function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
          <Navbar />
          <div
            className={
              isAuthPage ? "app-content app-content-auth" : "app-content"
            }
          >
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home key={location.search} />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/products/new" element={<NewProduct />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/users" element={<Users />} />
              </Routes>
            </main>
            {!isAuthPage && <Sidebar />}
          </div>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
