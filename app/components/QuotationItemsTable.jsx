"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const QuotationItemsTable = ({ quotation_id, selectedRevision }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    customerCode: true,
    customerDescription: true,
    itemCode: true,
    itemName: true,
    unit: true,
    brand: true,
    qty: true,
    price: true,
    discount: true,
    mrp: true,
    netPrice: true, // Added netPrice
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
          setItems(filteredItems);
        } else {
          response = await axios.get(
            `https://api.panvic.in/quotation/${quotation_id}/items/`,
            { withCredentials: true }
          );
          setItems(response.data);
        }

        console.log("Fetched Quotation ID:", quotation_id);
        console.log("Quotation Items:", response.data);
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

  // Calculate Net Price (assuming discount is a percentage)
  const calculateNetPrice = (price, discount) => {
    const discountValue = discount ? parseFloat(discount) : 0;
    const priceValue = price ? parseFloat(price) : 0;
    return (priceValue * (1 - discountValue / 100)).toFixed(2);
  };

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this quotation.</p>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-wrap gap-4 no-print checkbox-list">
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.srNo}
            onChange={() => handleCheckboxChange("srNo")}
          />{" "}
          SR NO
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.customerCode}
            onChange={() => handleCheckboxChange("customerCode")}
          />{" "}
          Customer Code
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.customerDescription}
            onChange={() => handleCheckboxChange("customerDescription")}
          />{" "}
          Customer Description
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.itemCode}
            onChange={() => handleCheckboxChange("itemCode")}
          />{" "}
          Item Code
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.itemName}
            onChange={() => handleCheckboxChange("itemName")}
          />{" "}
          Item Name
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.unit}
            onChange={() => handleCheckboxChange("unit")}
          />{" "}
          Unit
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.brand}
            onChange={() => handleCheckboxChange("brand")}
          />{" "}
          Brand
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.qty}
            onChange={() => handleCheckboxChange("qty")}
          />{" "}
          Qty
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.mrp}
            onChange={() => handleCheckboxChange("mrp")}
          />{" "}
          MRP
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.discount}
            onChange={() => handleCheckboxChange("discount")}
          />{" "}
          Discount
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.price}
            onChange={() => handleCheckboxChange("price")}
          />{" "}
          Price
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleColumns.netPrice}
            onChange={() => handleCheckboxChange("netPrice")}
          />{" "}
          Net Price
        </label>
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
            {visibleColumns.qty && <th>Qty</th>}
            {visibleColumns.mrp && <td>MRP</td>}
            {visibleColumns.discount && <th>Discount</th>}
            {visibleColumns.price && <th>Price</th>}
            {visibleColumns.netPrice && <th>Net Price</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              {visibleColumns.srNo && <td>{index + 1}</td>}
              {visibleColumns.image && (
                <th>
                  <img src={`https://api.panvic.in${item.image}`} className="thumbnail" />
                </th>
              )}
              {visibleColumns.customerCode && <td>{item.customercode}</td>}
              {visibleColumns.customerDescription && <td>{item.customerdescription}</td>}
              {visibleColumns.itemCode && <td>{item.itemcode}</td>}
              {visibleColumns.itemName && <td>{item.item_name}</td>}
              {visibleColumns.unit && <td>{item.unit}</td>}
              {visibleColumns.brand && <td>{item.brand}</td>}
              {visibleColumns.quantity && <td>{item.quantity}</td>}
              {visibleColumns.mrp && <td>{item.mrp}</td>}
              {visibleColumns.discount && <td>{item.discount}</td>}
              {visibleColumns.price && <td>{item.price}</td>}
              {visibleColumns.netPrice && (
                <td>{calculateNetPrice(item.price, item.discount)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationItemsTable;