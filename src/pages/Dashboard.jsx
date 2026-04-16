import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = "https://inventory-management-clean.onrender.com";

const emptyForm = {
  name: "",
  category: "",
  quantity: "",
  price: "",
};

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/products`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to fetch");

      setProducts(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      toast.error("Please login first");
      return;
    }
    fetchProducts();
  }, []);

  // =========================
  // DATA PROCESSING
  // =========================
  const normalizedProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      category: p.category || "General",
      quantity: Number(p.quantity) || 0,
      price: Number(p.price) || 0,
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || p.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [normalizedProducts, search, filter]);

  const categories = useMemo(() => {
    return ["All", ...new Set(normalizedProducts.map((p) => p.category))];
  }, [normalizedProducts]);

  const stats = useMemo(() => {
    const totalProducts = normalizedProducts.length;
    const totalStock = normalizedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const inventoryValue = normalizedProducts.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0
    );
    const lowStock = normalizedProducts.filter((p) => p.quantity <= 5).length;

    return { totalProducts, totalStock, inventoryValue, lowStock };
  }, [normalizedProducts]);

  const chartData = {
    labels: normalizedProducts.map((p) => p.name),
    datasets: [
      {
        label: "Stock",
        data: normalizedProducts.map((p) => p.quantity),
      },
    ],
  };

  // =========================
  // FORM HANDLING
  // =========================
  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // =========================
  // ADD PRODUCT
  // =========================
  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
      };

      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Add failed");

      toast.success("Product added");
      setForm(emptyForm);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // =========================
  // UPDATE PRODUCT (FIXED)
  // =========================
  const saveEdit = async () => {
    try {
      const payload = {
        ...editing,
        quantity: Number(editing.quantity),
        price: Number(editing.price),
      };

      const res = await fetch(
        `${API}/api/products/${editing.id}`, // ✅ FIXED
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success("Updated");
      setEditing(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // =========================
  // UI (UNCHANGED)
  // =========================
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-shell">
        <motion.section className="hero-banner">
          <h1>Inventory Dashboard</h1>
          <p>Track, manage, and control your inventory.</p>
        </motion.section>

        <section className="stats-grid">
          <div className="premium-card">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>

          <div className="premium-card">
            <h3>Total Stock</h3>
            <p>{stats.totalStock}</p>
          </div>

          <div className="premium-card">
            <h3>Inventory Value</h3>
            <p>${stats.inventoryValue}</p>
          </div>

          <div className="premium-card">
            <h3>Low Stock</h3>
            <p>{stats.lowStock}</p>
          </div>
        </section>

        <section className="premium-card">
          <Bar data={chartData} />
        </section>

        <section className="premium-card">
          <form onSubmit={addProduct}>
            <input name="name" value={form.name} onChange={handleFormChange} />
            <input name="category" value={form.category} onChange={handleFormChange} />
            <input name="quantity" type="number" value={form.quantity} onChange={handleFormChange} />
            <input name="price" type="number" value={form.price} onChange={handleFormChange} />
            <button>Add Product</button>
          </form>
        </section>

        <section className="premium-card">
          <input value={search} onChange={(e) => setSearch(e.target.value)} />

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.quantity}</td>
                    <td>${p.price}</td>
                    <td>
                      <button onClick={() => setEditing(p)}>Edit</button>
                      <button onClick={() => deleteProduct(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {editing && (
          <div className="modal">
            <input
              value={editing.name || ""}
              onChange={(e) =>
                setEditing((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              value={editing.category || ""}
              onChange={(e) =>
                setEditing((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <input
              type="number"
              value={editing.quantity || ""}
              onChange={(e) =>
                setEditing((prev) => ({ ...prev, quantity: e.target.value }))
              }
            />
            <input
              type="number"
              value={editing.price || ""}
              onChange={(e) =>
                setEditing((prev) => ({ ...prev, price: e.target.value }))
              }
            />
            <button onClick={saveEdit}>Save</button>
          </div>
        )}
      </main>
    </div>
  );
}