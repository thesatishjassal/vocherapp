"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlusCircle } from "react-icons/fi";

const QuotationItemsTable = ({ quotation_id, selectedRevision }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    customerCode: false,
    customerDescription: false,
    itemCode: true,
    itemName: true,
    unit: true,
    brand: true,
    qty: true,
    price: true,
    discount: false,
    mrp: false,
    netPrice: true,
    amount: true,
    image: true,
  });

  useEffect(() => {
    if (!quotation_id) return;

    const fetchItems = async () => {
      try {
        let response;
        if (selectedRevision) {
          response = await axios.get(
            `https://api.panvic.in/quotation-history/?quotation_id=${quotation_id}`,
            { withCredentials: true }
          );
          const filteredItems = response.data.filter(
            (item) => item.edited_at === selectedRevision.edited_at
          );
          setItems(
            filteredItems.map((item) => ({
              ...item,
              preview: item.image ? `https://api.panvic.in${item.image}` : null,
            }))
          );
        } else {
          response = await axios.get(
            `https://api.panvic.in/quotation/${quotation_id}/items/`,
            { withCredentials: true }
          );
          setItems(
            response.data.map((item) => ({
              ...item,
              preview: item.image ? `https://api.panvic.in${item.image}` : null,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching quotation items:", error);
        toast.error("Failed to fetch quotation items!");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [quotation_id, selectedRevision]);

  const handleCheckboxChange = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const updatedItems = [...items];
    updatedItems[index].preview = previewUrl;
    setItems(updatedItems);
  };

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this quotation.</p>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-wrap gap-4 no-print checkbox-list">
        {Object.entries(visibleColumns).map(([key, value]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleCheckboxChange(key)}
            />
            {key.toUpperCase()}
          </label>
        ))}
      </div>

      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            {visibleColumns.srNo && <th>SR NO</th>}
            {visibleColumns.image && <th>Image</th>}
            {visibleColumns.customerCode && <th>Customer Code</th>}
            {visibleColumns.customerDescription && <th>Customer Description</th>}
            {visibleColumns.itemCode && <th>Item Code</th>}
            {visibleColumns.itemName && <th>Item Name</th>}
            {visibleColumns.unit && <th>Unit</th>}
            {visibleColumns.brand && <th>Brand</th>}
            {visibleColumns.mrp && <th>MRP</th>}
            {visibleColumns.qty && <th>Qty</th>}
            {visibleColumns.discount && <th>Discount</th>}
            {visibleColumns.price && <th>Rate</th>}
            {visibleColumns.netPrice && <th>Net Price</th>}
            {visibleColumns.amount && <th>Amount</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              {visibleColumns.srNo && <td>{index + 1}</td>}

              {visibleColumns.image && (
                <td>
                  <div
                    className="relative group"
                    style={{
                      width: "60px",
                      height: "60px",
                      cursor: "pointer",
                      borderRadius: "8px",
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: "0 0 4px rgba(0,0,0,0.1)",
                      border: "1px solid #ddd",
                    }}
                    title="Click to upload image"
                    onClick={() =>
                      document.getElementById(`fileInput-${index}`).click()
                    }
                  >
                    <img
                      src={
                        item.preview ||
                        "https://via.placeholder.com/60x60?text=+"
                      }
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiPlusCircle
                        color="white"
                        size={24}
                        title="Upload Image"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      id={`fileInput-${index}`}
                      style={{ display: "none" }}
                      onChange={(e) => handleImageChange(e, index)}
                    />
                  </div>
                </td>
              )}

              {visibleColumns.customerCode && <td>{item.customercode}</td>}
              {visibleColumns.customerDescription && (
                <td>{item.customerdescription}</td>
              )}
              {visibleColumns.itemCode && <td>{item.itemcode}</td>}
              {visibleColumns.itemName && <td>{item.item_name}</td>}
              {visibleColumns.unit && <td>{item.unit}</td>}
              {visibleColumns.brand && <td>{item.brand}</td>}
              {visibleColumns.mrp && <td>{item.mrp}</td>}
              {visibleColumns.qty && <td>{item.quantity}</td>}
              {visibleColumns.discount && <td>{item.discount}%</td>}
              {visibleColumns.price && <td>{item.price}</td>}
              {visibleColumns.netPrice && <td>{item.netPrice}</td>}
              {visibleColumns.amount && <td>{item.amount}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationItemsTable;
