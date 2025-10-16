"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlusCircle } from "react-icons/fi";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

const SalesOrderItemsTable = ({ salesorder_id, selectedRevision }) => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  console.log("Quotation ID:", salesorder_id);
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    customerCode: false,
    customerDescription: false,
    itemCode: true,
    itemName: true,
    unit: true,
    brand: true,
    qty: true,
    // price: true,
    discount: false,
    mrp: false,
    netPrice: true,
    amount: true,
    // image: true,
    color: true,
    Remarks: true,
  });


  // ✅ Cleanup blob URLs
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [items]);

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const response = await axios.get("https://api.panvic.in/product/");
  //       const prodMap = response.data.reduce((acc, p) => {
  //         acc[p.itemcode] = p;
  //         return acc;
  //       }, {});
  //       setProducts(prodMap);
  //     } catch (error) {
  //       toast.error("Failed to load products");
  //     }
  //   };

  //   fetchProducts();
  // }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (!salesorder_id) return;
      setLoading(true);
      try {
        const response = await axios.get(`https://api.panvic.in/salesorder/${salesorder_id}/items/`);
        const enhancedItems = response.data.map(item => {
          const netPrice = item.mrp > 0 
            ? item.mrp * (1 - (item.discount || 0) / 100)
            : (item.price / item.quantity) || 0;
          return {
            ...item,
            preview: item.image,
            netPrice: netPrice,
            amount: item.price  // Assuming price is total
          };
        });
        setItems(enhancedItems);
        console.log("Fetched Items:", enhancedItems);
      } catch (error) {
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [salesorder_id, selectedRevision]);


  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const updatedItems = [...items];
    updatedItems[index].preview = preview;
    setItems(updatedItems);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.patch(
        `https://api.panvic.in/salesorder/${salesorder_id}/items/${items[index].id}/`,
        formData
      );
      updatedItems[index].image = response.data.image;
      setItems([...updatedItems]);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      // Optionally revert preview if failed
    }
  };

  const handleCheckboxChange = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

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

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  const handlePrint = () => {
    window.print();
  };


  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this quotation.</p>;

  return (
    <div className="relative overflow-x-auto">
      {/* <style jsx>{`
        @media print {
          @page {
            size: A4 landscape;
          }
          .no-print {
            display: none !important;
          }
          #quotation-table {
            width: 100%;
            font-size: 12px;
          }
        }
      `}</style> */}

      <div className="absolute top-0 right-0 flex flex-col gap-2 no-print">
        <button
          onClick={handlePrint}
          className="px-3 py-2 bg-gray-200 rounded-md shadow hover:bg-gray-300"
        >
          🖨 Print
        </button>
      </div>

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

      <table
        id="quotation-table"
        className="tm_round_border table align-items-center justify-content-center mb-0"
      >
        <thead>
          <tr>
            {visibleColumns.srNo && (
              <th onClick={() => requestSort("srNo")}>
                SR NO {getSortIndicator("srNo")}
              </th>
            )}
            {/* {visibleColumns.image && <th>Image</th>} */}
            {/* {visibleColumns.customerCode && (
              <th onClick={() => requestSort("customercode")}>
                Customer Code {getSortIndicator("customercode")}
              </th>
            )} */}
            {/* {visibleColumns.customerDescription && (
              <th onClick={() => requestSort("customerdescription")}>
                Customer Description {getSortIndicator("customerdescription")}
              </th>
            )} */}
            {visibleColumns.itemCode && (
              <th onClick={() => requestSort("itemcode")}>
                Item Code {getSortIndicator("itemcode")}
              </th>
            )}
            {visibleColumns.itemName && (
              <th onClick={() => requestSort("item_name")}>
                Item Name {getSortIndicator("item_name")}
              </th>
            )}
            {visibleColumns.unit && (
              <th onClick={() => requestSort("unit")}>
                Unit {getSortIndicator("unit")}
              </th>
            )}
                     {visibleColumns.color && (
              <th onClick={() => requestSort("color")}>
                Color {getSortIndicator("color")}
              </th>
            )}
            {visibleColumns.qty && (
              <th onClick={() => requestSort("quantity")}>
                Qty {getSortIndicator("quantity")}
              </th>
            )}
            {visibleColumns.mrp && (
              <th onClick={() => requestSort("mrp")}>
                MRP {getSortIndicator("mrp")}
              </th>
            )}
            {visibleColumns.discount && (
              <th onClick={() => requestSort("discount")}>
                Discount {getSortIndicator("discount")}
              </th>
            )}
            {visibleColumns.price && (
              <th onClick={() => requestSort("price")}>
                Rate {getSortIndicator("price")}
              </th>
            )}
            {visibleColumns.netPrice && (
              <th onClick={() => requestSort("netPrice")}>
                Price {getSortIndicator("netPrice")}
              </th>
            )}
            {visibleColumns.amount && (
              <th onClick={() => requestSort("amount")}>
                Amount {getSortIndicator("amount")}
              </th>
            )}
                 {visibleColumns.Remarks && (
              <th onClick={() => requestSort("Remarks")}>
                Remarks {getSortIndicator("Remarks")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const product = products[item.itemcode] || {};
            return (
              <tr key={index}>
                {visibleColumns.srNo && <td>{index + 1}</td>}
                {visibleColumns.customerCode && <td>{item.customercode}</td>}
                {visibleColumns.customerDescription && (
                  <td>{item.customerdescription}</td>
                )}
                {visibleColumns.itemCode && <td>{item.itemcode}</td>}
                {visibleColumns.itemName && (
                  <td>
                    <div>{item.item_name}</div>
                  </td>
                )}
                {visibleColumns.unit && <td>{item.unit}</td>}
                {visibleColumns.color && <td>{item.color}</td>}
                {/* {visibleColumns.brand && <td>{item.brand}</td>} */}
                {visibleColumns.qty && <td>{item.quantity}</td>}
                {visibleColumns.mrp && <td>{item.mrp}</td>}
                {visibleColumns.discount && <td>{item.discount}%</td>}
                {visibleColumns.price && <td>{item.price}</td>}
                {visibleColumns.netPrice && (
                  <td>
                    {item.netPrice.toFixed(2)}
                  </td>
                )}
                {visibleColumns.amount && (
                  <td>
                    {item.amount.toFixed(2)}
                  </td>
                )}
                {visibleColumns.Remarks && (
                  <td>
                    {item.remarks}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SalesOrderItemsTable;