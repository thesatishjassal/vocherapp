import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const QuotationItemsTable = ({ quotation_id }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Column visibility state
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
  });

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

  // Toggle visibility of columns
  const handleCheckboxChange = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this quotation.</p>;

  return (
    <div className="overflow-x-auto">
      {/* Column visibility checkboxes */}
      <div className="mb-4 flex flex-wrap gap-4 no-print">
        <label><input type="checkbox" checked={visibleColumns.srNo} onChange={() => handleCheckboxChange('srNo')} /> SR NO</label>
        <label><input type="checkbox" checked={visibleColumns.customerCode} onChange={() => handleCheckboxChange('customerCode')} /> Customer Code</label>
        <label><input type="checkbox" checked={visibleColumns.customerDescription} onChange={() => handleCheckboxChange('customerDescription')} /> Customer Description</label>
        <label><input type="checkbox" checked={visibleColumns.itemCode} onChange={() => handleCheckboxChange('itemCode')} /> Item Code</label>
        <label><input type="checkbox" checked={visibleColumns.itemName} onChange={() => handleCheckboxChange('itemName')} /> Item Name</label>
        <label><input type="checkbox" checked={visibleColumns.unit} onChange={() => handleCheckboxChange('unit')} /> Unit</label>
        <label><input type="checkbox" checked={visibleColumns.brand} onChange={() => handleCheckboxChange('brand')} /> Brand</label>
        <label><input type="checkbox" checked={visibleColumns.qty} onChange={() => handleCheckboxChange('qty')} /> Qty</label>
        <label><input type="checkbox" checked={visibleColumns.price} onChange={() => handleCheckboxChange('price')} /> Price</label>
        <label><input type="checkbox" checked={visibleColumns.discount} onChange={() => handleCheckboxChange('discount')} /> Discount</label>
        <label><input type="checkbox" checked={visibleColumns.mrp} onChange={() => handleCheckboxChange('mrp')} /> MRP</label>
      </div>

      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            {visibleColumns.srNo && <th>SR NO</th>}
            {visibleColumns.customerCode && <th>Customer Code</th>}
            {visibleColumns.customerDescription && <th>Customer Description</th>}
            {visibleColumns.itemCode && <th>Item Code</th>}
            {visibleColumns.itemName && <th>Item Name</th>}
            {visibleColumns.unit && <th>Unit</th>}
            {visibleColumns.brand && <th>Brand</th>}
            {visibleColumns.qty && <th>Qty</th>}
            {visibleColumns.price && <th>Price</th>}
            {visibleColumns.discount && <th>Discount</th>}
            {visibleColumns.mrp && <th>MRP</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              {visibleColumns.srNo && <td>{index + 1}</td>}
              {visibleColumns.customerCode && <td>{item.customercode}</td>}
              {visibleColumns.customerDescription && <td>{item.customerdescription}</td>}
              {visibleColumns.itemCode && <td>{item.itemcode}</td>}
              {visibleColumns.itemName && <td>{item.item_name}</td>}
              {visibleColumns.unit && <td>{item.unit}</td>}
              {visibleColumns.brand && <td>{item.brand}</td>}
              {visibleColumns.qty && <td>{item.quantity}</td>}
              {visibleColumns.price && <td>{item.price}</td>}
              {visibleColumns.discount && <td>{item.discount}</td>}
              {visibleColumns.mrp && <td>{item.mrp}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationItemsTable;
