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
  const [plateSubcategories, setPlateSubcategories] = useState([]);
  const [selectedPlateSubcategories, setSelectedPlateSubcategories] = useState([]);
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

        // Extract unique brands
        const uniqueBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))].sort();
        setBrands(uniqueBrands);

        // Extract Plates subcategories
        const plates = data.filter(p => p.category === "Plates");
        const subcats = [...new Set(plates.map(p => p.subcategory).filter(Boolean))].sort();
        setPlateSubcategories(subcats);
        setSelectedPlateSubcategories(subcats); // Select all by default

        setLoading(false);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by brand and selected categories (and subcategories if Plates)
  useEffect(() => {
    const filtered = products.filter((product) => {
      const categoryMatch = product.category && selectedCategories[product.category];
      const brandMatch = selectedBrand === "" || product.brand === selectedBrand;

      // If category is Plates, filter by subcategory
      if (product.category === "Plates" && selectedCategories["Plates"]) {
        return (
          categoryMatch &&
          brandMatch &&
          selectedPlateSubcategories.includes(product.subcategory)
        );
      }

      return categoryMatch && brandMatch;
    });

    setFilteredProducts(filtered);
  }, [products, selectedBrand, selectedCategories, selectedPlateSubcategories]);

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

          {/* Show Plates subcategories if Plates is selected */}
          {selectedCategories["Plates"] && plateSubcategories.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {plateSubcategories.map((subcat) => (
                <div className="form-check form-check-inline" key={subcat}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`plate-subcat-${subcat}`}
                    checked={selectedPlateSubcategories.includes(subcat)}
                    onChange={() => {
                      setSelectedPlateSubcategories((prev) =>
                        prev.includes(subcat)
                          ? prev.filter((s) => s !== subcat)
                          : [...prev, subcat]
                      );
                    }}
                  />
                  <label className="form-check-label" htmlFor={`plate-subcat-${subcat}`}>
                    {subcat}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead className="table-light">
            <tr>
              <th>SR NO</th>
              <th>Item Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>MRP</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const qty = product.qty || 1;
                return (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.itemname || "Unknown"}</td>
                    <td>{product.brand || "N/A"}</td>
                    <td>{product.category || "N/A"}</td>
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
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SwitchQuotatTable;
