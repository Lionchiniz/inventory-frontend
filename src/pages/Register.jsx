import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const API = "https://inventory-management-clean.onrender.com";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-panel">
        <div className="auth-head">
          <p className="eyebrow">Inventory Pro</p>
          <h1>Create account</h1>
          <p className="muted">Start managing inventory with a modern dashboard.</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <input name="name" value={form.name} onChange={handleChange} required />
          <input name="email" value={form.email} onChange={handleChange} required />
          <input name="password" value={form.password} onChange={handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}