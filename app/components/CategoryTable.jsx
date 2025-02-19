import { useState } from "react";
import CategoryModal from "./AddCategory";

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({ name: "", slug: "", image: null });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const handleCategoryClose = () => {
    setShowCategoryModal(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategory({ ...category, image: URL.createObjectURL(file) });
    }
  };

  // Add category to table
  const handleAddCategory = () => {
    if (!category.name || !category.slug)
      return alert("Name and slug are required!");
    setCategories([...categories, category]);
    setCategory({ name: "", slug: "", image: null }); // Reset form
  };

  return (
    <div className="card">
      {showCategoryModal && (
        <CategoryModal show={showCategoryModal} onClose={handleCategoryClose} />
      )}
      <div class="card-header pb-0">
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
              className="btn  action_btn mx-2"
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
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={index}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>{cat.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Table */}
    </div>
  );
};

export default CategoryTable;
