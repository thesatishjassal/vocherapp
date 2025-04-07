"use client";
import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";
import UpdateProductForm from "./UpdateProductForm";
import ImageUploadModal from "../components/ImageUploadModal";
import ExcelUploaderModal from "./ExcelUploader";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModalExcel, setShowModalExcel] = useState(false);

  // Truncate long text
  const truncateText = (text, wordLimit = 8) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  // Modal Handlers
  const handleAddModalClose = () => setShowAddModal(false);
  const handleUpdateModalClose = () => setShowUpdateModal(false);
  const handleImageModalClose = () => setShowImageModal(false);

  const handleAddModalOpen = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const handleUpdateModalOpen = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleImageModalOpen = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  // Add or Update product in state
  const handleAddOrUpdateProduct = (updatedProduct) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === updatedProduct.id);
      if (index > -1) {
        const newProducts = [...prev];
        newProducts[index] = updatedProduct;
        return newProducts;
      }
      return [...prev, updatedProduct];
    });
    setShowAddModal(false);
    setShowUpdateModal(false);
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`${API_URL}/products/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  // Image upload handler
  const handleImageUpload = (productId, newImage) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, thumbnail: newImage } : product
      )
    );
  };

  // Search and Category Filter
  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleCategoryFilter = (e) => setFilterCategory(e.target.value);

  // Fetch products initially
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/`);
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [selectedProduct]);
  // Apply filters
  useEffect(() => {
    let filtered = products;
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        [product.itemname, product.hsncode, product.category, product.subcategory, product.itemcode]
          .some((field) => field?.toLowerCase().includes(searchQuery))
      );
    }
    if (filterCategory) {
      filtered = filtered.filter((product) => product.category === filterCategory);
    }
    setFilteredProducts(filtered);
  }, [products, searchQuery, filterCategory]);

  // Extract unique categories
  const categories = Array.from(new Set(products.map((product) => product.category))).filter(Boolean);

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Products</h6>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductForm
          show={showAddModal}
          onClose={handleAddModalClose}
          onSave={handleAddOrUpdateProduct}
        />
      )}

      {/* Update Product Modal */}
      {showUpdateModal && selectedProduct && (
        <UpdateProductForm
          show={showUpdateModal}
          onClose={handleUpdateModalClose}
          onSave={handleAddOrUpdateProduct}
          productId={selectedProduct.id} // Pass only the ID
        />
      )}

      {/* Image Upload Modal */}
      {showImageModal && (
        <ImageUploadModal
          show={showImageModal}
          onClose={handleImageModalClose}
          product={selectedProduct}
          onUpload={handleImageUpload}
        />
      )}

      {/* Excel Uploader Modal */}
      <ExcelUploaderModal
        show={showModalExcel}
        onClose={() => setShowModalExcel(false)}
      />

      {/* Search and Filter Controls */}
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
          <input
            type="text"
            placeholder="Search by Name, HSN, Category..."
            className="form-control w-50"
            value={searchQuery}
            onChange={handleSearch}
          />
          <select
            className="form-select w-25"
            value={filterCategory}
            onChange={handleCategoryFilter}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="btn btn-success btn-md" onClick={() => setShowModalExcel(true)}>Add Excel</button>
          <button className="btn btn-primary btn-md" onClick={handleAddModalOpen}>Add Product</button>
        </div>

        {/* Products Table */}
        <div className="table-responsive">
          <table className="table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Id</th>
                <th>Thumbnail</th>
                <th>HSN Code</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Sub-Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Rack Code</th>
                <th>Reorder QTY</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {product.thumbnail ? (
                        <img
                          src={`${API_URL}${product.thumbnail}`}
                          alt={product.itemname}
                          width="50"
                          height="50"
                          style={{ borderRadius: "5px", cursor: "pointer" }}
                          onClick={() => handleImageModalOpen(product)}
                        />
                      ) : (
                        <i className="plus-icon" style={{ fontSize: "24px", color: "#007bff", cursor: "pointer" }} onClick={() => handleImageModalOpen(product)}>+</i>
                      )}
                    </td>
                    <td>{product.hsncode}</td>
                    <td>{product.itemcode}</td>
                    <td>{truncateText(product.itemname)}</td>
                    <td>{product.category}</td>
                    <td>{product.subcategory}</td>
                    <td>₹{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.rackcode}</td>
                    <td>{product.reorderqty || 0}</td> {/* New Reorder Qty Column */}
                    <td>
                      <i className="edit-icon" style={{ fontSize: "18px", marginRight: "10px", cursor: "pointer", color: "#28a745" }} onClick={() => handleUpdateModalOpen(product)}>✏️</i>
                      <i className="delete-icon" style={{ fontSize: "18px", cursor: "pointer", color: "#dc3545" }} onClick={() => handleDeleteProduct(product.id)}>🗑️</i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="11" className="text-center">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
