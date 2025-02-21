import { useState, useEffect } from "react";
import axios from "axios";
import CategoryModal from "./CategoryModal";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/category`, { withCredentials: true });
        setCategories(response.data);
      } catch (error) {
        toast.error("Failed to load categories!");
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClose = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleAddOrUpdateCategory = (category, isEdit) => {
    if (isEdit) {
      setCategories((prev) => prev.map((cat) => (cat.id === category.id ? category : cat)));
    } else {
      setCategories((prev) => [...prev, category]);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/category/${categoryId}`, { withCredentials: true });
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete category!");
    }
  };

  return (
    <div className="card">
      {showCategoryModal && (
        <CategoryModal
          show={showCategoryModal}
          onClose={handleCategoryClose}
          onSave={handleAddOrUpdateCategory}
          categoryData={editingCategory}
        />
      )}
      <div className="card-header pb-0">
        <h6>Manage Categories</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input type="text" placeholder="Search categories" className="form-control w-25" />
          <button className="btn btn-primary" onClick={() => setShowCategoryModal(true)}>
            Add Category
          </button>
        </div>
        <table className="table align-items-center mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.catname}</td>
                <td>{cat.slug}</td>
                <td>
                  <button className="btn btn-sm btn-warning mx-2" onClick={() => handleEdit(cat)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;
