"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlusCircle } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/** Full URLs (https://api.panvic.in/uploads/...) are used as-is;
 *  old relative paths (/uploads/...) get the API base URL in front. */
const toImageUrl = (src, base = "") => {
  const v = String(src || "").trim();
  if (!v || v === "0" || v.toUpperCase() === "NULL") return null;
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:")) return v;
  return `${base || ""}${v.startsWith("/") ? "" : "/"}${v}`;
};

// Light grey box with a "+" — shown when an item has no image (no external placeholder service)
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f3f3f3'/%3E%3Cpath d='M30 22v16M22 30h16' stroke='%23c4c4c4' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";

/* ---------- Spec line under the item name ----------
   The value SAVED ON THE QUOTATION ITEM wins (e.g. the CCT the salesperson picked: "4000K").
   The product catalogue is only a fallback — it holds the options ("3000K / 4000K / 6000K"). */
const EMPTY = new Set(["", "0", "NULL", "NONE", "N/A", "UNDEFINED"]);
const clean = (v) => {
  const t = String(v ?? "").trim();
  return EMPTY.has(t.toUpperCase()) ? "" : t;
};
const first = (...vals) => vals.map(clean).find(Boolean) || "";
const withDegree = (v) => (v && /^\d+(\.\d+)?$/.test(v) ? `${v}°` : v); // "100" -> "100°", "100°" stays

const specsFor = (item, product = {}) =>
  [
    ["CCT", first(item.cct, product.cct)],
    ["Watt", first(item.watt, product.watt)],
    ["Cut-out", first(item.cutoutdia, item.cutoutsize, product.cutoutdia, product.cutoutsize)],
    ["Size", first(item.size, product.size)],
    ["Beam", withDegree(first(item.beamangle, product.beamangle))],
    ["CRI", first(item.cri, item.Cri, product.cri)],
    ["Body colour", first(item.bodycolor, product.color)],
    ["Light colour", first(item.lightcolor, product.lightcolor)],
    ["Lumens", first(item.lumens, product.lumens)],
  ].filter(([, v]) => v);

