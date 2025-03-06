import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const OutvoucherTable = ({ vouvher_id }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vouvher_id) return;

    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `https://api.panvic.in/outvouchers/${vouvher_id}/items/`,
          { withCredentials: true }
        );

        setItems(response.data);
      } catch (error) {
        toast.error("Failed to fetch voucher items!");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [vouvher_id]);

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this voucher.</p>;

  return (
    <div>
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Rackcode</th>
            <th>Qty</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.itemcode}</td>
              <td>{item.itemname}</td>
              <td>{item.unit}</td>
              <td>{item.rackcode}</td>
              <td>{item.qty}</td>
              <td>{item.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OutvoucherTable;
