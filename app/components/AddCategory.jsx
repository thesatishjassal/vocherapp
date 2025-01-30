import { useState } from "react";

const CategoryModal = ({ show, onClose = () => {}, onSave }) => {
  const [category, setCategory] = useState({
    name: "",
    slug: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategory((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = () => {
    if (category.name && category.slug && category.image) {
      onSave(category);
      setCategory({ name: "", slug: "", image: null });
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
            <h5 className="modal-title">Add Category</h5>
            <button type="button" className="btn-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter category name"
                value={category.name}
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
            <div className="mb-3">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            {category.image && (
              <div className="mb-3">
                <img
                  src={URL.createObjectURL(category.image)}
                  alt="Category Preview"
                  style={{
                    maxWidth: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-success" onClick={handleSubmit}>
              Save Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
