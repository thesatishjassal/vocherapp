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
  const [expandedCategories, setExpandedCategories] = useState({
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
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        console.log("API Response:", data); // Debug log
        const productsWithQty = data.map((product) => ({
          ...product,
          qty: product.qty || 1,
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

  // Handle accordion toggle
  const toggleAccordion = (category) => {
    setExpandedCategories((prev) => ({
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

  // Handle remove product
  const handleRemove = (id) => {
    setFilteredProducts(filteredProducts.filter((product) => product.id !== id));
  };

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (product.category && !acc[product.category]) {
      acc[product.category] = [];
    }
    if (product.category) {
      acc[product.category].push(product);
    }
    return acc;
  }, {});

  return (
    <div className="switch-quotat-container">
      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="brand-filter">
        <label htmlFor="brand-select">Filter by Brand:</label>
        <select
          className="form-select w-30"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
      <div className="category-checkboxes">
        {["Switches", "Sockets", "Safety Devices", "Plates"].map((category) => (
          <label key={category} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedCategories[category]}
              onChange={() => handleCategoryChange(category)}
            />
            {category}
          </label>
        ))}
      </div>
      <div className="accordion-container">
        {["Switches", "Sockets", "Safety Devices", "Plates"]
          .filter((category) => selectedCategories[category])
          .map((category) => (
            <div key={category} className="accordion-item">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion(category)}
              >
                <h2>{category}</h2>
                <span>{expandedCategories[category] ? "−" : "+"}</span>
              </div>
              {expandedCategories[category] && (
                <div className="accordion-body">
                  {groupedProducts[category]?.length > 0 ? (
                    <table className="switch-quotat-table">
                      <thead>
                        <tr>
                          <th>SR NO</th>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Brand</th>
                          <th>MRP</th>
                          <th>Qty</th>
                          <th>Price</th>
                          {/* <th className="no-print">Actions</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {groupedProducts[category].map((product, index) => {
                          const mrp = typeof product.mrp === "number" ? product.mrp : 0;
                          const qty = product.qty || 1;
                          return (
                            <tr key={product.id}>
                              <td>{index + 1}</td>
                              <td>{product.itemcode || "N/A"}</td>
                              <td>{product.itemname || "Unknown"}</td>
                              <td>{product.brand || "N/A"}</td>
                              <td>₹{product.price.toFixed(2)}</td>
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  value={qty}
                                  onChange={(e) =>
                                    handleQtyChange(product.id, parseInt(e.target.value) || 1)
                                  }
                                  className="qty-input"
                                />
                              </td>
                              <td>₹{(product.price * qty).toFixed(2)}</td>
                              {/* <td className="no-print">
                                <button
                                  onClick={() => handleRemove(product.id)}
                                  className="remove-btn"
                                >
                                  Remove
                                </button>
                              </td> */}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data">No products found for {category}</p>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default SwitchQuotatTable;