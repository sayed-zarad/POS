import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = search.trim();
      const currentSearch = searchParams.get("search") || "";

      if (nextSearch !== currentSearch) {
        navigate(
          nextSearch ? `/?search=${encodeURIComponent(nextSearch)}` : "/",
        );
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, search, searchParams]);

  function handleSearch(event) {
    event.preventDefault();
    const nextSearch = search.trim();
    navigate(nextSearch ? `/?search=${encodeURIComponent(nextSearch)}` : "/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <form className="navbar-search" onSubmit={handleSearch} role="search">
          <input
            aria-label="البحث عن منتج"
            name="search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن منتج أو امسح الباركود..."
            value={search}
            type="search"
          />
          <button aria-label="بحث" type="submit">
            ⌕
          </button>
        </form>
        <div className="navbar-auth">
          {!user ? (
            <div className="navbar-auth-links">
              <Link to="/auth" className="btn btn-primary">
                تسجيل الدخول
              </Link>
            </div>
          ) : (
            <div className="navbar-user">
              <div className="navbar-user-avatar" aria-hidden="true">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="navbar-user-details">
                <strong>{user.name}</strong>
                <span>{user.role === "ADMIN" ? "مدير النظام" : "كاشير"}</span>
              </div>
              <button className="navbar-logout" onClick={logout} type="button">
                خروج
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
