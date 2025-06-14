"use client";
import React, { useState, useEffect, useMemo } from "react";

const GSTCalculator = ({ totalAmount, onGSTChange }) => {
  const [gstPercentage, setGstPercentage] = useState(0);
  const [gstType, setGstType] = useState("include");

  const gstAmount = (totalAmount * gstPercentage) / 100;
  const totalWithGST = gstType === "exclude" ? totalAmount + gstAmount : totalAmount;
  const withoutGST = gstType === "exclude" ? totalAmount : totalAmount / (1 + gstPercentage / 100);

  useEffect(() => {
    if (onGSTChange) {
      onGSTChange({
        gstAmount: gstAmount || 0,
        totalWithGST: totalWithGST || 0,
        withoutGST: withoutGST || 0,
        gstPercentage,
        gstType,
      });
    }
  }, [gstAmount, totalWithGST, withoutGST, gstPercentage, gstType, onGSTChange]);

  return (
    <div className="row p-4">
      {gstType === "exclude" && (
        <div className="col-md-6">
          <input
            type="number"
            placeholder="Enter GST%"
            value={gstPercentage}
            onChange={(e) => setGstPercentage(Math.max(0, parseFloat(e.target.value) || 0))}
            className="form-control m-0 no-print"
            min="0"
            max="100"
          />
        </div>
      )}

      <div className="col-md-6 no-print">
        <select
          value={gstType}
          onChange={(e) => setGstType(e.target.value)}
          className="form-select m-0"
        >
          <option value="" disabled>
            Select GST type?
          </option>
          <option value="include">Include GST</option>
          <option value="exclude">Exclude GST</option>
        </select>
      </div>

      <table>
        <tbody>
          {gstType === "exclude" && (
            <>
              <tr>
                <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                  <p className="m-0">Without GST:</p>
                </td>
                <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                  {totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                  <p className="m-0">
                    GST Amt (<b>{gstPercentage}%</b>):
                  </p>
                </td>
                <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                  {gstAmount.toFixed(2)}
                </td>
              </tr>
            </>
          )}

          <tr>
            <td className="tm_width_2 tm_primary_color tm_border_none tm_bold">
              <p className="m-0">
                Total Amount <b>{gstType === "exclude" ? "with" : "including"} GST</b>:
              </p>
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
              {totalWithGST.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const SwitchQuotatTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands] = useState(["Wipro", "L&T"]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedSwitchSocketSubcategory, setSelectedSwitchSocketSubcategory] = useState("");
  const [selectedPlateSubcategory, setSelectedPlateSubcategory] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [gstDetails, setGstDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryColors = {
    Switches: "bg-primary-subtle",
    Sockets: "bg-success-subtle",
    Plates: "bg-info-subtle",
    "N/A": "bg-light",
  };

  const switchSocketSubcategories = ["Regular Switch", "Flat Switch"];
  const plateSubcategories = ["Mounting Plates", "Frame Plates", "Back Grid Frames", "Designer Plates"];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://api.panvic.in/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          setError("No products found.");
          setLoading(false);
          return;
        }

        const productsWithQty = data.map((product) => ({
          ...product,
          qty: product.qty || 0,
          discount: product.discount || 0,
        }));

        setProducts(productsWithQty);
        setLoading(false);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update models based on selected brand
  const brandModels = useMemo(() => {
    if (!selectedBrand) return [];
    return [
      ...new Set(
        products
          .filter(
            (p) =>
              p.brand === selectedBrand &&
              p.model &&
              (p.category === "Switches" || p.category === "Sockets" || p.category === "Plates")
          )
          .map((p) => p.model)
      ),
    ].sort();
  }, [selectedBrand, products]);

  useEffect(() => {
    setModels(brandModels);
    if (!brandModels.includes(selectedModel)) {
      setSelectedModel("");
      setSelectedSwitchSocketSubcategory("");
      setSelectedPlateSubcategory("");
    }
  }, [brandModels, selectedModel]);

  // Memoized filtered products
  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedBrand) {
      result = result.filter((product) => product.brand === selectedBrand);
    } else {
      return [];
    }

    if (selectedModel) {
      result = result.filter((product) => product.model === selectedModel);
    }

    result = result.filter(
      (product) =>
        product.category === "Switches" ||
        product.category === "Sockets" ||
        product.category === "Plates"
    );

    if (selectedSwitchSocketSubcategory) {
      result = result.filter(
        (product) =>
          (product.category !== "Switches" && product.category !== "Sockets") ||
          product.subcategory === selectedSwitchSocketSubcategory
      );
    }

    if (selectedPlateSubcategory) {
      result = result.filter(
        (product) =>
          product.category !== "Plates" || product.subcategory === selectedPlateSubcategory
      );
    }

    return result;
  }, [
    products,
    selectedBrand,
    selectedModel,
    selectedSwitchSocketSubcategory,
    selectedPlateSubcategory,
  ]);

  // Sync filteredProducts with memoized filtered
  useEffect(() => {
    setFilteredProducts(filtered);
  }, [filtered]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredProducts.reduce((sum, product) => {
      const qty = Math.max(0, product.qty || 0);
      const discount = Math.max(0, Math.min(100, product.discount || 0));
      const price = product.price || 0;
      const amount = price * qty * (1 - discount / 100);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [filteredProducts]);

  const handleQtyChange = (id, newQty) => {
    const validatedQty = Math.max(0, parseInt(newQty) || 0);
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, qty: validatedQty } : product
      )
    );
  };

  const handleDiscountChange = (id, newDiscount) => {
    const validatedDiscount = Math.max(0, Math.min(100, parseFloat(newDiscount) || 0));
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, discount: validatedDiscount } : product
      )
    );
  };

  const handleGSTChange = (gstData) => {
    setGstDetails(gstData);
  };

  return (
    <div className="container py-4 position-relative">
      {loading && (
        <div
          className="d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", zIndex: 1000 }}
        >
          <div className="text-center">
            <div className="spinner-border spinner-border-lg text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading products...</p>
          </div>
        </div>
      )}

      <div className="mb-3 row align-items-center">
        <div className="col-md-3 mb-2">
          <label className="form-label mb-1">Quotation ID:</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={quotationId}
            onChange={(e) => setQuotationId(e.target.value)}
            placeholder="Enter Quotation ID"
          />
        </div>
      </div>

      <div className="mb-3 row align-items-center">
        <div className="col-md-3 mb-2">
          <label className="form-label mb-1">Brand:</label>
          <select
            className="form-select form-select-sm"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 mb-2">
          <label className="form-label mb-1">Model:</label>
          <select
            className="form-select form-select-sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand || !models.length}
          >
            <option value="">Select Model</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 mb-2">
          <label className="form-label mb-1">Switches and Sockets Type:</label>
          <select
            className="form-select form-select-sm"
            value={selectedSwitchSocketSubcategory}
            onChange={(e) => setSelectedSwitchSocketSubcategory(e.target.value)}
            disabled={!selectedBrand || !selectedModel}
          >
            <option value="">All Types</option>
            {switchSocketSubcategories.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 mb-2">
          <label className="form-label mb-1">Plates Subcategory:</label>
          <select
            className="form-select form-select-sm"
            value={selectedPlateSubcategory}
            onChange={(e) => setSelectedPlateSubcategory(e.target.value)}
            disabled={!selectedBrand || !selectedModel}
          >
            <option value="">All Subcategories</option>
            {plateSubcategories.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
              <th>Discount (%)</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const qty = Math.max(0, product.qty || 0);
                const discount = Math.max(0, Math.min(100, product.discount || 0));
                const displayPrice = product.price || 0;
                const amount = displayPrice * qty * (1 - discount / 100);
                const categoryClass = categoryColors[product.category || "N/A"];

                return (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.itemname || "Unknown"}</td>
                    <td>{product.brand || "N/A"}</td>
                    <td>{product.model || "N/A"}</td>
                    <td className={categoryClass}>{product.category || "N/A"}</td>
                    <td>₹{displayPrice.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => handleQtyChange(product.id, parseInt(e.target.value))}
                        className="form-control form-control-sm text-center"
                        style={{ width: 55 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => handleDiscountChange(product.id, parseFloat(e.target.value))}
                        className="form-control form-control-sm text-center"
                        style={{ width: 55 }}
                      />
                    </td>
                    <td>₹{isNaN(amount) ? "0.00" : amount.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-muted py-3">
                  {selectedBrand ? "No products found." : "Please select a Brand to start filtering."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex container py-4">
        <div className="col-md-6"></div>
        <div className="col-md-6">
          <h5 className="mb-3">Total Amount Details</h5>
          <GSTCalculator totalAmount={totalAmount} onGSTChange={handleGSTChange} />
        </div>
      </div>
    </div>
  );
};

export default SwitchQuotatTable;