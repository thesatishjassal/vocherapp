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
  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error}</div>;

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
    >
      <div className="modal-dialog modal-dialog-centered addwarehouseform">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Find Product</h1>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setShowModal(false)}
            ><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body py-3">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="product_id">Item Code</label>
                <Select
                  options={productCodeOptions}
                  value={selectedCode}
                  onChange={handleCodeChange}
                  placeholder="Select Item Code"
                  isClearable
                />
              </div>
              <div style={{ flex: 2 }}>
                <label htmlFor="itemname">Item Name</label>
                <Select
                  options={productNameOptions}
                  value={selectedName}
                  onChange={handleNameChange}
                  placeholder="Select Item Name"
                  isClearable
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindProduct;
