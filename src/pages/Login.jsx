import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#1c2333",
          padding: "2rem",
          borderRadius: "16px",
          color: "white",
          boxShadow: "0 12px 12px 10px rgba(0, 0, 0, 0.32)",
        }}
      >
        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          Admin Login
        </h2>
        <p style={{ marginBottom: "1.25rem", color: "#c7d2fe" }}>
          Use admin / admin123 to continue.
        </p>

        {error ? (
          <p style={{ marginBottom: "1rem", color: "#fda4af" }}>{error}</p>
        ) : null}

        <label
          style={{ display: "block", marginBottom: "0.5rem" }}
          htmlFor="username"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          required
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1rem",
            borderRadius: "8px",
            border: "1px solid #4b5563",
            background: "#111827",
            color: "white",
          }}
        />

        <label
          style={{ display: "block", marginBottom: "0.5rem" }}
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1.25rem",
            borderRadius: "8px",
            border: "1px solid #4b5563",
            background: "#111827",
            color: "white",
          }}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: "8px",
            border: "none",
            background: "#0e9f6e",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}
