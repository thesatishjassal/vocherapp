import { useState, useEffect } from "react";
import axios from "axios";
import CategoryModal from "./AddCategory";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/category`, {
          withCredentials: true,
        });
        setCategories(response.data);
        console.log("Categories fetched:", response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories!");
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClose = () => {
    setShowCategoryModal(false);
  };

  const handleAddCategory = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleEdit = (categoryId) => {
    console.log("Edit category:", categoryId);
    // Implement edit functionality here
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/category/${categoryId}`, {
        withCredentials: true,
      });

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category!");
    }
  };

  return (
    <div className="card">
      {showCategoryModal && (
        <CategoryModal
          show={showCategoryModal}
          onClose={handleCategoryClose}
          onSave={handleAddCategory}
        />
      )}
      <div className="card-header pb-0">
        <h6>Add Category</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Search by Client or Project"
            className="form-control w-25"
          />
          <div className="add_product">
            <button
              className="btn action_btn mx-2"
              onClick={() => setShowCategoryModal(true)}
            >
              Add Category
            </button>
          </div>
        </div>
        <table className="table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={index}>
                <td>{cat.id}</td>
                <td>{cat.catname}</td>
                <td>{cat.slug}</td>
                <td>
                  <u
                    className="text-primary mx-2"
                    style={{ cursor: "pointer" }}
                    title="Edit"
                    onClick={() => handleEdit(cat.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </u>
                  <u
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    title="Delete"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </u>
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
