import { useState, useEffect } from "react";
import axios from "axios";
import CategoryModal from "../components/AddCategory"; // Ensure the path is correct
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state for table

  // Fetch categories on mount or after changes
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/category/`, {
        withCredentials: true,
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load categories!", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClose = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleAddOrUpdateCategory = async (category, isEdit) => {
    if (isEdit) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === category.id ? category : cat))
      );
    } else {
      setCategories((prev) => [...prev, category]);
    }
    await fetchCategories(); // Refetch categories to ensure consistency with server
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/category/${categoryId}`, {
        withCredentials: true,
      });
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success("Category deleted successfully!", { position: "top-right" });
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete category!", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((cat) =>
    cat.catname.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <input
            type="text"
            placeholder="Search categories"
            className="form-control w-25"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => setShowCategoryModal(true)}
            disabled={loading}
          >
            Add Category
          </button>
        </div>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
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
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.catname}</td>
                    <td>{cat.slug}</td>
                    <td>
                      <u
                        className="text-primary mx-2"
                        title="Edit"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(cat)}
                      >
                        <i className="fas fa-edit"></i>
                      </u>
                      <u
                        className="text-danger"
                        title="Delete"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(cat.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </u>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryTable;