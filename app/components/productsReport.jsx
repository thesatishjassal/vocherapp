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
  const [filterBrand, setFilterBrand] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleCategoryFilter = (e) => setFilterCategory(e.target.value);
  const handleStockFilter = (e) => setFilterStock(e.target.value);
  const handleBrandFilter = (e) => setFilterBrand(e.target.value);
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products_report.xlsx");
  };

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

    if (filterBrand) {
      filtered = filtered.filter((product) => product.brand === filterBrand);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.createdAt);
        return productDate >= start && productDate <= end;
      });
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filterCategory, filterStock, filterBrand, startDate, endDate, sortConfig]);

  const categories = Array.from(new Set(products.map((product) => product.category))).filter(Boolean);
  const brands = Array.from(new Set(products.map((product) => product.brand))).filter(Boolean);

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
            <label className="form-label">Brand</label>
            <select className="form-select" value={filterBrand} onChange={handleBrandFilter}>
              <option value="">All Brands</option>
              {brands.map((brand, idx) => (
                <option key={idx} value={brand}>{brand}</option>
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
          <div className="min-w-[150px]">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={startDate} onChange={handleStartDateChange} />
          </div>
          <div className="min-w-[150px]">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={endDate} onChange={handleEndDateChange} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                {["id", "thumbnail", "RacK Code", "itemcode", "itemname", "category", "brand", "model", "price", "quantity", "createdAt"].map((header) => (
                  <th key={header} onClick={() => handleSort(header)} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
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
                    <td><img src={`https://api.panvic.in${product.thumbnail}`} alt="" className="thumnail" /></td>
                    <td>{product.rackcode}</td>
                    <td>{product.itemcode}</td>
                    <td>{product.itemname}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>{product.model}</td>
                    <td>₹{product.price}</td>
                    <td>{product.quantity > 0 ? product.quantity : <span className="text-danger">Out of Stock</span>}</td>
                    <td>{product.createdAt}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10" className="text-center">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsReport;
