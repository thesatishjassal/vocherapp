"use client";
import { useEffect, useState, useRef } from "react";
import AddProductForm from "./AddProductForm";
import UpdateProductForm from "./UpdateProductForm";
import ImageUploadModal from "../components/ImageUploadModal";
import ExcelUploaderModal from "./ExcelUploader";
import CSVUploadModal from "./CSVUpload";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const COLUMNS = [
  { key: "itemcode", label: "Code", sortable: true },
  { key: "thumb", label: "" },
  { key: "itemname", label: "Name", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "brand", label: "Brand" },
  { key: "price", label: "Price", sortable: true, align: "end" },
  { key: "quantity", label: "Qty", sortable: true, align: "end" },
  { key: "in_display", label: "Display", sortable: true },
  { key: "created_by", label: "By" },
  { key: "actions", label: "", align: "end" },
];

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
  const [filterBrand, setFilterBrand] = useState("");
  const [showNoImageOnly, setShowNoImageOnly] = useState(false);
  const [showNullOrZeroMRP, setShowNullOrZeroMRP] = useState(false);
  const [showModalExcel, setShowModalExcel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const itemsPerPage = 25;

  const prevSearchQuery = useRef("");
  const prevFilterCategory = useRef("");
  const prevFilterBrand = useRef("");
  const prevShowNoImageOnly = useRef(false);
  const prevShowNullOrZeroMRP = useRef(false);
  const prevSortColumn = useRef(null);
  const prevSortOrder = useRef("asc");

  const uploadedImagesCount = products.filter((p) => p.thumbnail).length;

  // Modal handlers
  const handleCloseModal = () => setShowModal(false);
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

  const handleAddOrUpdateProduct = (updatedProduct) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === updatedProduct.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = updatedProduct;
        return next;
      }
      return [...prev, updatedProduct];
    });
    setShowAddModal(false);
    setShowUpdateModal(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await fetch(`${API_URL}/products/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleImageUpload = (productId, newImage) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, thumbnail: newImage } : p))
    );
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "SKU", "Name", "Type", "Published", "Is featured?",
      "Visibility in catalog", "Short description", "Description",
      "Regular price", "Sale price", "Stock", "Categories", "Images",
      "Attributes", "Meta: unit", "Meta: rackcode", "Meta: size",
      "Meta: color", "Meta: model", "Meta: brand", "Meta: reorderqty",
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
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "woocommerce_products_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filters + sorting
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        [p.itemname, p.category, p.subcategory, p.itemcode].some((f) =>
          f?.toLowerCase().includes(searchQuery)
        )
      );
    }
    if (filterCategory)
      filtered = filtered.filter((p) => p.category === filterCategory);
    if (filterBrand)
      filtered = filtered.filter((p) => p.brand === filterBrand);
    if (showNoImageOnly) filtered = filtered.filter((p) => !p.thumbnail);
    if (showNullOrZeroMRP)
      filtered = filtered.filter((p) => p.price == null || p.price === 0);

    if (sortColumn) {
      filtered.sort((a, b) => {
        const vA = a[sortColumn] || "";
        const vB = b[sortColumn] || "";
        if (sortColumn === "price" || sortColumn === "quantity") {
          return sortOrder === "asc"
            ? Number(vA) - Number(vB)
            : Number(vB) - Number(vA);
        }
        return sortOrder === "asc"
          ? String(vA).localeCompare(String(vB))
          : String(vB).localeCompare(String(vA));
      });
    }

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

    prevSearchQuery.current = searchQuery;
    prevFilterCategory.current = filterCategory;
    prevFilterBrand.current = filterBrand;
    prevShowNoImageOnly.current = showNoImageOnly;
    prevShowNullOrZeroMRP.current = showNullOrZeroMRP;
    prevSortColumn.current = sortColumn;
    prevSortOrder.current = sortOrder;
  }, [
    products, searchQuery, filterCategory, filterBrand,
    showNoImageOnly, showNullOrZeroMRP, sortColumn, sortOrder,
  ]);

  useEffect(() => {
    const handleOpenModal = (e) => {
      setSelectedProduct(e.detail);
      setShowImageModal(true);
    };
    window.addEventListener("openImageModal", handleOpenModal);
    return () => window.removeEventListener("openImageModal", handleOpenModal);
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage === totalPages)
      startPage = Math.max(1, endPage - maxPagesToShow + 1);

    if (startPage > 1)
      pages.push(<span key="e1" className="pt-ellipsis">…</span>);

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <button
          key={page}
          className={`pt-page ${currentPage === page ? "active" : ""}`}
          onClick={() => handlePageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      );
    }

    if (endPage < totalPages)
      pages.push(<span key="e2" className="pt-ellipsis">…</span>);

    return pages;
  };

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  const brands = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);

  const detailFields = selectedProduct
    ? [
        ["ID", String(selectedProduct.id).padStart(5, "0")],
        ["Item Code", selectedProduct.itemcode],
        ["Item Name", selectedProduct.itemname],
        ["Category", selectedProduct.category],
        ["Subcategory", selectedProduct.subcategory],
        ["Brand", selectedProduct.brand],
        ["Model", selectedProduct.model],
        ["Size", selectedProduct.size],
        ["Color", selectedProduct.color],
        ["Price", `₹${selectedProduct.price}`],
        ["Rack Code", selectedProduct.rackcode],
        ["Quantity", selectedProduct.quantity],
        ["Reorder Qty", selectedProduct.reorderqty],
        ["Unit", selectedProduct.unit],
        ["CCT", selectedProduct.cct],
        ["Beam Angle", selectedProduct.beamangle],
        ["Cutout Dia", selectedProduct.cutoutdia],
        ["CRI", selectedProduct.cri],
        ["Lumens", selectedProduct.lumens],
        ["Watt", selectedProduct.watt],
      ]
    : [];

  return (
    <div className="card pt-root">
      <style>{`
        .pt-root { font-size: 13px; border: 1px solid #e5e7eb; box-shadow: none; }
        .pt-head { display: flex; align-items: baseline; gap: 10px; padding: 10px 14px 0; }
        .pt-head h6 { margin: 0; font-size: 14px; font-weight: 600; }
        .pt-muted { color: #9ca3af; font-size: 12px; }

        .pt-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px 14px; }
        .pt-toolbar .pt-input, .pt-toolbar .pt-select {
          height: 28px; padding: 0 8px; font-size: 12px; border: 1px solid #e5e7eb;
          border-radius: 4px;  outline: none;
        }
        .pt-toolbar .pt-input { width: 200px; }
        .pt-toolbar .pt-select { max-width: 130px; }
        .pt-toolbar .pt-input:focus, .pt-toolbar .pt-select:focus { border-color: #6366f1; }
        .pt-check { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #4b5563; margin: 0; cursor: pointer; white-space: nowrap; }
        .pt-check input { margin: 0; }
        .pt-spacer { flex: 1; }
        .pt-btn { height: 28px; padding: 0 10px; font-size: 12px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; color: #374151; cursor: pointer; }
        .pt-btn:hover { background: #f3f4f6; }
        .pt-btn.primary { background: #111827; color: #fff; border-color: #111827; }
        .pt-btn.primary:hover { background: #1f2937; }

        .pt-wrap { overflow-x: auto; }
        .pt-table { width: 100%; border-collapse: collapse; }
        .pt-root .pt-table, .pt-root .pt-table tr, .pt-root .pt-table th, .pt-root .pt-table td {
          border-left: 0 !important; border-right: 0 !important; border-top: 0 !important;
          text-align: left !important; vertical-align: middle !important;
          white-space: nowrap !important; background-clip: padding-box;
        }
        .pt-root .pt-table th.end, .pt-root .pt-table td.end { text-align: right !important; }
        .pt-root .pt-table td { padding: 3px 10px !important; height: 34px; font-size: 13px !important; }
        .pt-root .pt-table td.pt-name { max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
        .pt-root .pt-btn { height: 28px !important; padding: 0 10px !important; font-size: 12px !important; font-weight: 500 !important; line-height: 26px !important; width: auto !important; min-width: 0 !important; box-shadow: none !important; text-transform: none !important; }
        .pt-root .pt-btn.primary { background: #111827 !important; color: #fff !important; border-color: #111827 !important; }
        .pt-root .pt-check { flex-direction: row; }
        .pt-table th {
          position: sticky; top: 0; background: #fafafa; z-index: 1;
          padding: 5px 10px !important; font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .03em; color: #6b7280; border-bottom: 1px solid #e5e7eb !important;
          white-space: nowrap; user-select: none;
        }
        .pt-table th.sortable { cursor: pointer; }
        .pt-table th.sortable:hover { color: #111827; }
        .pt-table td {
          padding: 3px 10px; border-bottom: 1px solid #f1f1f4; color: #374151;
          white-space: nowrap; vertical-align: middle; line-height: 1.3;
        }
        .pt-root .pt-table td { border-bottom: 1px solid #f1f1f4 !important; }
        .pt-table tbody tr:hover { background: #fafafa; }
        .pt-table .end { text-align: right; }
        .pt-name { max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
        .pt-sub { color: #9ca3af; font-size: 11px; }
        .pt-thumb { width: 28px; height: 28px; object-fit: cover; border-radius: 3px; cursor: pointer; display: block; }
        .pt-add { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          border: 1px dashed #d1d5db; border-radius: 3px; color: #9ca3af; cursor: pointer; font-style: normal; }
        .pt-add:hover { color: #6366f1; border-color: #6366f1; }
        .pt-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px; }
        .pt-actions i { cursor: pointer; color: #9ca3af; margin-left: 10px; font-size: 12px; }
        .pt-actions i:hover { color: #111827; }
        .pt-actions i.danger:hover { color: #dc2626; }

        .pt-pager { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 14px; }
        .pt-pages { display: flex; align-items: center; gap: 2px; }
        .pt-page { min-width: 26px; height: 26px; padding: 0 6px; font-size: 12px; border: 1px solid transparent;
          background: transparent; color: #4b5563; border-radius: 4px; cursor: pointer; }
        .pt-page:hover:not(:disabled) { background: #f3f4f6; }
        .pt-page.active { background: #111827; color: #fff; }
        .pt-page:disabled { opacity: .35; cursor: not-allowed; }
        .pt-ellipsis { padding: 0 4px; color: #9ca3af; }
        .pt-jump { width: 52px; height: 26px; font-size: 12px; text-align: center; border: 1px solid #e5e7eb; border-radius: 4px; }

        .pt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .pt-modal { background: #fff; border-radius: 8px; width: 560px; max-width: 94vw; max-height: 82vh; overflow-y: auto; padding: 16px 18px; box-shadow: 0 10px 30px rgba(0,0,0,.18); animation: ptFade .2s ease; }
        .pt-modal h2 { font-size: 15px; font-weight: 600; margin: 0 0 12px; }
        .pt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; }
        .pt-field { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
        .pt-field span:first-child { color: #9ca3af; }
        .pt-field span:last-child { color: #111827; text-align: right; }
        .pt-big { width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 10px; }
        .pt-noimg { width: 100%; height: 80px; background: #f5f5f5; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; margin-bottom: 10px; }
        @keyframes ptFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

        @media (max-width: 576px) {
          .pt-toolbar .pt-input { width: 100%; }
          .pt-grid { grid-template-columns: 1fr; }
          .pt-pager { flex-direction: column; }
        }
      `}</style>

      <div className="pt-head">
        <h6>Products</h6>
        <span className="pt-muted">
          {filteredProducts.length} items · {uploadedImagesCount} with images
        </span>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddProductForm show={showAddModal} onClose={handleAddModalClose} onSave={handleAddOrUpdateProduct} />
      )}
      {showUpdateModal && selectedProduct && (
        <UpdateProductForm show={showUpdateModal} onClose={handleUpdateModalClose} onSave={handleAddOrUpdateProduct} productId={selectedProduct.id} />
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
      <ExcelUploaderModal show={showModalExcel} onClose={() => setShowModalExcel(false)} />
      <CSVUploadModal show={showModal} onClose={handleCloseModal} />

      {showDetailsModal && selectedProduct && (
        <div className="pt-overlay" onClick={handleDetailsModalClose}>
          <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Product Details</h2>
            {selectedProduct.thumbnail ? (
              <img className="pt-big" src={`${API_URL}${selectedProduct.thumbnail}`} alt={selectedProduct.itemname} />
            ) : (
              <div className="pt-noimg">No image</div>
            )}
            <div className="pt-grid">
              {detailFields.map(([label, value]) => (
                <div className="pt-field" key={label}>
                  <span>{label}</span>
                  <span>{value || "—"}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12 }}>
              <div className="pt-muted">Description</div>
              <div>{selectedProduct.description || "—"}</div>
            </div>
            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button className="pt-btn" onClick={handleDetailsModalClose}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="pt-toolbar">
        <input
          type="text"
          placeholder="Search name, code, category…"
          className="pt-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />
        <select className="pt-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select className="pt-select" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <label className="pt-check">
          <input type="checkbox" checked={showNoImageOnly} onChange={(e) => setShowNoImageOnly(e.target.checked)} />
          No image
        </label>
        <label className="pt-check">
          <input type="checkbox" checked={showNullOrZeroMRP} onChange={(e) => setShowNullOrZeroMRP(e.target.checked)} />
          MRP 0/null
        </label>
        <span className="pt-spacer" />
        <button className="pt-btn" onClick={exportToCSV}>Export</button>
        <button className="pt-btn" onClick={() => setShowModal(true)}>Upload</button>
        <button className="pt-btn primary" onClick={handleAddModalOpen}>+ Add</button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 160 }}>
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="pt-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`${col.sortable ? "sortable" : ""} ${col.align === "end" ? "end" : "text-start"}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      {col.label}
                      {sortColumn === col.key && (sortOrder === "asc" ? " ↑" : " ↓")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  [...paginatedProducts].reverse().map((product) => (
                    <tr key={product.id}>
                      <td>{product.itemcode}</td>
                      <td>
                        {product.thumbnail ? (
                          <img
                            className="pt-thumb"
                            src={`${API_URL}${product.thumbnail}`}
                            alt={product.itemname}
                            onClick={() => handleImageModalOpen(product)}
                          />
                        ) : (
                          <i className="pt-add" onClick={() => handleImageModalOpen(product)}>+</i>
                        )}
                      </td>
                      <td className="pt-name" title={product.itemname}>{product.itemname}</td>
                      <td>
                        {product.category}
                        {product.subcategory && <span className="pt-sub"> / {product.subcategory}</span>}
                      </td>
                      <td>{product.brand}</td>
                      <td className="end">₹{product.price}</td>
                      <td className="end">{product.quantity}</td>
                      <td>
                        <span className="pt-dot" style={{ background: product.in_display ? "#d1d5db" : "#22c55e" }} />
                        {product.in_display ? "No" : "Yes"}
                      </td>
                      <td className="pt-muted">{product.created_by}</td>
                      <td className="end pt-actions">
                        <i className="fa-solid fa-eye" onClick={() => handleDetailsModalOpen(product)}></i>
                        <i className="fa-solid fa-pen" onClick={() => handleUpdateModalOpen(product)}></i>
                        <i className="fa-solid fa-trash danger" onClick={() => handleDeleteProduct(product.id)}></i>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={COLUMNS.length} className="text-center pt-muted" style={{ padding: 20 }}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Product table pagination" className="pt-pager">
              <span className="pt-muted">
                Page {currentPage} of {totalPages}
              </span>
              <div className="pt-pages">
                <button className="pt-page" onClick={() => handlePageChange(1)} disabled={currentPage === 1} aria-label="First page">
                  <i className="fa-solid fa-angles-left"></i>
                </button>
                <button className="pt-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
                  <i className="fa-solid fa-angle-left"></i>
                </button>
                {renderPageNumbers()}
                <button className="pt-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">
                  <i className="fa-solid fa-angle-right"></i>
                </button>
                <button className="pt-page" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} aria-label="Last page">
                  <i className="fa-solid fa-angles-right"></i>
                </button>
              </div>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages);
                  handlePageChange(page);
                }}
                className="pt-jump"
                aria-label="Jump to page"
              />
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsTable;