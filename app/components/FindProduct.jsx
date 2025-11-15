"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";

const FindProduct = ({ showModal, setShowModal, handleProductSelect }) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    setIsClient(true);
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.panvic.in/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        // Ensure 'unit' defaults to 'Piece' if not provided
        const updatedData = data.map((item) => ({
          ...item,
          unit: item.unit || "Piece",
        }));
        setItems(updatedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (!isClient) return null; // Prevent hydration error
  if (isLoading) return <div className="text-center py-4">Loading products...</div>;
  if (error) return <div className="alert alert-danger mx-3 mt-3">Error loading products: {error}</div>;

  // Options for Select fields
  const productCodeOptions = items.map((product) => ({
    label: product.itemcode,
    value: product.itemcode,
  }));

  const productNameOptions = items.map((product) => ({
    label: product.itemname,
    value: product.itemname,
  }));

  // Handle Item Code Selection
  const handleCodeChange = (selectedOption) => {
    setSelectedCode(selectedOption);
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.itemcode === selectedOption.value);
      if (selectedProduct) {
        setSelectedName({ label: selectedProduct.itemname, value: selectedProduct.itemname });
        handleProductSelect(selectedProduct); // Send selected product to parent
      }
    } else {
      setSelectedName(null);
      handleProductSelect(null);
    }
  };

  // Handle Item Name Selection
  const handleNameChange = (selectedOption) => {
    setSelectedName(selectedOption);
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.itemname === selectedOption.value);
      if (selectedProduct) {
        setSelectedCode({ label: selectedProduct.itemcode, value: selectedProduct.itemcode });
        handleProductSelect(selectedProduct); // Send selected product to parent
      }
    } else {
      setSelectedCode(null);
      handleProductSelect(null);
    }
  };

  return (
    <div
      className={`modal fade ${showModal ? "show" : ""}`}
      style={{
        display: showModal ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered addwarehouseform">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h1 className="modal-title fs-5 fw-semibold">Find Product</h1>
            <button
              type="button"
              className="btn-close shadow-none"
              aria-label="Close"
              onClick={() => setShowModal(false)}
            >
              <i className="fa-solid fa-xmark fs-5"></i>
            </button>
          </div>
          <div className="modal-body py-4">
            <p className="text-muted small mb-3">Select either Item Code <strong>or</strong> Item Name to search quickly.</p>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="product_id" className="form-label fw-medium">Item Code</label>
                <Select
                  inputId="product_id"
                  options={productCodeOptions}
                  value={selectedCode}
                  onChange={handleCodeChange}
                  placeholder="Type or select Item Code..."
                  isClearable
                  isSearchable
                  classNamePrefix="product-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '42px',
                      borderColor: '#ced4da',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#adb5bd' },
                    }),
                  }}
                />
              </div>
              <div className="col-12">
                <label htmlFor="itemname" className="form-label fw-medium">Item Name</label>
                <Select
                  inputId="itemname"
                  options={productNameOptions}
                  value={selectedName}
                  onChange={handleNameChange}
                  placeholder="Type or select Item Name..."
                  isClearable
                  isSearchable
                  classNamePrefix="product-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '42px',
                      borderColor: '#ced4da',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#adb5bd' },
                    }),
                  }}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-top py-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowModal(false)}
            >
              <i className="fa-solid fa-times me-1"></i>Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindProduct;