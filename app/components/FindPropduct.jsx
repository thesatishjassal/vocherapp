"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";

const FindProduct = ({ showModal, setShowModal, handleProductSelect }) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedRackCode, setSelectedRackCode] = useState(null);
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
        // Add default unit if not present in API response
        const updatedData = data.map(item => ({
          ...item,
          unit: item.unit || "Piece" // Default to "Piece" if unit is missing
        }));
        setItems(updatedData);
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
    label: product.itemcode,
    value: product.itemcode,
  }));

  const productNameOptions = items.map((product) => ({
    label: product.itemname,
    value: product.itemname,
  }));

  const unitOptions = [...new Set(items.map(product => product.unit))].map(unit => ({
    label: unit,
    value: unit,
  }));

  const rackCodeOptions = [...new Set(items.map(product => product.rackcode))].map(rackcode => ({
    label: rackcode,
    value: rackcode,
  }));

  const handleCodeChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.itemcode === selectedOption.value);
      setSelectedCode(selectedOption);
      setSelectedName({ label: selectedProduct.itemname, value: selectedProduct.itemname });
      setSelectedUnit({ label: selectedProduct.unit, value: selectedProduct.unit });
      setSelectedRackCode({ label: selectedProduct.rackcode, value: selectedProduct.rackcode });
      handleProductSelect(selectedProduct);
    } else {
      setSelectedCode(null);
      setSelectedName(null);
      setSelectedUnit(null);
      setSelectedRackCode(null);
      handleProductSelect(null);
    }
  };

  const handleNameChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.itemname === selectedOption.value);
      setSelectedName(selectedOption);
      setSelectedCode({ label: selectedProduct.itemcode, value: selectedProduct.itemcode });
      setSelectedUnit({ label: selectedProduct.unit, value: selectedProduct.unit });
      setSelectedRackCode({ label: selectedProduct.rackcode, value: selectedProduct.rackcode });
      handleProductSelect(selectedProduct);
    } else {
      setSelectedName(null);
      setSelectedCode(null);
      setSelectedUnit(null);
      setSelectedRackCode(null);
      handleProductSelect(null);
    }
  };

  const handleUnitChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.unit === selectedOption.value);
      setSelectedUnit(selectedOption);
      if (selectedProduct) {
        setSelectedCode({ label: selectedProduct.itemcode, value: selectedProduct.itemcode });
        setSelectedName({ label: selectedProduct.itemname, value: selectedProduct.itemname });
        setSelectedRackCode({ label: selectedProduct.rackcode, value: selectedProduct.rackcode });
        handleProductSelect(selectedProduct);
      }
    } else {
      setSelectedUnit(null);
    }
  };

  const handleRackCodeChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.rackcode === selectedOption.value);
      setSelectedRackCode(selectedOption);
      if (selectedProduct) {
        setSelectedCode({ label: selectedProduct.itemcode, value: selectedProduct.itemcode });
        setSelectedName({ label: selectedProduct.itemname, value: selectedProduct.itemname });
        setSelectedUnit({ label: selectedProduct.unit, value: selectedProduct.unit });
        handleProductSelect(selectedProduct);
      }
    } else {
      setSelectedRackCode(null);
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
                <label htmlFor="product_id">Item Code</label>
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