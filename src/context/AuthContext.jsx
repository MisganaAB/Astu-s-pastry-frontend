import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { setToken, getToken, clearToken } from "../auth/tokenStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/check`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${getToken() || ""}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser(data.user ?? null);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  const login = async (username, password) => {
    if (!username || !password) {
      throw new Error("Please enter a username and password.");
    }

    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Invalid credentials.");
    }

    const authUser = data.user;
    if (data.token) {
      setToken(data.token); // in-memory only, never persisted
    }
    setUser(authUser);
    setIsAuthenticated(true);
    return authUser;
  };

  const logout = () => {
    fetch(`${API_URL}/api/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;