import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationItems = [
  { label: "Point of Sale", icon: "pos", to: "/" },
  { label: "Sales", icon: "sales", to: "/sales", adminOnly: true },
  { label: "Products", icon: "products", to: "/products", adminOnly: true },
  { label: "Categories", icon: "products", to: "/categories", adminOnly: true },
  { label: "Inventory", icon: "inventory", to: "/inventory", adminOnly: true },
  { label: "Reports", icon: "reports", available: false },
  { label: "Settings", icon: "settings", adminOnly: true, available: false },
  { label: "Users", icon: "users", to: "/users", adminOnly: true },
];

function SidebarIcon({ name }) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
  };
  const icons = {
    pos: (
      <>
        <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L20 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </>
    ),
    sales: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M3 19h18" />
      </>
    ),
    products: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4.4 7.7 7.6 4.4 7.6-4.4" />
        <path d="M12 12v9" />
      </>
    ),
    inventory: (
      <>
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
        <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
      </>
    ),
    customers: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    reports: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5.3v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...commonProps}>
      {icons[name]}
    </svg>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const visibleItems = navigationItems.filter(
    (item) => !item.adminOnly || user?.role === "ADMIN",
  );

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <NavLink to="/" className="sidebar-brand" aria-label="Point of Sale">
        <span className="sidebar-brand-mark">P</span>
        <span>POS</span>
      </NavLink>
      <p className="sidebar-section-label">MAIN MENU</p>
      <nav className="sidebar-nav">
        {visibleItems.map((item) =>
          item.available === false ? (
            <button
              className="sidebar-item sidebar-item-disabled"
              disabled
              key={item.label}
              title="This page will be added later"
              type="button"
            >
              <span className="sidebar-icon">
                <SidebarIcon name={item.icon} />
              </span>
              {item.label}
            </button>
          ) : (
            <NavLink
              className={({ isActive }) =>
                `sidebar-item${isActive ? " sidebar-item-active" : ""}`
              }
              end
              key={item.label}
              to={item.to}
            >
              <span className="sidebar-icon">
                <SidebarIcon name={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-status-dot" />
        System online
      </div>
    </aside>
  );
}
