import { LayoutDashboard, LogOut, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-badge">IMS</div>
          <div>
            <h2>Inventory Pro</h2>
            <p>2026 Dashboard</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" type="button">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button className="nav-item" type="button">
            <Package size={18} />
            <span>Products</span>
          </button>
        </nav>
      </div>

      <button className="logout-btn" onClick={handleLogout} type="button">
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}