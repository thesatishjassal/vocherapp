import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const InvoucherTable = ({ invoucherId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoucherId) return;

    const fetchItems = async () => {
      try {
        const response = await axios.get(`https://api.panvic.in/invouchers/${invoucherId}/items/`, {
          withCredentials: true,
        });

        setItems(response.data);
        console.log(items)
      } catch (error) {
        toast.error("Failed to fetch voucher items!");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [invoucherId]);

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this voucher.</p>;

  return (
    <div>
    <div className="table-responsive">
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Rack Code</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Discount %</th>
            <th>Add Discount %</th>
            <th>Amount</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.item_id}>
              <td>{index + 1}</td>
              <td>{item.product_id}</td>
              <td>{item.item_name}</td>
              <td>{item.unit}</td>
              <td>{item.rack_code}</td>
              <td>{item.quantity}</td>
              <td>{item.rate.toFixed(2)}</td>
              <td>{item.discount_percentage.toFixed(2)}%</td>
              <td>{item.additional_discount_percentage.toFixed(2)}%</td>
              <td>{item.amount.toFixed(2)}</td>''
              <td>{item.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default InvoucherTable;
