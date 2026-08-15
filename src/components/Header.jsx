import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTheme, setTheme } from "../utils/adminSettings";
import { useEffect, useState } from "react";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const isAdminPage = location.pathname === "/admin";
  const [theme, setLocalTheme] = useState(
    getTheme(isAdminPage ? "admin" : "client"),
  );

  useEffect(() => {
    const currentTheme = getTheme(isAdminPage ? "admin" : "client");
    setLocalTheme(currentTheme);
    document.body.dataset.theme = currentTheme;
  }, [isAdminPage]);

  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setLocalTheme(nextTheme);
    setTheme(nextTheme, isAdminPage ? "admin" : "client");
    document.body.dataset.theme = nextTheme;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      {/* <div className="logoContainer">
        <img src="/geae.webp" alt="geae" className="geae-logo" />
      </div> */}
      <h1>Astu's Pastry</h1>
      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={handleThemeToggle}
          type="button"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        {isAuthenticated && isAdminPage ? (
          <button
            className="logout-button"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}
