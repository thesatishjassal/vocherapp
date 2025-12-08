"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlusCircle } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const QuotationItemsTable = ({ quotation_id, selectedRevision }) => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    customerCode: false,
    customerDescription: false,
    itemCode: true,
    itemName: true,
    unit: true,
    brand: true,
    qty: true,
    discount: false,
    mrp: false,
    netPrice: true,
    amount: true,
    image: true,
  });

  // -------------------------------------------
  // FETCH PRODUCTS (ONCE)
  // -------------------------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://api.panvic.in/products/");
        const productMap = {};

        res.data.forEach((prod) => {
          productMap[prod.itemcode] = prod;
        });

        setProducts(productMap);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // -------------------------------------------
  // CLEANUP BLOB URLs
  // -------------------------------------------
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [items]);

  // -------------------------------------------
  // FETCH QUOTATION ITEMS
  // -------------------------------------------
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

          const filtered = response.data.filter(
            (i) => i.edited_at === selectedRevision.edited_at
          );

          setItems(
            filtered.map((it) => ({
              ...it,
              preview: it.image ? `https://api.panvic.in${it.image}` : null,
            }))
          );
        } else {
          response = await axios.get(
            `https://api.panvic.in/quotation/${quotation_id}/items/`,
            { withCredentials: true }
          );

          setItems(
            response.data.map((it) => ({
              ...it,
              preview: it.image ? `https://api.panvic.in${it.image}` : null,
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

  // -------------------------------------------
  // COLUMN TOGGLE
  // -------------------------------------------
  const handleCheckboxChange = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  // -------------------------------------------
  // IMAGE UPLOAD
  // -------------------------------------------
  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (items[index].preview?.startsWith("blob:")) {
      URL.revokeObjectURL(items[index].preview);
    }

    const previewUrl = URL.createObjectURL(file);
    const updated = [...items];
    updated[index] = { ...updated[index], preview: previewUrl };
    setItems(updated);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.put(
        `https://api.panvic.in/quotation/${quotation_id}/items/${updated[index].id}/image`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      updated[index] = {
        ...updated[index],
        preview: `https://api.panvic.in${response.data.image_url}`,
      };

      setItems(updated);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image!");
    }
  };

  // -------------------------------------------
  // SORTING
  // -------------------------------------------
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sorted = [...items].sort((a, b) => {
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";

      if (!isNaN(aVal) && !isNaN(bVal)) {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return direction === "asc"
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });

    setItems(sorted);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  // -------------------------------------------
  // PRINT + PDF
  // -------------------------------------------
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

  if (loading) return <p>Loading…</p>;
  if (!items.length) return <p>No items found for this quotation.</p>;

  // -------------------------------------------
  // RENDER
  // -------------------------------------------
  return (
    <div className="relative overflow-x-auto">
      <style jsx>{`
        @media print {
          @page {
            size: A4 Landscape;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* PRINT BUTTON */}
      <div className="absolute top-0 right-0 flex flex-col gap-2 no-print">
        <button
          onClick={handlePrint}
          className="px-3 py-2 bg-gray-200 rounded-md shadow hover:bg-gray-300"
        >
          🖨 Print
        </button>

        <button
          onClick={handleSaveAsPDF}
          className="px-3 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
        >
          📄 Save as PDF
        </button>
      </div>

      {/* TOGGLE COLUMNS */}
      <div className="mb-4 flex flex-wrap gap-4 no-print">
        {Object.entries(visibleColumns).map(([key, value]) => (
          <label key={key} className="text-sm">
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleCheckboxChange(key)}
            />
            &nbsp;{key.toUpperCase()}
          </label>
        ))}
      </div>

      {/* TABLE */}
      <table
        id="quotation-table"
        className="table-auto border-collapse w-full mb-10"
      >
        <thead className="bg-gray-100">
          <tr>
            {visibleColumns.srNo && (
              <th onClick={() => requestSort("srNo")}>
                SR NO {getSortIndicator("srNo")}
              </th>
            )}

            {visibleColumns.image && <th>Image</th>}

            {visibleColumns.customerCode && (
              <th onClick={() => requestSort("customercode")}>
                Customer Code {getSortIndicator("customercode")}
              </th>
            )}

            {visibleColumns.customerDescription && (
              <th onClick={() => requestSort("customerdescription")}>
                Customer Description {getSortIndicator("customerdescription")}
              </th>
            )}

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

            {visibleColumns.brand && (
              <th onClick={() => requestSort("brand")}>
                Brand {getSortIndicator("brand")}
              </th>
            )}

            {visibleColumns.qty && (
              <th onClick={() => requestSort("quantity")}>
                Qty {getSortIndicator("quantity")}
              </th>
            )}

            {visibleColumns.unit && (
              <th onClick={() => requestSort("unit")}>
                Unit {getSortIndicator("unit")}
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

            {visibleColumns.netPrice && (
              <th onClick={() => requestSort("netPrice")}>
                Net Price {getSortIndicator("netPrice")}
              </th>
            )}

            {visibleColumns.amount && (
              <th onClick={() => requestSort("amount")}>
                Amount {getSortIndicator("amount")}
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => {
            const product = products[item.itemcode] || {};

            return (
              <tr key={item.id || index} className="border-b">
                {visibleColumns.srNo && <td>{index + 1}</td>}

                {visibleColumns.image && (
                  <td>
                    <div
                      className="relative group"
                      style={{
                        width: 60,
                        height: 60,
                        cursor: "pointer",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                      onClick={() =>
                        document.getElementById(`fileInput-${index}`).click()
                      }
                    >
                      <img
                        src={
                          item.preview ||
                          "https://via.placeholder.com/60x60?text=+"
                        }
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition">
                        <FiPlusCircle size={22} color="white" />
                      </div>

                      <input
                        id={`fileInput-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, index)}
                      />
                    </div>
                  </td>
                )}

                {visibleColumns.customerCode && (
                  <td>{item.customercode}</td>
                )}

                {visibleColumns.customerDescription && (
                  <td>{item.customerdescription}</td>
                )}

                {visibleColumns.itemCode && <td>{item.itemcode}</td>}

                {visibleColumns.itemName && (
                  <td>
                    <div>{item.item_name}</div>

                    <div className="text-xs text-gray-500 mt-1">
                      {product?.watt ? `Watt: ${product.watt} | ` : ""}
                      {product?.cct ? `CCT: ${product.cct} | ` : ""}
                      {product?.color ? `Body: ${product.color} | ` : ""}
                      {product?.beamangle
                        ? `Beam: ${product.beamangle}° | `
                        : ""}
                      {product?.lumens ? `Lumens: ${product.lumens}` : ""}
                    </div>
                  </td>
                )}

                {visibleColumns.brand && <td>{item.brand}</td>}

                {visibleColumns.qty && <td>{item.quantity}</td>}

                {visibleColumns.unit && <td>{item.unit}</td>}

                {visibleColumns.mrp && <td>{item.mrp}</td>}

                {visibleColumns.discount && (
                  <td>{item.discount}%</td>
                )}

                {visibleColumns.netPrice && (
                  <td>
                    {(
                      Number(item.mrp) *
                      (1 - (Number(item.discount) || 0) / 100)
                    ).toFixed(2)}
                  </td>
                )}

                {visibleColumns.amount && (
                  <td>
                    {(
                      Number(item.quantity) *
                      Number(item.mrp) *
                      (1 - (Number(item.discount) || 0) / 100)
                    ).toFixed(2)}
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

export default QuotationItemsTable;
