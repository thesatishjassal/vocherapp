import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CategoryModal = ({ show, onClose, onSave, categoryData }) => {
  const [category, setCategory] = useState({
    catname: "",
    slug: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryData) {
      setCategory(categoryData);
    } else {
      setCategory({ catname: "", slug: "" });
    }
  }, [categoryData]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "catname" ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!category.catname || !category.slug) {
      toast.warn("Please fill in all fields!", { position: "top-right" });
      return;
    }
  
    setLoading(true);
  
    try {
      let response;
      if (categoryData) {
        if (!categoryData.id) {
          throw new Error("Category ID is missing for update!");
        }
        // Edit Category
        response = await axios.put(
          `${API_URL}/category/${categoryData.id}`,
          category,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        toast.success("Category updated successfully!", { position: "top-right" });
      } else {
        // Add Category
        response = await axios.post(
          `${API_URL}/category/`,
          category,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        toast.success("Category added successfully!", { position: "top-right" });
      }
      await onSave(response.data, !!categoryData); // Wait for onSave to finish
      onClose();
    } catch (err) {
      console.error("Submit Error:", err.response || err);
      toast.error(err.response?.data?.message || "Something went wrong!", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
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
            <h5 className="modal-title">{categoryData ? "Edit Category" : "Add Category"}</h5>
            <button type="button" className="btn-close" onClick={onClose}>
            <i class="fa-solid fa-xmark"></i>
            </button>
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
                placeholder="Slug (auto-generated)"
                value={category.slug}
                readOnly
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (categoryData ? "Updating..." : "Saving...") : categoryData ? "Update Category" : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
