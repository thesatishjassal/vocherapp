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

  useEffect(() => {
    setIsClient(true);
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://api.panvic.in/products/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (!isClient) return null; // Prevent hydration error
  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error.message}</div>;

  const productCodeOptions = items.map((product) => ({
    label: product.id,
    value: product.id,
  }));

  const productNameOptions = items.map((product) => ({
    label: product.itemname,
    value: product.itemname,
  }));

  const handleCodeChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.id === selectedOption.value);
      setSelectedCode(selectedOption);
      setSelectedName({ label: selectedProduct.itemname, value: selectedProduct.itemname });
      handleProductSelect(selectedProduct);
    } else {
      setSelectedCode(null);
      setSelectedName(null);
      handleProductSelect(null);
    }
  };

  const handleNameChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.itemname === selectedOption.value);
      setSelectedName(selectedOption);
      setSelectedCode({ label: selectedProduct.id, value: selectedProduct.id });
      handleProductSelect(selectedProduct);
    } else {
      setSelectedName(null);
      setSelectedCode(null);
      handleProductSelect(null);
    }
  };

  return (
    <div className={`modal fade ${showModal ? "show" : ""}`} style={{ display: showModal ? "block" : "none", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog modal-dialog-centered addwarehouseform">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Find Product</h1>
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          <div className="modal-body py-3">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="product_id">Product ID</label>
                <Select 
                  options={productCodeOptions} 
                  value={selectedCode} 
                  onChange={handleCodeChange} 
                  placeholder="Select Product ID" 
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