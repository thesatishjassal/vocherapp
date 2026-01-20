"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SwithcQuotationItemsTable = ({ quotation_id, selectedRevision }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    itemName: true,
    description: false,
    color: true,
    category: false,
    brand: true,
    itemcode: true,
    quantity: true,
    // mrp: true,
    // amount: false,
    discount_percent: true,
    net_price: true,
    unit: true,
    remarks: false,
  });

  /* FETCH ITEMS */
  useEffect(() => {
    if (!quotation_id) return;

    const fetchItems = async () => {
      try {
        let response;
        let mappedItems;

        if (selectedRevision) {
          response = await axios.get(
            `https://api.panvic.in/switch-quotations/?quotation_id=${quotation_id}`,
            { withCredentials: true }
          );

          mappedItems = response.data.filter(
            (item) => item.edited_at === selectedRevision.edited_at
          );
        } else {
          response = await axios.get(
            `https://api.panvic.in/switch-quotations/${quotation_id}`,
            { withCredentials: true }
          );

          mappedItems = response.data.items.map((item, index) => ({
            ...item,
            sr_no: item.sr_no || index + 1,
          }));
        }

        const sortedItems = mappedItems.sort(
          (a, b) => (a.sr_no || 0) - (b.sr_no || 0)
        );

        setItems(sortedItems);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch quotation items!");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [quotation_id, selectedRevision]);

  /* COLUMN TOGGLE */
  const handleCheckboxChange = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  /* SORT */
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedItems = [...items].sort((a, b) => {
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";

      if (!isNaN(aVal) && !isNaN(bVal)) {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return direction === "asc"
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });

    setItems(sortedItems);
  };

  const getSortIndicator = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  /* PRINT */
  const handlePrint = () => window.print();

  /* PDF */
  const handleSaveAsPDF = async () => {
    const element = document.getElementById("quotation-table");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("quotation-items.pdf");
  };

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found.</p>;

  return (
    <div className="relative overflow-x-auto">
      <style jsx>{`
        @media print {
          @page {
            size: A4 portrait;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="absolute top-0 right-0 no-print">
        <button
          onClick={handlePrint}
          className="px-3 py-2 bg-gray-200 rounded-md"
        >
          🖨 Print
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 no-print">
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

      <table id="quotation-table" className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            {visibleColumns.srNo && <th>SR NO</th>}
            {visibleColumns.itemcode && <th>Item Code</th>}
            {visibleColumns.itemName && (
              <th onClick={() => requestSort("item_name")}>
                Item Name {getSortIndicator("item_name")}
              </th>
            )}
            {visibleColumns.description && <th>Description</th>}
            {visibleColumns.color && <th>Color</th>}
            {visibleColumns.category && <th>Category</th>}
            {visibleColumns.brand && <th>Brand</th>}
            {visibleColumns.unit && <th>Unit</th>}
            {visibleColumns.quantity && <th>Qty</th>}
            {/* {visibleColumns.mrp && <th>MRP</th>} */}
            {visibleColumns.discount_percent && <th>Dis%</th>}
            {visibleColumns.net_price && <th>Net Price</th>}
            {/* {visibleColumns.amount && <th>Amount</th>} */}
            {visibleColumns.remarks && <th>Remarks</th>}
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index}>
              {visibleColumns.srNo && <td>{item.sr_no}</td>}
              {visibleColumns.itemcode && <td>{item.itemcode}</td>}
              {visibleColumns.itemName && <td>{item.item_name}</td>}
              {visibleColumns.description && <td>{item.description}</td>}
              {visibleColumns.color && <td>{item.color}</td>}
              {visibleColumns.category && <td>{item.category}</td>}
              {visibleColumns.brand && <td>{item.brand}</td>}
              {visibleColumns.quantity && <td>{item.quantity}</td>}
              {visibleColumns.unit && <td>{item.unit}</td>}
              {/* {visibleColumns.mrp && <td>{item.mrp}</td>} */}
              {visibleColumns.discount_percent && (
                  <td>{item.discount_percent}%</td>
                )}
                {visibleColumns.net_price && <td>{item.net_price}</td>}
              {/* {visibleColumns.amount && <td>{item.amount}</td>} */}
              {visibleColumns.remarks && <td>{item.remarks}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SwithcQuotationItemsTable;
