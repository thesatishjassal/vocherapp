"use-clients"
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CategoryModal = ({ show, onClose = () => {}, onSave }) => {
  const [category, setCategory] = useState({
    catname: "",
    slug: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!category.catname || !category.slug) {
      toast.warn("Please fill in all fields!", { position: "top-right" });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://api.panvic.in/category", category);
      toast.success("Category added successfully!", { position: "top-right" });

      if (onSave) onSave(response.data); // Pass the new category to parent
      setCategory({ catname: "", slug: "" }); // Reset fields
      onClose(); // Close modal after saving
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal fade show ${show ? "show" : ""}`}
      tabIndex="-1"
      aria-hidden={!show}
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Category</h5>
            <button type="button" className="btn-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <input
                type="text"
                name="catname"
                className="form-control"
                placeholder="Enter category name"
                value={category.catname}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="slug"
                className="form-control"
                placeholder="Enter slug (e.g., category-name)"
                value={category.slug}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
