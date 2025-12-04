"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_LIST = {
  Wipro: {
    Artisa: "https://api.panvic.in/csv/read-file/wipro_artisa_switches.csv",
    Nowa: "https://api.panvic.in/csv/read-file/wipro_nowa_switches.csv",
    Venia: "https://api.panvic.in/csv/read-file/wipro_venia_switches.csv",

    ArtisaPlates: "https://api.panvic.in/csv/read-file/wipro_artisa_plates.csv",
    ArtisaFancyPlates:
      "https://api.panvic.in/csv/read-file/wipro_artisa_fancy_plates.csv",
  },

  // Future ready
  Celestia: null,
  "L&T": null,
  Engalze: null,
  Osum: null,
};

const BRANDS = ["Wipro", "L&T", "Celestia", "Engalze", "Osum"];
const WIPRO_MODELS = [
  "Artisa",
  "Nowa",
  "Venia",
  "ArtisaPlates",
  "ArtisaFancyPlates",
];

export default function GetSwitchQuotationTables() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  // -------------------------------------------------------------
  // FETCH DATA FROM CSV API
  // -------------------------------------------------------------
  const fetchSwitches = async () => {
    if (!brand) return;
    if (brand !== "Wipro") {
      setData([]);
      setFilteredData([]);
      return;
    }

    if (!model) return;
    const url = API_LIST.Wipro[model];

    try {
      const res = await axios.get(url);
      const rows = res.data.data || [];

      // Add qty per color + common discount
      const processed = rows.map((row, index) => {
        const newRow = { ...row, _id: index, discount: 0 };
        const mrpCols = Object.keys(row).filter(
          (k) => k.endsWith("_mrp") && !k.toLowerCase().includes("back")
        );

        if (mrpCols.length > 0) {
          mrpCols.forEach((col) => {
            const color = col.replace("_mrp", "");
            newRow[`qty_${color}`] = 1;
          });
        } else {
          // Fallback for non-color items
          newRow.qty = 1;
        }

        return newRow;
      });

      setData(processed);
      setFilteredData(processed);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSwitches();
  }, [brand, model]);

  // -------------------------------------------------------------
  // SEARCH FILTER
  // -------------------------------------------------------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(data);
      return;
    }

    const q = searchQuery.toLowerCase();

    const result = data.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(q)
    );

    setFilteredData(result);
  }, [searchQuery, data]);

  // -------------------------------------------------------------
  // HANDLE QTY OR DISCOUNT CHANGE
  // -------------------------------------------------------------
  const updateRow = (id, field, value) => {
    const updated = data.map((row) =>
      row._id === id ? { ...row, [field]: value } : row
    );

    setData(updated);
    setFilteredData(updated);
  };

  // -------------------------------------------------------------
  // CALCULATE TOTAL FOR ROW
  // -------------------------------------------------------------
  const calculateTotal = (row, mrpCols, hasColors) => {
    let subtotal = 0;
    const discount = parseFloat(row.discount) || 0;

    if (hasColors) {
      mrpCols.forEach((col) => {
        const color = col.replace("_mrp", "");
        const mrp = parseFloat(row[col]) || 0;
        const qty = parseFloat(row[`qty_${color}`]) || 0;
        subtotal += mrp * qty;
      });
    } else {
      const priceKey = Object.keys(row).find(
        (k) => k.toLowerCase().includes("mrp") && !k.includes("_mrp")
      );
      const mrp = priceKey ? parseFloat(row[priceKey]) || 0 : 0;
      const qty = parseFloat(row.qty) || 0;
      subtotal = mrp * qty;
    }

    const total = subtotal * (1 - discount / 100);
    return total.toFixed(2);
  };

  // -------------------------------------------------------------
  // GENERATE DISPLAY HEADERS AND NICE NAMES
  // -------------------------------------------------------------
  const getDisplayHeaders = () => {
    if (data.length === 0) return [];

    const sampleRow = data[0];
    const mrpCols = Object.keys(sampleRow).filter(
      (h) => h.endsWith("_mrp") && !h.toLowerCase().includes("back")
    );

    const commonHeaders = Object.keys(sampleRow).filter(
      (h) =>
        !h.endsWith("_mrp") &&
        !h.startsWith("qty_") &&
        h !== "qty" &&
        h !== "discount" &&
        h !== "_id"
    );

    let displayHeaders;
    if (mrpCols.length === 0) {
      displayHeaders = [...commonHeaders, "qty", "discount", "total"];
    } else {
      const colorGroups = mrpCols.map((col) => {
        const color = col.replace("_mrp", "");
        return [col, `qty_${color}`];
      });
      displayHeaders = [...commonHeaders, ...colorGroups.flat(), "discount", "total"];
    }

    return displayHeaders;
  };

  const displayHeaders = getDisplayHeaders();

  const getNiceHeaderName = (head) => {
    let nice = head.replace(/_/g, " ");
    if (head.endsWith("_mrp")) {
      nice = nice.replace(/mrp$/i, "MRP");
    } else if (head === "qty") {
      nice = "Qty";
    } else if (head === "discount") {
      nice = "Discount (%)";
    } else if (head === "total") {
      nice = "Total Amount";
    } else if (head.startsWith("qty_")) {
      const color = head.slice(4).replace(/_/g, " ");
      nice = `Qty ${color}`;
    }
    return nice;
  };

  const isEditableField = (head) => {
    return head.startsWith("qty_") || head === "discount" || head === "qty";
  };

  const mrpCols = data.length > 0 ? Object.keys(data[0]).filter(
    (h) => h.endsWith("_mrp") && !h.toLowerCase().includes("back")
  ) : [];

  const commonHeaders = data.length > 0 ? Object.keys(data[0]).filter(
    (h) =>
      !h.endsWith("_mrp") &&
      !h.startsWith("qty_") &&
      h !== "qty" &&
      h !== "discount" &&
      h !== "_id"
  ) : [];

  const hasColors = mrpCols.length > 0;

  const getColorName = (color) => {
    return color.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Switch & Plate Quotation Table</h6>
      </div>

      <div className="card-body py-0 pt-0 pb-2">

        {/* FILTERS */}
        <div className="d-flex flex-column flex-md-row gap-3 mb-4">

          {/* BRAND DROPDOWN */}
          <select
            className="form-select"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setModel("");
              setData([]);
              setFilteredData([]);
            }}
          >
            <option value="">Select Brand</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* MODEL DROPDOWN */}
          {brand === "Wipro" && (
            <select
              className="form-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">Select Model</option>
              {WIPRO_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m.replace("Plates", " Plates").replace("Fancy", " Fancy")}
                </option>
              ))}
            </select>
          )}

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              {hasColors ? (
                <>
                  <tr>
                    {commonHeaders.map((head) => (
                      <th key={head} rowSpan={2}>
                        {getNiceHeaderName(head)}
                      </th>
                    ))}
                    {mrpCols.map((col) => {
                      const color = col.replace("_mrp", "");
                      const niceColor = getColorName(color);
                      return (
                        <th key={color} colSpan={2}>
                          {niceColor}
                        </th>
                      );
                    })}
                    <th rowSpan={2}>Dis (%)</th>
                    <th rowSpan={2}>Total Amount</th>
                  </tr>
                  <tr>
                    {mrpCols.map((col) => (
                      <>
                        <th>MRP</th>
                        <th>Qty</th>
                      </>
                    ))}
                  </tr>
                </>
              ) : (
                <tr>
                  {displayHeaders.map((head) => (
                    <th key={head}>{getNiceHeaderName(head)}</th>
                  ))}
                </tr>
              )}
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={displayHeaders.length} className="text-center">
                    No data available
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row._id}>
                    {displayHeaders.map((head) => {
                      if (head === "total") {
                        return (
                          <td key={head}>
                            {calculateTotal(row, mrpCols, hasColors)}
                          </td>
                        );
                      } else if (isEditableField(head)) {
                        const isQty = head === "qty" || head.startsWith("qty_");
                        const fieldValue = row[head] ?? (isQty ? 1 : 0);
                        return (
                          <td key={head}>
                            <input
                              type="number"
                              min={isQty ? 0 : 0}
                              className="form-control form-control-sm"
                              style={{ width: "40px" }}
                              value={fieldValue}
                              onChange={(e) =>
                                updateRow(row._id, head, Number(e.target.value))
                              }
                            />
                          </td>
                        );
                      } else {
                        return <td key={head}>{row[head]}</td>;
                      }
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}