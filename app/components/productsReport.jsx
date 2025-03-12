"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductsReport = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Text truncation
  const truncateText = (text, wordLimit = 8) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  // Search & Filter Handlers
  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleCategoryFilter = (e) => setFilterCategory(e.target.value);
  const handleStockFilter = (e) => setFilterStock(e.target.value);

  // Export to Excel
  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products_report.xlsx");
  };

  // Fetch products
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
  }, []);

  // Filter and sort logic
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

    if (filterStock) {
      filtered = filtered.filter((product) =>
        filterStock === "in" ? Number(product.quantity) > 0 : Number(product.quantity) <= 0
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filterCategory, filterStock, sortConfig]);

  // Get unique categories
  const categories = Array.from(new Set(products.map((product) => product.category))).filter(Boolean);

  // Sorting Handler
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="card">
      <div className="card-header pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6>Products List</h6>
        <button className="btn btn-success" onClick={handleExportToExcel}>Export Excel</button>
      </div>

      <div className="card-body">
        {/* Filters */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1 min-w-[200px]">
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder="Name, HSN, Category..."
              className="form-control"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="min-w-[150px]">
            <label className="form-label">Category</label>
            <select className="form-select" value={filterCategory} onChange={handleCategoryFilter}>
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="form-label">Stock</label>
            <select className="form-select" value={filterStock} onChange={handleStockFilter}>
              <option value="">All Stock</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-items-center mb-0">
            <thead>
              <tr>
                {["id", "thumbnail", "hsncode", "itemcode", "itemname", "category", "brand", "model", "price", "quantity"].map((header) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header)}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {header.toUpperCase()} {sortConfig.key === header ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.id}</td>
                    <td>
                      {product.thumbnail ? (
                        <img
                          src={`${API_URL}${product.thumbnail}`}
                          alt={product.itemname}
                          width="50"
                          height="50"
                          className="rounded"
                        />
                      ) : "-"}
                    </td>
                    <td>{product.hsncode}</td>
                    <td>{product.itemcode}</td>
                    <td>{truncateText(product.itemname)}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>{product.model}</td>
                    <td>₹{product.price}</td>
                    <td>{product.quantity > 0 ? product.quantity : <span className="text-danger">Out of Stock</span>}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10" className="text-center">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Minimal responsive styling */}
      <style jsx>{`
        @media (max-width: 768px) {
          .form-label {
            font-size: 0.8rem;
          }
          th, td {
            font-size: 0.8rem;
          }
          .min-w-[150px], .min-w-[200px] {
            flex: 1 1 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductsReport;
