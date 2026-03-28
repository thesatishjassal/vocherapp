"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SwithcQuotationItemsTable = ({ quotation_id, selectedRevision }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    itemcode: true,
    itemName: true,
    description: false,
    color: true,
    category: false,
    brand: true,
    unit: true,
    quantity: true,
    mrp: true, // ← Added (default visible)
    amount: true, // ← Added (Gross Amount)
    discount_percent: true,
    net_price: true, // Will be shown as "Total Amount"
    remarks: false,
  });

  /* FETCH ITEMS */
  useEffect(() => {
    if (!quotation_id) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        let mappedItems = [];

        if (selectedRevision) {
          const response = await axios.get(
            `${API_URL}/switch-quotations/?quotation_id=${quotation_id}`,
            { withCredentials: true }
          );
          mappedItems = response.data.filter(
            (item) => item.edited_at === selectedRevision.edited_at
          );
        } else {
          const response = await axios.get(
            `${API_URL}/switch-quotations/${quotation_id}`,
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
    sortConfig.key === key
      ? sortConfig.direction === "asc"
        ? " ▲"
        : " ▼"
      : "";

  /* PRINT & PDF */
  const handlePrint = () => window.print();

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
          td,
          th {
            padding: 6px 8px !important;
            font-size: 13px;
          }
        }
      `}</style>

      {/* Controls */}
      <div className="flex justify-between items-center mb-3 no-print">
        <div className="flex flex-wrap gap-4">
          {Object.entries(visibleColumns).map(([key, value]) => (
            <label key={key} className="text-sm">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleCheckboxChange(key)}
              />{" "}
              {key.replace("_", " ").toUpperCase()}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
          >
            🖨 Print
          </button>
          {/* <button onClick={handleSaveAsPDF} className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save as PDF
          </button> */}
        </div>
      </div>

      {/* Table */}
      <table
        id="quotation-table"
        className="tm_round_border table align-items-center justify-content-center mb-0 "
      >
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

            {/* New Columns */}
            {visibleColumns.mrp && <th className="text-end">MRP</th>}
            {/* {visibleColumns.amount && <th className="text-end">Gross Amount</th>} */}

            {visibleColumns.quantity && <th>Qty</th>}
            {visibleColumns.discount_percent && (
              <th className="text-end">Disc %</th>
            )}
            {visibleColumns.net_price && (
              <th className="text-end">Net Price</th>
            )}
            {visibleColumns.amount && (
              <th className="text-end">Total Amount</th>
            )}

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
              {visibleColumns.color && (
                <td>
                  {" "}
                  {item.color
                    ?.replace(/_/g, " ")
                    ?.replace(/\b\w/g, (c) => c.toUpperCase())}
                </td>
              )}
              {visibleColumns.category && <td>{item.category}</td>}
              {visibleColumns.brand && <td>{item.brand}</td>}
              {visibleColumns.unit && <td>{item.unit}</td>}

              {/* MRP */}
              {visibleColumns.mrp && (
                <td className="text-end">{Number(item.mrp || 0).toFixed(2)}</td>
              )}

              {/* Gross Amount */}
              {/* {visibleColumns.amount && (
                <td className="text-end">{Number(item.amount || 0).toFixed(2)}</td>
                )} */}

              {/* Discount % */}
              {visibleColumns.quantity && <td>{item.quantity}</td>}
              {visibleColumns.discount_percent && (
                <td className="text-end">{item.discount_percent || 0}%</td>
              )}
              {/* Total Amount (Net Price) */}
              {visibleColumns.net_price && (
                <td className="text-end fw-bold">
                  {Number(item.net_price || 0).toFixed(2)}
                </td>
              )}

              {/* Total Amount (Correct: amount) */}
              {visibleColumns.amount && (
                <td className="text-end fw-bold">
                  {Number(item.amount || 0).toFixed(2)}
                </td>
              )}

              {visibleColumns.remarks && <td>{item.remarks || "N/A"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SwithcQuotationItemsTable;
