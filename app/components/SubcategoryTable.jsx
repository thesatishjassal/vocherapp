import { useState } from "react";
import SubcategoryModal from "./SubcategoryModal";

const SubcategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({ name: "", slug: "", image: null });
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };
  const handleSubcategoryClose = () => {
    setShowSubcategoryModal(false);
  };

  // Add category to table
  const handleAddCategory = () => {
    if (!category.name || !category.slug)
      return alert("Name and slug are required!");
    setCategories([...categories, category]);
    setCategory({ name: "", slug: ""}); // Reset form
  };

  return (
    <div className="card">
      {showSubcategoryModal && (
        <SubcategoryModal
          show={showSubcategoryModal}
          onClose={handleSubcategoryClose}
        />
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
              <th>Name</th>
              <th>Categoryname</th>
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

export default SubcategoryTable;
