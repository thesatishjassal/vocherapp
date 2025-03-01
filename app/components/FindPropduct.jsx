"use client";
import React, { useState } from "react";
import Select from "react-select";

const FindProduct = ({ showModal, setShowModal, handleProductSelect, productList }) => {
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  const handleClose = () => {
    setShowModal(false); // Close modal when clicking close button
  };

  // Updated items array to match the JSON structure
  const items = [
    {
      product_id: "P001",
      item_name: "ORIENT 1200MM AEROQUIET FAN CHECKED FINISH",
      unit: "pcs",
      rack_code: "A1, A2",
      quantity: 5,
      rate: 2500,
      discount_percentage: 0,
      amount: 12500,
      comments: "In stock",
    },
    {
      product_id: "P002",
      item_name: "ORIENT 1200MM AEROQUIET FAN ROASTED COFFE",
      unit: "pcs",
      rack_code: "A2",
      quantity: 3,
      rate: 2600,
      discount_percentage: 5,
      amount: 7410,
      comments: "Limited stock",
    },
    {
      product_id: "P003",
      item_name: "ORIENT 200MM 3-1DE VENTILATION FAN GREY-3110810417110",
      unit: "box",
      rack_code: "A3",
      quantity: 10,
      rate: 3200,
      discount_percentage: 10,
      amount: 28800,
      comments: "Special discount applied",
    },
    {
      product_id: "P004",
      item_name: "ORIENT 450MM TORNADO WALL",
      unit: "pcs",
      rack_code: "A4",
      quantity: 8,
      rate: 1800,
      discount_percentage: 0,
      amount: 14400,
      comments: "",
    },
    // Add more items as needed, following the same structure
  ];

  const productCodeOptions = items.map((product) => ({
    label: `${product.product_id}`,
    value: product.product_id,
  }));

  const productNameOptions = items.map((product) => ({
    label: `${product.item_name}`,
    value: product.item_name,
  }));

  const handleCodeChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.product_id === selectedOption.value);
      setSelectedCode(selectedOption);
      setSelectedName({
        label: `${selectedProduct.item_name}`,
        value: selectedProduct.item_name,
      });
      handleProductSelect({
        product_id: selectedProduct.product_id,
        item_name: selectedProduct.item_name,
        unit: selectedProduct.unit,
        rack_code: selectedProduct.rack_code,
        quantity: selectedProduct.quantity,
        rate: selectedProduct.rate,
        discount_percentage: selectedProduct.discount_percentage,
        amount: selectedProduct.amount,
        comments: selectedProduct.comments,
      });
    } else {
      setSelectedCode(null);
      setSelectedName(null);
    }
  };

  const handleNameChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = items.find((item) => item.item_name === selectedOption.value);
      setSelectedName(selectedOption);
      setSelectedCode({
        label: `${selectedProduct.product_id}`,
        value: selectedProduct.product_id,
      });
      handleProductSelect({
        product_id: selectedProduct.product_id,
        item_name: selectedProduct.item_name,
        unit: selectedProduct.unit,
        rack_code: selectedProduct.rack_code,
        quantity: selectedProduct.quantity,
        rate: selectedProduct.rate,
        discount_percentage: selectedProduct.discount_percentage,
        amount: selectedProduct.amount,
        comments: selectedProduct.comments,
      });
    } else {
      setSelectedName(null);
      setSelectedCode(null);
    }
  };

  return (
    <div
      className={`modal fade show ${showModal ? "show" : ""}`}
      id="staticBackdrop"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
      style={{
        display: showModal ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered addwarehouseform">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Find Product
            </h1>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body py-3">
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <label htmlFor="product_id" style={{ display: "block", marginBottom: "5px" }}>
                  Product ID
                </label>
                <Select
                  options={productCodeOptions}
                  value={selectedCode}
                  onChange={handleCodeChange}
                  placeholder="Select Product ID"
                  isClearable
                  id="product_id"
                />
              </div>
              <div style={{ flex: 2 }}>
                <label htmlFor="item_name" style={{ display: "block", marginBottom: "5px" }}>
                  Item Name
                </label>
                <Select
                  options={productNameOptions}
                  value={selectedName}
                  onChange={handleNameChange}
                  placeholder="Select Item Name"
                  isClearable
                  id="item_name"
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