import { useState } from "react";

const SubcategoryModal = ({ show, onClose = () => {}, onSave, categories = [] }) => {
  const [subcategory, setSubcategory] = useState({
    category: "",
    name: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubcategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubcategory((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = () => {
    if (subcategory.category && subcategory.name && subcategory.image) {
      onSave(subcategory);
      setSubcategory({ category: "", name: "", image: null });
      onClose();
    } else {
      alert("Please fill out all fields and upload an image.");
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
            <button type="button" className="btn-close" onClick={onClose}>×</button>
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
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Input */}
            <div className="mb-3">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter subcategory name"
                value={subcategory.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter subcategory name"
                value={subcategory.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>
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
