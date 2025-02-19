import { useState, useEffect } from "react";
import SubcategoryModal from "./SubcategoryModal";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SubcategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  // Fetch subcategories from API
  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/subcategory`, {
        withCredentials: true,
      });
      setCategories(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Failed to load subcategories!");
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  // Handle modal close and refresh data
  const handleSubcategoryClose = (refresh = false) => {
    setShowSubcategoryModal(false);
    if (refresh) fetchSubcategories(); // Refresh subcategory list after adding
  };

  return (
    <div className="card">
      {showSubcategoryModal && (
        <SubcategoryModal show={showSubcategoryModal} onClose={handleSubcategoryClose} />
      )}
      <div className="card-header pb-0">
        <h6>Add Products</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by Client or Project"
            className="form-control w-25"
          />
          <div className="add_product">
            <button
              className="btn action_btn mx-2"
              onClick={() => setShowSubcategoryModal(true)}
            >
              Add SubCategory
            </button>
          </div>
        </div>
        <table className="table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>Id</th>
              <th>Subcategory Name</th>
              <th>Category Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{cat.subcatname}</td>
                  <td>{cat.catname}</td>
                  <td>{cat.slug}</td>
                  <td>
                    <u
                      className="text-primary mx-2"
                      style={{ cursor: "pointer" }}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </u>
                    <u
                      className="text-danger"
                      style={{ cursor: "pointer" }}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </u>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No subcategories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubcategoryTable;
