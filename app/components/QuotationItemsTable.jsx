import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const QuotationItemsTable = ({ quotation_id }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quotation_id) return;

    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `https://api.panvic.in/quotation/${quotation_id}/items/`,
          { withCredentials: true }
        );

        console.log("Fetched Quotation ID:", quotation_id);
        console.log("Quotation Items:", response.data);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching quotation items:", error);
        toast.error("Failed to fetch quotation items!");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [quotation_id]);

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this quotation.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            <th>Customer Code</th>
            <th>Customer Description</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Brand</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Discount</th>
            <th>MRP</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.customercode}</td>
              <td>{item.customerdescription}</td>
              <td>{item.itemcode}</td>
              <td>{item.item_name}</td>
              <td>{item.unit}</td>
              <td>{item.brand}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.discount}</td>
              <td>{item.mrp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationItemsTable;
