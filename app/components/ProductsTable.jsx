"use client";
import { useEffect, useState, useRef } from "react";
import AddProductForm from "./AddProductForm";
import UpdateProductForm from "./UpdateProductForm";
import ImageUploadModal from "../components/ImageUploadModal";
import ExcelUploaderModal from "./ExcelUploader";
import CSVUploadModal from "./CSVUpload";
import SimpleCSVUploader from "./UpdateProductsCSV"; // ✅ New import
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState(""); // New state for brand filter
  const [showNoImageOnly, setShowNoImageOnly] = useState(false);
  const [showNullOrZeroMRP, setShowNullOrZeroMRP] = useState(false);
  const [showModalExcel, setShowModalExcel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const itemsPerPage = 25;
  const [showSimpleCSVUploader, setShowSimpleCSVUploader] = useState(false); // ✅ New state

  // Refs to track previous filter/sort values
  const prevSearchQuery = useRef("");
  const prevFilterCategory = useRef("");
  const prevFilterBrand = useRef(""); // New ref for brand filter
  const prevShowNoImageOnly = useRef(false);
  const prevShowNullOrZeroMRP = useRef(false);
  const prevSortColumn = useRef(null);
  const prevSortOrder = useRef("asc");

  // Calculate total uploaded images
  const uploadedImagesCount = products.filter(
    (product) => product.thumbnail
  ).length;

  const handleCloseModal = () => setShowModal(false);

  const formatText = (text) => {
    if (!text) return null;
    const regex = /([^:]+):([^:]+)/g;
    const parts = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const key = match[1].trim();
      const value = match[2].trim();
      parts.push({ key, value });
    }

    return parts.map((item, index) => (
      <p
        key={index}
        style={{ marginBottom: 4, fontSize: "14px", color: "#666" }}
      >
        <strong>{item.key}</strong>: {item.value}
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
  const handleImageModalClose = () => {
    setShowImageModal(false);
    setSelectedProduct(null);
  };
  const handleDetailsModalClose = () => setShowDetailsModal(false);

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

  const handleDetailsModalOpen = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
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
    fetchProducts(); // Refetch products
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await fetch(`${API_URL}/products/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      fetchProducts(); // Refetch products
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

  // Search and Filter Handlers
  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleCategoryFilter = (e) => setFilterCategory(e.target.value);
  const handleBrandFilter = (e) => setFilterBrand(e.target.value); // New handler for brand filter
  const handleNoImageFilter = (e) => setShowNoImageOnly(e.target.checked);
  const handleNullOrZeroMRPFilter = (e) => setShowNullOrZeroMRP(e.target.checked);

  // Sorting handler
  const handleSort = (column) => {
    if (column === "brand") return; // Prevent sorting by brand
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

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
      // "Meta: hsncode",
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
        // product.hsncode || "",
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

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/products/`);
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        [
          product.itemname,
          // product.hsncode,
          product.category,
          product.subcategory,
          product.itemcode,
        ].some((field) => field?.toLowerCase().includes(searchQuery))
      );
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(
        (product) => product.category === filterCategory
      );
    }

    // Apply brand filter
    if (filterBrand) {
      filtered = filtered.filter((product) => product.brand === filterBrand);
    }

    // Apply no-image filter
    if (showNoImageOnly) {
      filtered = filtered.filter((product) => !product.thumbnail);
    }

    // Apply null or zero MRP filter
    if (showNullOrZeroMRP) {
      filtered = filtered.filter((product) => product.price == null || product.price === 0);
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const valueA = a[sortColumn] || "";
        const valueB = b[sortColumn] || "";
        if (sortColumn === "price" || sortColumn === "quantity") {
          return sortOrder === "asc"
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        } else {
          return sortOrder === "asc"
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        }
      });
    }

    // Reset currentPage if filters or sorting change
    if (
      searchQuery !== prevSearchQuery.current ||
      filterCategory !== prevFilterCategory.current ||
      filterBrand !== prevFilterBrand.current ||
      showNoImageOnly !== prevShowNoImageOnly.current ||
      showNullOrZeroMRP !== prevShowNullOrZeroMRP.current ||
      sortColumn !== prevSortColumn.current ||
      sortOrder !== prevSortOrder.current
    ) {
      setCurrentPage(1);
    }

    setFilteredProducts(filtered);

    // Update previous values
    prevSearchQuery.current = searchQuery;
    prevFilterCategory.current = filterCategory;
    prevFilterBrand.current = filterBrand;
    prevShowNoImageOnly.current = showNoImageOnly;
    prevShowNullOrZeroMRP.current = showNullOrZeroMRP;
    prevSortColumn.current = sortColumn;
    prevSortOrder.current = sortOrder;
  }, [
    products,
    searchQuery,
    filterCategory,
    filterBrand,
    showNoImageOnly,
    showNullOrZeroMRP,
    sortColumn,
    sortOrder,
  ]);

  // Handle image modal navigation
  useEffect(() => {
    const handleOpenModal = (e) => {
      setSelectedProduct(e.detail);
      setShowImageModal(true);
    };
    window.addEventListener("openImageModal", handleOpenModal);
    return () => window.removeEventListener("openImageModal", handleOpenModal);
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render Dynamic Page Numbers
  const renderPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(
        <li key="ellipsis-start" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <li
          key={page}
          className={`page-item ${currentPage === page ? "active" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        </li>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <li key="ellipsis-end" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }

    return pages;
  };

  // Extract unique categories and brands
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).filter(Boolean);
  const brands = Array.from(
    new Set(products.map((product) => product.brand))
  ).filter(Boolean);

  return (
    <div className="card" style={{ minHeight: "500px", overflow: "auto" }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          th {
            cursor: pointer;
            user-select: none;
          }
          th:hover {
            background-color: #f5f5f5;
          }
          .pagination-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 15px;
            padding: 10px;
          }
          .pagination {
            margin: 0;
            gap: 5px;
          }
          .page-item {
            margin: 0 2px;
          }
          .page-link {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 40px;
            height: 40px;
            padding: 0;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            background-color: #fff;
            color: #007bff;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          .page-link:hover:not(.disabled) {
            background-color: #e9ecef;
            border-color: #007bff;
          }
          .page-item.active .page-link {
            background-color: #007bff;
            border-color: #007bff;
            color: #fff;
          }
          .page-item.disabled .page-link {
            background-color: #f8f9fa;
            border-color: #dee2e6;
            color: #6c757d;
            cursor: not-allowed;
          }
          .jump-to-page {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .jump-to-page input {
            width: 70px;
            height: 40px;
            padding: 5px 10px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            font-size: 14px;
            text-align: center;
          }
          .jump-to-page input:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0,123,255,0.3);
          }
          .image-count {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
          .form-check-label {
            margin-left: 8px;
            font-size: 14px;
            color: #333;
          }
          @media (max-width: 576px) {
            .pagination-container {
              flex-direction: column;
              gap: 10px;
            }
            .jump-to-page input {
              width: 60px;
              font-size: 12px;
            }
            .page-link {
              min-width: 35px;
              height: 35px;
              font-size: 12px;
            }
            .image-count {
              font-size: 12px;
            }
            .form-check-label {
              font-size: 12px;
            }
          }
        `}
      </style>
      <div className="card-header pb-0">
        <h6>Manage Products</h6>
        <p className="image-count mt-2">
          Total Uploaded Images: <strong>{uploadedImagesCount}</strong>
        </p>
      </div>

      {/* <button
        className="btn btn-primary btn-md"
        onClick={() => setShowSimpleCSVUploader(true)}
      >
        Update Products via CSV
      </button>
      {showSimpleCSVUploader && (
        <SimpleCSVUploader
          show={showSimpleCSVUploader}
          onClose={() => setShowSimpleCSVUploader(false)}
          fetchProducts={fetchProducts}
        />
      )} */}

      {/* Modals */}
      {showAddModal && (
        <AddProductForm
          show={showAddModal}
          onClose={handleAddModalClose}
          onSave={handleAddOrUpdateProduct}
        />
      )}
      {showUpdateModal && selectedProduct && (
        <UpdateProductForm
          show={showUpdateModal}
          onClose={handleUpdateModalClose}
          onSave={handleAddOrUpdateProduct}
          productId={selectedProduct.id}
        />
      )}
      {showImageModal && (
        <ImageUploadModal
          show={showImageModal}
          onClose={handleImageModalClose}
          product={selectedProduct}
          onUpload={handleImageUpload}
          products={filteredProducts}
          currentProductId={selectedProduct?.id}
        />
      )}
      <ExcelUploaderModal
        show={showModalExcel}
        onClose={() => setShowModalExcel(false)}
      />
      <CSVUploadModal show={showModal} onClose={handleCloseModal} />
      {showDetailsModal && selectedProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px 25px",
              borderRadius: "12px",
              width: "600px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.3s ease-in-out",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                marginBottom: 20,
                fontSize: "20px",
                color: "#333",
                textAlign: "left",
              }}
            >
              Product Details
            </h2>
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ flex: "0 0 200px" }}>
                {selectedProduct.thumbnail ? (
                  <img
                    src={`${API_URL}${selectedProduct.thumbnail}`}
                    alt={selectedProduct.itemname}
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "15px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "200px",
                      height: "200px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "15px",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
           
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>ID:</strong> {String(selectedProduct.id).padStart(5, "0")}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Item Code:</strong> {selectedProduct.itemcode}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Item Name:</strong> {selectedProduct.itemname}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Category:</strong> {selectedProduct.category}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Subcategory:</strong> {selectedProduct.subcategory || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Brand:</strong> {selectedProduct.brand || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Model:</strong> {selectedProduct.model || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Size:</strong> {selectedProduct.size || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Color:</strong> {selectedProduct.color || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Price:</strong> ₹{selectedProduct.price}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Rack Code:</strong> {selectedProduct.rackcode || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Quantity:</strong> {selectedProduct.quantity}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Reorder Quantity:</strong> {selectedProduct.reorderqty || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Unit:</strong> {selectedProduct.unit}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>CCT:</strong> {selectedProduct.cct || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Beam Angle:</strong> {selectedProduct.beamangle || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Cutout Dia:</strong> {selectedProduct.cutoutdia || "N/A"}
              </p>
              {/* New fields added */}
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>CRI:</strong> {selectedProduct.cri || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Lumens:</strong> {selectedProduct.lumens || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <strong>Watt:</strong> {selectedProduct.watt || "N/A"}
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
                <i>Description</i>:
              </p>
              <div>{selectedProduct.description || "N/A"}</div>
            </div> </div>
            <div
              style={{
                marginTop: 25,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleDetailsModalClose}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: "8px",
                  backgroundColor: "#eee",
                  border: "none",
                  color: "#555",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ddd")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#eee")
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="card-body">
        {/* Search and Filter Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
          <input
            type="text"
            placeholder="Search by Name, HSN, Category..."
            className="form-control w-40 w-md-33"
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="d-flex gap-3">
            <select
              className="form-select w-50 w-md-33"
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
            <select
              className="form-select w-50 w-md-33"
              value={filterBrand}
              onChange={handleBrandFilter}
            >
              <option value="">All Brands</option>
              {brands.map((brand, idx) => (
                <option key={idx} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex gap-2 justify-content-start align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="noImageFilter"
                checked={showNoImageOnly}
                onChange={handleNoImageFilter}
              />
              <label className="form-check-label" htmlFor="noImageFilter">
                Show products without images
              </label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="nullOrZeroMRPFilter"
                checked={showNullOrZeroMRP}
                onChange={handleNullOrZeroMRPFilter}
              />
              <label className="form-check-label" htmlFor="nullOrZeroMRPFilter">
                Show products where MRP is null or 0
              </label>
            </div>
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
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="tm_round_border table align-items-center justify-content-center mb-0">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("itemcode")}>
                      Item Code{" "}
                      {sortColumn === "itemcode" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("in_display")}>
                      In Display{" "}
                      {sortColumn === "in_display" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Thumbnail</th>
                    <th onClick={() => handleSort("itemname")}>
                      Item Name{" "}
                      {sortColumn === "itemname" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    {/* <th onClick={() => handleSort("cct")}>
                      CCT{" "}
                      {sortColumn === "cct" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("beamangle")}>
                      Beam Angle{" "}
                      {sortColumn === "beamangle" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("cutoutdia")}>
                      Cutout Dia{" "}
                      {sortColumn === "cutoutdia" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th> */}
                    <th onClick={() => handleSort("category")}>
                      Category{" "}
                      {sortColumn === "category" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("subcategory")}>
                      Subcategory{" "}
                      {sortColumn === "subcategory" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Brand</th>
                    <th onClick={() => handleSort("price")}>
                      Price{" "}
                      {sortColumn === "price" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("quantity")}>
                      Quantity{" "}
                      {sortColumn === "quantity" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>
                      Created By{" "}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.reverse().length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.itemcode}</td>
                        <td>{product.in_display ? "NO" : "YES"}</td>
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
                                fontWeight: "900",
                                color: "#007bff",
                                cursor: "pointer",
                              }}
                              onClick={() => handleImageModalOpen(product)}
                            >
                              +
                            </i>
                          )}
                        </td>
                        <td>{product.itemname}</td>
                        {/* <td>{product.cct}</td>
                        <td>{product.beamangle}</td>
                        <td>{product.cutoutdia}</td> */}
                        <td>{product.category}</td>
                        <td>{product.subcategory}</td>
                        <td>{product.brand}</td>
                        <td>₹{product.price}</td>
                        <td>{product.quantity}</td>
                        <td>{product.created_by}</td>
                        <td>
                          <i
                            className="fa-solid fa-eye me-2"
                            style={{ cursor: "pointer", color: "#17a2b8" }}
                            onClick={() => handleDetailsModalOpen(product)}
                          ></i>
                          <i
                            className="fa-solid fa-pen me-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleUpdateModalOpen(product)}
                          ></i>
                          <i
                            className="fa-solid fa-trash"
                            style={{ cursor: "pointer", color: "#dc3545" }}
                            onClick={() => handleDeleteProduct(product.id)}
                          ></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Product table pagination" className="mt-4">
                <div className="pagination-container">
                  <ul className="pagination justify-content-center align-items-center">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        aria-label="First page"
                      >
                        <i className="fa-solid fa-angles-left"></i>
                      </button>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                      >
                        <i className="fa-solid fa-angle-left"></i>
                      </button>
                    </li>
                    {renderPageNumbers()}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                      >
                        <i className="fa-solid fa-angle-right"></i>
                      </button>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        aria-label="Last page"
                      >
                        <i className="fa-solid fa-angles-right"></i>
                      </button>
                    </li>
                  </ul>
                  <div className="jump-to-page">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Math.min(
                          Math.max(1, parseInt(e.target.value) || 1),
                          totalPages
                        );
                        handlePageChange(page);
                      }}
                      className="form-control"
                      aria-label="Jump to page"
                      placeholder="Page"
                    />
                  </div>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsTable;