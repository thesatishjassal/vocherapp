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
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 25; // Items per page

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const formatText = (text) => {
    const regex = /([^:]+):([^:]+)/g;
    const parts = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const key = match[1].trim();
      const value = match[2].trim();
      parts.push({ key, value });
    }

    return parts.map((item, index) => (
      <p key={index} style={{ marginBottom: 4 }}>
        <strong>{item.key}</strong> : {item.value}
      </p>
    ));
  };

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

    const rows = products.map((product) => {
      const attributes = [
        `name:Size|value:${product.size || ""}|visible:1`,
        `name:Color|value:${product.color || ""}|visible:1`,
        `name:Model|value:${product.model || ""}|visible:1`,
        `name:Brand|value:${product.brand || ""}|visible:1`,
      ].join("~");

      return [
        product.itemcode || "",
        product.itemname || "",
        "simple",
        1,
        0,
        "visible",
        "",
        product.description || "",
        product.price || "",
        "",
        product.quantity || 0,
        `${product.category || ""}${
          product.subcategory ? `>${product.subcategory}` : ""
        }`,
        product.thumbnail ? `${API_URL}${product.thumbnail}` : "",
        attributes,
        product.hsncode || "",
        product.unit || "",
        product.rackcode || "",
        product.size || "",
        product.color || "",
        product.model || "",
        product.brand || "",
        product.reorderqty || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" &&
            (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

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
      setIsLoading(true); // Start loading
      try {
        const response = await fetch(`${API_URL}/products/`);
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchProducts();
  }, [selectedProduct]);

  // Apply filters and reset to first page when filters change
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
     } else {
      setFilteredProducts([]);
    }
    if (filterCategory) {
      filtered = filtered.filter(
        (product) => product.category === filterCategory
      );
    }
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [products, searchQuery, filterCategory]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

      {/* CSV Uploader Modal */}
      <CSVUploadModal show={showModal} onClose={handleCloseModal} />

      {/* Card Body */}
      <div className="card-body">
        {/* Search and Filter Controls */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <input
            type="text"
            placeholder="Search by Name, HSN, Category..."
            className="form-control w-100 w-md-50"
            value={searchQuery}
            onChange={handleSearch}
          />
          <select
            className="form-select w-100 w-md-25"
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
          <div className="d-flex flex-wrap gap-3 justify-content-start">
            <button className="btn btn-info btn-md" onClick={exportToCSV}>
              Export to CSV
            </button>
            <button
              className="btn btn-success btn-md"
              onClick={handleAddModalOpen}
            >
              Add Product
            </button>
            <button
              className="btn btn-danger btn-md"
              onClick={() => setShowModal(true)}
            >
              Upload CSV or Excel
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Products Table */}
            <div className="table-responsive">
              <table className="tm_round_border table align-items-center justify-content-center mb-0">
                <thead>
                  <tr>
                    <th>HSN Code</th>
                    <th>Item Code</th>
                    <th>Thumbnail</th>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Reorder</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.hsncode}</td>
                        <td>{product.itemcode}</td>
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
                        <td>{formatText(product.description)}</td>
                        <td>{product.category}</td>
                        <td>₹{product.price}</td>
                        <td>{product.quantity}</td>
                        <td>{product.reorderqty || 0}</td>
                        <td>
                          <i
                            className="fa-solid fa-pen"
                            onClick={() => handleUpdateModalOpen(product)}
                          ></i>
                          <span> - </span>
                          <i
                            className="fa-solid fa-trash pl-2"
                            onClick={() => handleDeleteProduct(product.id)}
                          ></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsTable;