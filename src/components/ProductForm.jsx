import { useState } from "react";

export default function ProductForm({ onAdd }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
    });

    setForm({
      name: "",
      category: "",
      quantity: "",
      price: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
      <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />

      <div className="two-col">
        <input name="quantity" type="number" placeholder="Qty" value={form.quantity} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
      </div>

      <button className="primary-btn">Add Product</button>
    </form>
  );
}