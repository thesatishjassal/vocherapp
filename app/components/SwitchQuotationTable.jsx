"use client";
import React, { useState, useEffect } from "react";

const SwitchQuotatTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedCategories, setSelectedCategories] = useState({
    Switches: false,
    Sockets: false,
    "Safety Devices": false,
    Plates: false,
  });

  const plateSubcategories = ["Blank Plate", "Blanking Plates", "Cover Plates", "Frame Plate"];
  const [selectedPlateSubcategory, setSelectedPlateSubcategory] = useState("Blank Plate");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Update models when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel("");
      return;
    }

    const brandModels = [
      ...new Set(
        products
          .filter((p) => p.brand === selectedBrand && p.model)
          .map((p) => p.model)
      ),
    ].sort();

    setModels(brandModels);
    setSelectedModel(""); // Reset on brand change
  }, [selectedBrand, products]);

  // Filter products
  useEffect(() => {
    const filtered = products.filter((product) => {
      const categoryMatch = selectedCategories[product.category];
      const brandMatch = !selectedBrand || product.brand === selectedBrand;
      const modelMatch = !selectedModel || product.model === selectedModel;

      const plateMatch =
        product.category === "Plates"
          ? product.subcategory === selectedPlateSubcategory
          : true;

      return categoryMatch && brandMatch && modelMatch && plateMatch;
    });

    setFilteredProducts(filtered);
  }, [products, selectedBrand, selectedModel, selectedCategories, selectedPlateSubcategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleQtyChange = (id, newQty) => {
    const updatedProducts = filteredProducts.map((product) =>
      product.id === id ? { ...product, qty: Math.max(1, newQty) } : product
    );
    setFilteredProducts(updatedProducts);
  };

  return (
    <div className="container py-4" style={{ background: "#f9f9f9" }}>
      <div className="mb-3 row align-items-start">
        {/* Brand Select */}
        <div className="col-md-3 mb-2">
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

        {/* Model Select */}
        <div className="col-md-3 mb-2">
          <label htmlFor="model-select" className="form-label mb-1">Model:</label>
          <select
            id="model-select"
            className="form-select form-select-sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!models.length}
          >
            <option value="">All Models</option>
            {models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Category Checkboxes */}
        <div className="col-md-6 mb-2">
          <label className="form-label mb-1">Categories:</label>
          <div className="d-flex flex-wrap gap-2">
            {Object.keys(selectedCategories).map((category) => (
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

          {/* Plates Subcategory Dropdown */}
          {selectedCategories["Plates"] && (
            <div className="mt-2">
              <label htmlFor="plates-subcategory" className="form-label mb-1">Plates Subcategory:</label>
              <select
                id="plates-subcategory"
                className="form-select form-select-sm"
                value={selectedPlateSubcategory}
                onChange={(e) => setSelectedPlateSubcategory(e.target.value)}
              >
                {plateSubcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading/Error */}
      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Table */}
      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead className="table-light">
            <tr>
              <th>SR NO</th>
              <th>Item Name</th>
              <th>Brand</th>
              <th>Model</th>
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
                    <td>{product.model || "N/A"}</td>
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
                <td colSpan={8} className="text-center text-muted py-3">
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
