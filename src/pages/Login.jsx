import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const API = "https://inventory-management-clean.onrender.com";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        throw new Error("No token received");
      }

      toast.success("Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 300);

    } catch (err) {
      toast.error(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-panel">
        <div className="auth-head">
          <p className="eyebrow">Inventory Pro</p>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to manage products, stock, and value.</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <input name="email" value={form.email} onChange={handleChange} required />
          <input name="password" value={form.password} onChange={handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}