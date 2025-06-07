"use client";
import React, { useState, useEffect } from "react";

const SwitchQuotatTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategories, setSelectedCategories] = useState({
    Switches: true,
    Sockets: true,
    "Safety Devices": true,
    Plates: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://api.panvic.in/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const productsWithQty = data.map((product) => ({
          ...product,
          qty: product.qty || 0,
        }));
        setProducts(productsWithQty);
        const uniqueBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))].sort();
        setBrands(uniqueBrands);
        setLoading(false);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by brand and selected categories
  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.category &&
        selectedCategories[product.category] &&
        (selectedBrand === "" || product.brand === selectedBrand)
    );
    setFilteredProducts(filtered);
  }, [products, selectedBrand, selectedCategories]);

  // Handle category checkbox change
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Handle quantity change
  const handleQtyChange = (id, newQty) => {
    const updatedProducts = filteredProducts.map((product) =>
      product.id === id ? { ...product, qty: Math.max(1, newQty) } : product
    );
    setFilteredProducts(updatedProducts);
  };

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (product.category && !acc[product.category]) acc[product.category] = [];
    if (product.category) acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="container py-4" style={{ background: "#f9f9f9" }}>
      <div className="mb-3 row align-items-center">
        <div className="col-md-4 mb-2">
          <label htmlFor="brand-select" className="form-label mb-1">Brand:</label>
          <select
            id="brand-select"
            className="form-select form-select-sm"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div className="col-md-8 mb-2">
          <div className="d-flex flex-wrap gap-2">
            {["Switches", "Sockets", "Safety Devices", "Plates"].map((category) => (
              <div className="form-check form-check-inline" key={category}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedCategories[category]}
                  onChange={() => handleCategoryChange(category)}
                  id={`cat-${category}`}
                />
                <label className="form-check-label" htmlFor={`cat-${category}`}>
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {["Switches", "Sockets", "Safety Devices", "Plates"].filter((cat) => selectedCategories[cat]).map((category) => (
        <div key={category} className="mb-4">
          <h5 className="mb-2" style={{ color: "#4b4b4b" }}>{category}</h5>
          <div className="table-responsive">
            <table className="table table-sm table-bordered table-hover bg-white align-middle" style={{ borderColor: "#e0e0e0" }}>
              <thead className="table-light">
                <tr>
                  <th style={{ width: 60 }}>SR NO</th>
                  {/* <th style={{ width: 120 }}>Item Code</th> */}
                  <th>Item Name</th>
                  <th style={{ width: 110 }}>Brand</th>
                  <th style={{ width: 100 }}>MRP</th>
                  <th style={{ width: 70 }}>Qty</th>
                  <th style={{ width: 110 }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {groupedProducts[category]?.length > 0 ? (
                  groupedProducts[category].map((product, index) => {
                    const mrp = typeof product.mrp === "number" ? product.mrp : 0;
                    const qty = product.qty || 1;
                    return (
                      <tr key={product.id}>
                        <td>{index + 1}</td>
                        {/* <td>{product.itemcode || "N/A"}</td> */}
                        <td>{product.itemname || "Unknown"}</td>
                        <td>{product.brand || "N/A"}</td>
                        <td>₹{product.price?.toFixed(2) || "0.00"}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) =>
                              handleQtyChange(product.id, parseInt(e.target.value) || 1)
                            }
                            className="form-control form-control-sm text-center"
                            style={{ width: 55 }}
                          />
                        </td>
                        <td>₹{(product.price * qty).toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-3">
                      No products found for {category}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwitchQuotatTable;
