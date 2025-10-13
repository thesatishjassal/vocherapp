"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlusCircle } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SalesOrderItemsTable = ({ quotation_id, selectedRevision }) => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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
    image: true,
  });

  // ✅ Fetch products once and build lookup map
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

  // ✅ Fetch quotation items
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
            `https://api.panvic.in/salesorder/${quotation_id}/items/`,
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

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (items[index].preview?.startsWith("blob:")) {
      URL.revokeObjectURL(items[index].preview);
    }

    const previewUrl = URL.createObjectURL(file);
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], preview: previewUrl };
    setItems(updatedItems);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.put(
        `https://api.panvic.in/quotation/${quotation_id}/items/${updatedItems[index].id}/image`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      updatedItems[index] = {
        ...updatedItems[index],
        preview: `https://api.panvic.in${response.data.image_url}`,
      };
      setItems(updatedItems);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image!");
    }
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
  if (!items.length) return <p>No items found for this quotation.</p>;

  return (
    <div className="relative overflow-x-auto">
      <style jsx>{`
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
      `}</style>

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
            {visibleColumns.unit && (
              <th onClick={() => requestSort("unit")}>
                Unit {getSortIndicator("unit")}
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
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
                {visibleColumns.itemName && (
                  <td>
                    <div>{item.item_name}</div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "#6b7280",
                      }}
                    >
                      {(product?.cct &&
                        product.cct !== "NULL" &&
                        product.cct !== "0") ||
                      (item?.cct && item.cct !== "0")
                        ? `CCT: ${product?.cct ?? item?.cct} | `
                        : null}

                      {(product?.cutoutsize && product.cutoutsize !== "0") ||
                      (product?.cutoutdia && product.cutoutdia !== "0")
                        ? `Cutout Size: ${
                            product.cutoutsize ?? product.cutoutdia
                          } | `
                        : null}

                      {(product?.beamangle &&
                        product.beamangle !== "NULL" &&
                        product.beamangle !== "0") ||
                      (item?.beamangle && item.beamangle !== "0")
                        ? `Beam Angle: ${
                            product?.beamangle ?? item?.beamangle
                          } | `
                        : null}

                      {(product?.cri &&
                        product.cri !== "NONE" &&
                        product.cri !== "0") ||
                      (item?.Cri && item.Cri !== "0")
                        ? `CRI: ${product?.cri ?? item?.Cri} | `
                        : null}

                      {(product?.color && product.color !== "0") ||
                      (item?.bodycolor && item.bodycolor !== "0")
                        ? `Body Color: ${product?.color ?? item?.bodycolor} | `
                        : null}

                      {(product?.lumens &&
                        product.lumens !== "NONE" &&
                        product.lumens !== "0") ||
                      (item?.lumens && item.lumens !== "0")
                        ? `Lumens: ${product?.lumens ?? item?.lumens}`
                        : null}
                    </span>
                  </td>
                )}
                {visibleColumns.unit && <td>{item.unit}</td>}
                {visibleColumns.brand && <td>{item.brand}</td>}
                {visibleColumns.qty && <td>{item.quantity}</td>}
                {visibleColumns.mrp && <td>{item.mrp}</td>}
                {visibleColumns.discount && <td>{item.discount}%</td>}
                {visibleColumns.price && <td>{item.price}</td>}
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

export default SalesOrderItemsTable;
