import { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(localStorage.getItem("accessToken")),
  );

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Session expired");
        }
        return response.json();
      })
      .then((result) => setUser(result.data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Invalid email or password");
    }

    localStorage.setItem("accessToken", result.data.accessToken);
    setUser(result.data.user);
    return result.data.user;
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