/* ---------- "Columns" dropdown (hidden when printing) ---------- */
const COLUMN_LABELS = {
  srNo: "Sr no",
  image: "Image",
  customerCode: "Customer code",
  customerDescription: "Customer description",
  itemCode: "Item code",
  itemName: "Item name",
  specs: "Specs (CCT, beam, CRI…)",
  brand: "Brand",
  qty: "Qty",
  unit: "Unit",
  mrp: "MRP",
  discount: "Discount",
  netPrice: "Net price",
  amount: "Amount",
};
const NO_PRINT = "no-print qit-no-print pvq-no-print";
const T = {
  bar: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 },
  wrap: { position: "relative" },
  btn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px",
    border: "1px solid #e3e3e3", borderRadius: 8, background: "#fff", color: "#555",
    font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  count: { minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "#fbf5e9", color: "#b98912", fontSize: 11, lineHeight: "18px" },
  menu: {
    position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 30, minWidth: 220, padding: 6,
    border: "1px solid #eee", borderRadius: 10, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,.10)",
    textAlign: "left",
  },
  menuHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 6px", color: "#8a8a8a", fontSize: 11, fontWeight: 600 },
  link: { border: 0, padding: 0, background: "transparent", color: "#b98912", font: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  item: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, fontSize: 13, color: "#222", cursor: "pointer" },
  seg: { display: "inline-flex", padding: 2, border: "1px solid #e3e3e3", borderRadius: 8, background: "#f6f6f6" },
  segBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", border: 0,
    borderRadius: 6, background: "transparent", color: "#8a8a8a", font: "inherit", fontSize: 12,
    fontWeight: 600, cursor: "pointer",
  },
  segOn: { background: "#fff", color: "#222", boxShadow: "0 1px 3px rgba(0,0,0,.1)" },
  hint: { padding: "6px 8px 2px", borderTop: "1px solid #eee", marginTop: 4, color: "#8a8a8a", fontSize: 11 },
};
const Svg = ({ d }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const ColumnMenu = ({ columns, onChange, onReset }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const keys = Object.keys(COLUMN_LABELS);
  const shown = keys.filter((k) => columns[k]).length;
  return (
    <div style={T.wrap} ref={ref}>
      <button type="button" style={{ ...T.btn, ...(open ? { borderColor: "#d3a01d", color: "#222" } : null) }}
        aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <Svg d="M4 5h16v14H4zM10 5v14M16 5v14" /> Columns <span style={T.count}>{shown}/{keys.length}</span>
      </button>
      {open && (
        <div style={T.menu} role="menu">
          <div style={T.menuHead}>
            <span>Show in table &amp; print</span>
            <button type="button" style={T.link} onClick={onReset}>Reset</button>
          </div>
          {keys.map((k) => (
            <label key={k} style={T.item}
              onMouseOver={(e) => (e.currentTarget.style.background = "#fafafa")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
              <input type="checkbox" style={{ accentColor: "#d3a01d" }} checked={!!columns[k]}
                onChange={() => onChange({ ...columns, [k]: !columns[k] })} />
              {COLUMN_LABELS[k]}
            </label>
          ))}
          <div style={T.hint}>Hidden columns are left out of the print too.</div>
        </div>
      )}
    </div>
  );
};

/* Portrait / Landscape page toggle for printing (remembered in this browser) */
const ORIENT_KEY = "quotation_print_orientation";
const PAGE_ICON = {
  portrait: "M7 3h10v18H7z",
  landscape: "M3 7h18v10H3z",
};
const OrientationToggle = ({ value, onChange }) => (
  <div style={T.seg} role="radiogroup" aria-label="Print orientation">
    {[["portrait", "Portrait"], ["landscape", "Landscape"]].map(([v, label]) => (
      <button key={v} type="button" role="radio" aria-checked={value === v}
        style={value === v ? { ...T.segBtn, ...T.segOn } : T.segBtn}
        onClick={() => onChange(v)} title={`Print in ${label.toLowerCase()}`}>
        <Svg d={PAGE_ICON[v]} /> {label}
      </button>
    ))}
  </div>
);

const DEFAULT_COLUMNS = {
  srNo: true,
  customerCode: false,
  customerDescription: false,
  itemCode: true,
  itemName: true,
  specs: true,
  unit: true,
  brand: true,
  qty: true,
  discount: false,
  mrp: false,
  netPrice: true,
  amount: true,
  image: true,
};

const QuotationItemsTable = ({ quotation_id, selectedRevision, readOnly = false }) => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [orientation, setOrientation] = useState("landscape");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORIENT_KEY);
      if (saved === "portrait" || saved === "landscape") setOrientation(saved);
    } catch (_) {}
  }, []);

  const changeOrientation = (v) => {
    setOrientation(v);
    try { localStorage.setItem(ORIENT_KEY, v); } catch (_) {}
  };

  // ✅ Fetch products once and build lookup map
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/`);
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
        let mappedItems;
        if (selectedRevision) {
          response = await axios.get(
            `${API_URL}/quotation-history/?quotation_id=${quotation_id}`,
            { withCredentials: true }
          );
          const filteredItems = response.data.filter(
            (item) => item.edited_at === selectedRevision.edited_at
          );
          mappedItems = filteredItems.map((item) => ({
            ...item,
            preview: toImageUrl(item.image, API_URL),
          }));
        } else {
          response = await axios.get(
            `${API_URL}/quotation/${quotation_id}/items/`,
            { withCredentials: true }
          );
          mappedItems = response.data.map((item) => ({
            ...item,
            preview: toImageUrl(item.image, API_URL),
          }));
        }
        // Sort by position if available
        const sortedItems = mappedItems.sort(
          (a, b) => (a.position || 0) - (b.position || 0)
        );
        setItems(sortedItems);
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
        `${API_URL}/quotation/${quotation_id}/items/${updatedItems[index].id}/image`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      updatedItems[index] = {
        ...updatedItems[index],
        preview: toImageUrl(response.data.image_url, API_URL) || previewUrl,
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

  const handleDragStart = (e, index) => {
    if (selectedRevision) return;
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e) => {
    if (selectedRevision) return;
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    if (selectedRevision) return;
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;

    const newItems = [...items];
    const draggedItem = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    setItems(newItems);

    // Save the new order to the backend
    const saveOrder = async () => {
      try {
        await Promise.all(
          newItems.map((item, i) =>
            axios.patch(
              `${API_URL}/quotation/quotation/${quotation_id}/items/${item.id}`,

              {
                product_id: item.product_id,
                customercode: item.customercode,
                customerdescription: item.customerdescription,
                image: item.image,
                itemcode: item.itemcode,
                brand: item.brand,
                mrp: item.mrp,
                netPrice: item.netPrice,
                price: item.price,
                quantity: item.quantity,
                discount: item.discount,
                item_name: item.item_name,
                unit: item.unit,
                amount: item.amount,
                amount_including_gst: item.amount_including_gst,
                without_gst: item.without_gst,
                gst_amount: item.gst_amount,
                amount_with_gst: item.amount_with_gst,
                remarks: item.remarks,
                position: i, // ✅ updated order
              },
              { withCredentials: true }
            )
          )
        );

        toast.success("Row reordered and saved successfully!");
      } catch (error) {
        console.error("Error saving order:", error);
        toast.error("Failed to save order!");
      }
    };

    saveOrder();
  };

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found for this quotation.</p>;
 
const roundToRupee = (val) => {
  return Math.round(Number(val));
};
const getFinalPrice = (item) => {
  // agar netPrice valid hai (0 nahi hai)
  if (Number(item.netPrice) > 0) {
    return Number(item.netPrice);
  }

  // warna MRP - discount calculate kar
  return Math.round(
    Number(item.mrp) * (1 - (Number(item.discount) || 0) / 100)
  );
};
  return (
    <div className="relative overflow-x-auto">
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          #quotation-table {
            width: 100%;
            font-size: 12px;
          }
        }
      `}</style>

      <style>{`@media print {
        .qit-no-print { display: none !important; }
        @page { size: A4 ${orientation}; margin: ${orientation === "portrait" ? "8mm" : "10mm"}; }
        #quotation-table { width: 100% !important; font-size: ${orientation === "portrait" ? 10 : 12}px !important; }
        #quotation-table img { max-width: ${orientation === "portrait" ? 44 : 60}px !important; max-height: ${orientation === "portrait" ? 44 : 60}px !important; }
      }`}</style>
      <div className={NO_PRINT} style={T.bar}>
        <OrientationToggle value={orientation} onChange={changeOrientation} />
        <ColumnMenu columns={visibleColumns} onChange={setVisibleColumns}
          onReset={() => setVisibleColumns(DEFAULT_COLUMNS)} />
        <button type="button" style={T.btn} onClick={handlePrint}>
          <Svg d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v6H7z" /> Print
        </button>
      </div>

      <table
        id="quotation-table"
        className="tm_round_border table align-items-center justify-content-center mb-0"
      >
        <thead>
          <tr>
            {visibleColumns.srNo && <th>SR NO</th>}
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
            {/* {visibleColumns.Description && (
              <th onClick={() => requestSort("description")}>
                Description {getSortIndicator("description")}
              </th>
            )} */}
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
            const isDraggable = !selectedRevision && !readOnly;
            return (
              <tr
                key={item.id || index}
                draggable={isDraggable}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{ cursor: isDraggable ? "grab" : "default" }}
              >
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent drag on image click
                        document.getElementById(`fileInput-${index}`).click();
                      }}
                    >
                      <img
                        src={item.preview || PLACEHOLDER}
                        onError={(e) => {
                          if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
                        }}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
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
                    {(() => {
                      const specs = specsFor(item, product);
                      return visibleColumns.specs && specs.length ? (
                        <div style={{ marginTop: 2, fontSize: 11, fontWeight: 700, color: "#6b7280" }}>
                          {specs.map(([k, v]) => `${k}: ${v}`).join(" | ")}
                        </div>
                      ) : null;
                    })()}
                  </td>
                )}
                {/* {visibleColumns.itemCode && <td>{item.itemcode}</td>} */}
                {/* {visibleColumns.Description && <td>{item.description}</td>} */}
                {visibleColumns.brand && <td>{item.brand}</td>}
                {visibleColumns.qty && <td>{item.quantity}</td>}
                {visibleColumns.unit && <td>{item.unit}</td>}
                {visibleColumns.mrp && <td>{roundToRupee(item.mrp)}</td>}

                {visibleColumns.discount && <td>{item.discount}%</td>}
                {visibleColumns.price && <td>{roundToRupee(item.price)}</td>}

                {visibleColumns.netPrice && (
                  <td>
                    {roundToRupee(getFinalPrice(item))}
                  </td>
                )}

                {visibleColumns.amount && (
                  <td>
                    {/* {roundToRupee(
                      Number(item.quantity) *
                        Number(item.netPrice) 
                    )} */}
                          {/* {roundToRupee(
                      Number(item.quantity) *
                        Number(item.mrp) *
                        (1 - (Number(item.discount) || 0) / 100)
                    )} */}
                      {roundToRupee(Number(item.quantity) * getFinalPrice(item))}

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