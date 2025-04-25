
"use client";
import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";
import UpdateProductForm from "./UpdateProductForm";
import ImageUploadModal from "../components/ImageUploadModal";
import ExcelUploaderModal from "./ExcelUploader";
import CSVUploadModal from "./CSVUpload";

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
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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

  // Export products to CSV
  const exportToCSV = () => {
    // Define WooCommerce-compatible headers
    const headers = [
      "SKU",
      "Name",
      "Type",
      "Published",
      "Is featured?",
      "Visibility in catalog",
      "Short description",
      "Description",
      "Regular price",
      "Sale price",
      "Stock",
      "Categories",
      "Images",
      "Attributes",
      "Meta: hsncode",
      "Meta: unit",
      "Meta: rackcode",
      "Meta: size",
      "Meta: color",
      "Meta: model",
      "Meta: brand",
      "Meta: reorderqty",
    ];

    // Map products to CSV rows
    const rows = products.map((product) => {
      // Format attributes as WooCommerce expects (e.g., "name:Size|value:1300MM|visible:1")
      const attributes = [
        `name:Size|value:${product.size || ""}|visible:1`,
        `name:Color|value:${product.color || ""}|visible:1`,
        `name:Model|value:${product.model || ""}|visible:1`,
        `name:Brand|value:${product.brand || ""}|visible:1`,
      ].join("~");

      return [
        product.itemcode || "", // SKU
        product.itemname || "", // Name
        "simple", // Type (assuming simple products)
        1, // Published (1 for published)
        0, // Is featured? (0 for no)
        "visible", // Visibility in catalog
        "", // Short description (add if available)
        product.description || "", // Description
        product.price || "", // Regular price
        "", // Sale price (add if available)
        product.quantity || 0, // Stock
        `${product.category || ""}${product.subcategory ? `>${product.subcategory}` : ""}`, // Categories (e.g., "Utility>LED Downlighters")
        product.thumbnail ? `${API_URL}${product.thumbnail}` : "", // Images
        attributes, // Attributes (Size, Color, Model, Brand)
        product.hsncode || "", // Meta: hsncode
        product.unit || "", // Meta: unit
        product.rackcode || "", // Meta: rackcode
        product.size || "", // Meta: size
        product.color || "", // Meta: color
        product.model || "", // Meta: model
        product.brand || "", // Meta: brand
        product.reorderqty || "", // Meta: reorderqty
      ];
    });

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => 
            typeof cell === "string" && (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "woocommerce_products_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        [
          product.itemname,
          product.hsncode,
          product.category,
          product.subcategory,
          product.itemcode,
        ].some((field) => field?.toLowerCase().includes(searchQuery))
      );
    }
    if (filterCategory) {
      filtered = filtered.filter((product) => product.category === filterCategory);
    }
    setFilteredProducts(filtered);
  }, [products, searchQuery, filterCategory]);

  // Extract unique categories
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).filter(Boolean);

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
          productId={selectedProduct.id}
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
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            className="btn btn-info btn-md"
            onClick={exportToCSV}
          >
            Export to CSV
          </button>
          <button
            className="btn btn-success btn-md"
            onClick={() => setShowModalExcel(true)}
          >
            Add Excel
          </button>
          <button
            className="btn btn-primary btn-md"
            onClick={handleAddModalOpen}
          > 
            Add Product
          </button>
          <div className="bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">CSV Upload App</h1>
        <button
          onClick={handleOpenModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-colors"
        >
          Upload CSV
        </button>
      </div>

      <CSVUploadModal show={showModal} onClose={handleCloseModal} />
    </div>
        </div>

        {/* Products Table */}
        <div className="table-responsive">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                {/* <th>Id</th> */}
                <th>HSN Code</th>
                <th>Item Code</th>
                <th>Thumbnail</th>
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
                      <td>{product.hsncode}</td>
                    <td>{product.itemcode}</td>
                    {/* <td>{product.id}</td> */}
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
                        <i
                          className="plus-icon"
                          style={{
                            fontSize: "24px",
                            color: "#007bff",
                            cursor: "pointer",
                          }}
                          onClick={() => handleImageModalOpen(product)}
                        >
                          +
                        </i>
                      )}
                    </td>
                    <td>{truncateText(product.itemname)}</td>
                    <td>{product.category}</td>
                    <td>{product.subcategory}</td>
                    <td>₹{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.rackcode}</td>
                    <td>{product.reorderqty || 0}</td>
                    <td>
                      <i
                        className="edit-icon"
                        style={{
                          fontSize: "18px",
                          marginRight: "10px",
                          cursor: "pointer",
                          color: "#28a745",
                        }}
                        onClick={() => handleUpdateModalOpen(product)}
                      >
                        ✏️
                      </i>
                      <i
                        className="delete-icon"
                        style={{
                          fontSize: "18px",
                          cursor: "pointer",
                          color: "#dc3545",
                        }}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑️
                      </i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;