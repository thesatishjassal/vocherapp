import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SubcategoryModal = ({ show, onClose = () => {} }) => {
  const [subcategory, setSubcategory] = useState({
    category: "",
    subcatname: "",
    slug: "",
  });
  const [categories, setCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/category`, {
          withCredentials: true,
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories!");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubcategory((prev) => ({ ...prev, [name]: value }));
  };

  // Generate slug from subcategory name
  useEffect(() => {
    setSubcategory((prev) => ({
      ...prev,
      slug: prev.subcatname.toLowerCase().replace(/\s+/g, "-"),
    }));
  }, [subcategory.subcatname]);

  const handleSubmit = async () => {
    if (subcategory.category && subcategory.subcatname && subcategory.slug) {
      try {
        const response = await axios.post(
          `${API_URL}/subcategory`,
          {
            catname: subcategory.category,
            subcatname: subcategory.subcatname,
            slug: subcategory.slug,
          },
          { withCredentials: true }
        );

        if (response.status === 201) {
          toast.success("Subcategory added successfully!");
          setSubcategory({ category: "", subcatname: "", slug: "" });
          onClose();
        }
      } catch (error) {
        console.error("Error adding subcategory:", error);
        toast.error("Failed to add subcategory!");
      }
    } else {
      toast.warn("Please fill out all fields!");
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
            <h5 className="modal-title">Add Subcategory</h5>
            <button type="button" className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modal-body">
            {/* Category Dropdown */}
            <div className="mb-3">
              <select
                name="category"
                className="form-select"
                value={subcategory.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.catname}>
                    {cat.catname}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Input */}
            <div className="mb-3">
              <input
                type="text"
                name="subcatname"
                className="form-control"
                placeholder="Enter subcategory name"
                value={subcategory.subcatname}
                onChange={handleChange}
              />
            </div>

            {/* Slug (Read-only) */}
            <div className="mb-3">
              <input
                type="text"
                name="slug"
                className="form-control"
                placeholder="Slug (auto-generated)"
                value={subcategory.slug}
                readOnly
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={onClose}
            >
              Close
            </button>
            <button type="button" className="btn btn-success" onClick={handleSubmit}>
              Save Subcategory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryModal;
