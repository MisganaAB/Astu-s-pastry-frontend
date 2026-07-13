import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const storedAuth = localStorage.getItem("qrmenu-auth");
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          // attempt to verify token with backend
          // with httpOnly cookies we don't need to send token manually; include credentials
          try {
            const res = await fetch(`${API_URL}/api/auth/check`, {
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              setIsAuthenticated(true);
              setUser(data.user ?? parsedAuth.user ?? null);
              setLoading(false);
              return;
            }
          } catch {
            // fall through to clear storage
          }
          // token invalid or no token: clear stored auth
          localStorage.removeItem("qrmenu-auth");
        } catch {
          localStorage.removeItem("qrmenu-auth");
        }
      }

      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
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
    // token is stored as httpOnly cookie by backend; persist only user info
    localStorage.setItem("qrmenu-auth", JSON.stringify({ user: authUser }));
    setUser(authUser);
    setIsAuthenticated(true);
    return authUser;
  };

  const logout = () => {
    fetch(`${API_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    localStorage.removeItem("qrmenu-auth");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
