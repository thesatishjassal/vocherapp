"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import React from "react";

// CSV API LIST
const API_LIST = {
  Wipro: {
    Artisa: "https://api.panvic.in/csv/read-file/wipro_artisa_switches.csv",
    Nowa: "https://api.panvic.in/csv/read-file/wipro_nowa_switches.csv",
    Venia: "https://api.panvic.in/csv/read-file/wipro_venia_switches.csv",

    ArtisaPlates: "https://api.panvic.in/csv/read-file/wipro_artisa_plates.csv",
    ArtisaFancyPlates:
      "https://api.panvic.in/csv/read-file/wipro_artisa_fancy_plates.csv",
  },
};

const getColorName = (col) => {
  return col
    .replace(/[_ ]+mrp$/i, "")
    .trim()
    .toLowerCase()
    .replace(/ /g, "_")
    .replace(/_+$/, "");
};

const formatColorName = (color) => {
  if (color === "Default" || color === "Back Grid" || color === '-') {
    return color;
  }
  return color
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getMrpCols = (row, modelName) => {
  const potential = Object.keys(row).filter((h) => /mrp$/i.test(h));
  let mrpCols = [...potential];
  if (modelName.endsWith("Plates")) {
    const gridKey = Object.keys(row).find((h) =>
      /back[_ ]?grid[_ ]?mrp/i.test(h)
    );
    if (gridKey) {
      mrpCols = mrpCols.filter((h) => h !== gridKey);
    }
    if (modelName === "ArtisaPlates") {
      const champKey = "champagne_gold";
      const champColor = getColorName(champKey);
      if (row.hasOwnProperty(champKey) && !mrpCols.some(c => getColorName(c) === champColor)) {
        mrpCols.push(champKey);
      }
    }
  }
  return mrpCols;
};

export default function GetSwitchQuotationTables({ onTotalUpdate }) {
  const [step, setStep] = useState(1);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [currentModel, setCurrentModel] = useState("");

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Step-specific data storage to preserve edits
  const [step1Data, setStep1Data] = useState([]);
  const [step2Data, setStep2Data] = useState([]);
  const [step3Data, setStep3Data] = useState([]);
  const [step4Data, setStep4Data] = useState([]);

  // Collected Final Data
  const [switchesSelected, setSwitchesSelected] = useState([]);
  const [platesSelected, setPlatesSelected] = useState([]);
  const [fancyPlatesSelected, setFancyPlatesSelected] = useState([]);
  const [accessoriesSelected, setAccessoriesSelected] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  // Accessories for step 4
  const [accessories, setAccessories] = useState([]);
  // Sections for summary
  const sections = [
    { title: "Switches", data: switchesSelected },
    { title: "Plates", data: platesSelected },
    { title: "Fancy Plates", data: fancyPlatesSelected },
    { title: "Accessories", data: accessoriesSelected },
  ];
  // ================================
  // FETCH DATA FROM CSV
  // ================================
  const fetchSwitches = async (modelName) => {
    if (!brand || !modelName) return;

    const url = API_LIST[brand][modelName];
    try {
      const res = await axios.get(url);
      const rows = res.data.data || [];

      // PROCESS EACH ROW
      const processed = rows.map((row, index) => {
        const newRow = { ...row, _id: index, discount: 0 };

        const mrpColsLocal = getMrpCols(row, modelName);

        // DEFAULT QTY = 0 (IMPORTANT)
        if (mrpColsLocal.length > 0) {
          mrpColsLocal.forEach((col) => {
            const color = getColorName(col);
            newRow[`qty_${color}`] = 0; // SET DEFAULT QTY 0
          });
        } else {
          newRow.qty = 0;
        }

        // Handle grid MRP for plates
        if (modelName.endsWith("Plates")) {
          const gridKey = Object.keys(row).find((k) =>
            /back[_ ]?grid[_ ]?mrp/i.test(k)
          );
          if (gridKey) {
            newRow.grid_mrp = parseFloat(row[gridKey]) || 0;
          }
        }

        return newRow;
      });

      setData(processed);
      setFilteredData(processed);
      setCurrentModel(modelName);

      // Store in step-specific state based on modelName
      if (modelName === "ArtisaPlates") {
        setStep2Data(processed);
      } else if (modelName === "ArtisaFancyPlates") {
        setStep3Data(processed);
      } else {
        // Switches
        setStep1Data(processed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (brand === "Wipro" && model && step === 1) {
      fetchSwitches(model);
    }
  }, [brand, model, step]);
 
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };
  // ================================
  // GET COLOR DETAILS FOR SUMMARY
  // ================================
  const getColorDetails = (item) => {
    const potentialMrpCols = Object.keys(item).filter((k) => /mrp$/i.test(k));
    let mrpCols = [...potentialMrpCols];
    let gridMrp = 0;
    let gridKey = null;
    const hasGrid = "grid_mrp" in item && item.grid_mrp > 0;
    if (hasGrid) {
      gridMrp = item.grid_mrp;
      gridKey = Object.keys(item).find((k) =>
        /grid/i.test(k.toLowerCase())
      );
      if (gridKey) {
        mrpCols = mrpCols.filter((k) => k !== gridKey);
      }
    }
    const champKey = "champagne_gold";
    if (item[champKey] !== undefined && !mrpCols.includes(champKey)) {
      mrpCols.push(champKey);
    }

    const qtyFields = Object.keys(item).filter((k) => k.startsWith("qty_"));
    let colorDetails = [];
    let subtotal = 0;
    let totalQty = 0;

    if (mrpCols.length > 0 && qtyFields.length > 0) {
      // Has colors
      mrpCols.forEach((col) => {
        const color = getColorName(col);
        const qtyKey = `qty_${color}`;
        const qty = parseFloat(item[qtyKey]) || 0;
        if (qty > 0) {
          const mrp = parseFloat(item[col]) || 0;
          const sub = mrp * qty;
          colorDetails.push({ color, qty, mrp, sub });
          totalQty += qty;
          subtotal += sub;
        }
      });
    } else {
      // Single qty
      const priceKey = Object.keys(item).find(
        (k) => k.toLowerCase().includes("mrp") && !/_mrp/i.test(k)
      );
      const mrp = priceKey ? parseFloat(item[priceKey]) || 0 : 0;
      const qty = parseFloat(item.qty) || 0;
      if (qty > 0) {
        const sub = mrp * qty;
        colorDetails.push({ color: "Default", qty, mrp, sub });
        totalQty = qty;
        subtotal = sub;
      }
    }

    // Add grid
    if (hasGrid && totalQty > 0) {
      const gridSub = gridMrp * totalQty;
      colorDetails.push({
        color: "Back Grid",
        qty: totalQty,
        mrp: gridMrp,
        sub: gridSub,
        isGrid: true,
      });
      subtotal += gridSub;
    }

    const discount = parseFloat(item.discount) || 0;
    const total = subtotal * (1 - discount / 100);

    const descriptionKey = Object.keys(item).find(
      (k) =>
        k.toLowerCase().includes("description") ||
        k.toLowerCase().includes("name")
    );
    const description = item[descriptionKey] || "Item";

    return {
      colorDetails,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      discount,
      totalQty,
      description,
    };
  };

  const getFlattenedRows = useMemo(() => {
    const rows = [];
    sections.forEach(({ title, data }) => {
      data.forEach((item, itemIdx) => {
        if (!("_id" in item)) {
          // Accessory
          rows.push({
            category: title,
            itemCode: '-',
            description: item.name,
            color: '-',
            qty: item.qty,
            mrp: item.mrp,
            lineTotal: item.total,
            discount: 0,
            itemTotal: item.total,
            isGrid: false
          });
        } else {
          const details = getColorDetails(item);
          details.colorDetails.forEach((d) => {
            rows.push({
              category: title,
              itemCode: item.item_code || "N/A",
              description: details.description,
              color: formatColorName(d.color),
              qty: d.qty,
              mrp: d.mrp,
              lineTotal: d.sub,
              discount: details.discount,
              itemTotal: d.sub * (1 - details.discount / 100),
              isGrid: d.isGrid || false
            });
          });
        }
      });
    });
    return rows;
  }, [sections]);

  const sortedRows = useMemo(() => {
    let sortableRows = [...getFlattenedRows];
    if (sortConfig.key) {
      sortableRows.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }
    return sortableRows;
  }, [getFlattenedRows, sortConfig]);
  // ================================
  // Restore data on step change
  // ================================
  useEffect(() => {
    if (step === 1) {
      setData(step1Data);
      setFilteredData(step1Data);
      setCurrentModel(model);
    } else if (step === 2) {
      setData(step2Data);
      setFilteredData(step2Data);
      setCurrentModel("ArtisaPlates");
    } else if (step === 3) {
      setData(step3Data);
      setFilteredData(step3Data);
      setCurrentModel("ArtisaFancyPlates");
    } else if (step === 4) {
      setData([]);
      setFilteredData([]);
      setAccessories(step4Data);
    } else if (step === 5) {
      // Nothing for summary
    }
  }, [step]);

  // ================================
  // UPDATE ROW
  // ================================
  const updateRow = (id, field, value) => {
    const updated = data.map((row) =>
      row._id === id ? { ...row, [field]: value } : row
    );

    setData(updated);
    setFilteredData(updated);

    // Update step-specific data
    if (step === 1) {
      setStep1Data(updated);
    } else if (step === 2) {
      setStep2Data(updated);
    } else if (step === 3) {
      setStep3Data(updated);
    }
  };

  // ================================
  // ACCESSORIES FUNCTIONS
  // ================================
  const addNewAcc = () => {
    setAccessories((prev) => [
      ...prev,
      { id: Date.now(), name: "", qty: 0, mrp: 0 },
    ]);
  };

  const updateAcc = (idx, field, value) => {
    setAccessories((prev) =>
      prev.map((acc, i) => (i === idx ? { ...acc, [field]: value } : acc))
    );
  };

  const removeAcc = (idx) => {
    setAccessories((prev) => prev.filter((_, i) => i !== idx));
  };

  // ================================
  // CALCULATE TOTAL PER ROW
  // ================================
  const calculateTotal = (row, mrpCols, hasColors) => {
    let subtotal = 0;
    const discount = parseFloat(row.discount) || 0;

    if (hasColors) {
      mrpCols.forEach((col) => {
        const color = getColorName(col);
        const mrp = parseFloat(row[col]) || 0;
        const qty = parseFloat(row[`qty_${color}`]) || 0;
        subtotal += mrp * qty;
      });
    } else {
      const priceKey = Object.keys(row).find(
        (k) => k.toLowerCase().includes("mrp") && !/_mrp/i.test(k)
      );
      const mrp = priceKey ? parseFloat(row[priceKey]) || 0 : 0;
      const qty = parseFloat(row.qty) || 0;
      subtotal = mrp * qty;
    }

    // Add grid MRP if applicable
    if ("grid_mrp" in row && row.grid_mrp > 0) {
      let totalQty = 0;
      if (hasColors) {
        mrpCols.forEach((col) => {
          const color = getColorName(col);
          totalQty += parseFloat(row[`qty_${color}`]) || 0;
        });
      } else {
        totalQty = parseFloat(row.qty) || 0;
      }
      subtotal += row.grid_mrp * totalQty;
    }

    const total = subtotal * (1 - discount / 100);
    return total.toFixed(2);
  };



  // ================================
  // FILTER ITEMS WHERE QTY > 0
  // ================================
  const getSelectedRows = () => {
    return data.filter((row) => {
      const qtyFields = Object.keys(row).filter((k) => k.startsWith("qty_"));

      if (qtyFields.length > 0) {
        return qtyFields.some((q) => row[q] > 0);
      }
      return row.qty > 0;
    });
  };

  const getItemTotal = (item) => {
    if (!("_id" in item)) {
      return parseFloat(item.total);
    } else {
      const details = getColorDetails(item);
      return parseFloat(details.total);
    }
  };

  // ================================
  // CURRENT GRAND TOTAL MEMO
  // ================================
  const allItems = [
    ...switchesSelected,
    ...platesSelected,
    ...fancyPlatesSelected,
    ...accessoriesSelected,
  ];

  const currentGrandTotal = useMemo(() => {
    if (step < 4) {
      return getSelectedRows()
        .reduce((sum, row) => {
          const localMrpCols = getMrpCols(row, currentModel);
          const localHasColors = localMrpCols.length > 0;
          return (
            sum + parseFloat(calculateTotal(row, localMrpCols, localHasColors))
          );
        }, 0);
    } else if (step === 4) {
      const prevItems = [...switchesSelected, ...platesSelected, ...fancyPlatesSelected];
      const prevTotal = prevItems.reduce((sum, item) => sum + getItemTotal(item), 0);
      const accTotal = accessories.reduce((sum, a) => sum + (a.qty * a.mrp), 0);
      return prevTotal + accTotal;
    } else if (step === 5) {
      return allItems.reduce((sum, item) => sum + getItemTotal(item), 0);
    }
    return 0;
  }, [step, data, currentModel, switchesSelected, platesSelected, fancyPlatesSelected, accessories, accessoriesSelected, allItems]);

  useEffect(() => {
    if (onTotalUpdate) {
      onTotalUpdate(currentGrandTotal);
    }
  }, [currentGrandTotal, onTotalUpdate]);

  // ================================
  // NEXT BUTTON HANDLER
  // ================================
  const nextStep = async () => {
    if (step === 1) {
      setSwitchesSelected(getSelectedRows());
      await fetchSwitches("ArtisaPlates");
      setStep(2);
    } else if (step === 2) {
      setPlatesSelected(getSelectedRows());
      await fetchSwitches("ArtisaFancyPlates");
      setStep(3);
    } else if (step === 3) {
      setFancyPlatesSelected(getSelectedRows());
      setStep(4);
    } else if (step === 4) {
      setStep4Data(accessories);
      const selected = accessories
        .filter((a) => a.qty > 0)
        .map((a) => ({
          ...a,
          total: a.qty * a.mrp,
        }));
      setAccessoriesSelected(selected);
      setStep(5);
    }
  };

  const skipStep = async () => {
    if (step === 2) {
      setPlatesSelected([]);
      await fetchSwitches("ArtisaFancyPlates");
      setStep(3);
    } else if (step === 3) {
      setFancyPlatesSelected([]);
      setStep(4);
    }
  };

  const prevStep = () => setStep(step - 1);

  // HEADER CALCULATION
  const sampleRow = data[0] || {};
  const mrpCols = getMrpCols(sampleRow, currentModel);
  const hasColors = mrpCols.length > 0;

  const commonHeaders = Object.keys(sampleRow).filter(
    (h) =>
      !/mrp$/i.test(h) &&
      !h.startsWith("qty_") &&
      h !== "qty" &&
      h !== "discount" &&
      h !== "_id" &&
      h !== "grid_mrp"
  );

  const displayHeaders = (() => {
    if (!sampleRow) return [];
    if (!hasColors)
      return [...commonHeaders, "qty", "discount", "total"];

    const colorGroups = mrpCols.map((c) => {
      const color = getColorName(c);
      return [c, `qty_${color}`];
    });

    return [...commonHeaders, ...colorGroups.flat(), "discount", "total"];
  })();

  const isEditableField = (head) => {
    return head.startsWith("qty_") || head === "qty" || head === "discount";
  };

  // NICE NAME FOR HEADER
  const getNiceHeaderName = (h) => {
    let name = h.replace(/_/g, " ");
    if (/mrp$/i.test(h)) return name.replace(/mrp$/i, "MRP");
    if (h.startsWith("qty_"))
      return "Qty " + h.slice(4).replace(/_/g, " ");
    if (h === "discount") return "Discount (%)";
    if (h === "total") return "Total";
    if (h === "qty") return "Qty";
    return name;
  };



  const totalItems = allItems.length;
  const grandTotal =
    allItems.reduce((sum, item) => sum + getItemTotal(item), 0).toFixed(2);

  // ================================
  // UI STARTS
  // ================================
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header px-4 py-2 bg-primary text-white no-print">
        <h6 className="text-white mb-0">
          <i className="fas fa-list me-2"></i>
          Step {step} / 5 —{" "}
          {step === 1 && "Select Switches"}
          {step === 2 && "Select Plates"}
          {step === 3 && "Select Fancy Plates"}
          {step === 4 && "Add Accessories"}
          {step === 5 && "Final Summary"}
        </h6>
      </div>

      <div className="card-body p-0">
        {/* BUTTONS ON TOP FOR BETTER UX */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-2 border-bottom  no-print">
          {step > 1 && (
            <button className="btn btn-outline-secondary btn-sm" onClick={prevStep}>
              <i className="fas fa-arrow-left me-1"></i>Back
            </button>
          )}
          <div className="text-muted small">
            Progress: {step}/5
          </div>
          <div className="d-flex">
            {(step === 2 || step === 3) && (
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={skipStep}
              >
                Skip
              </button>
            )}
            {step < 5 && (
              <button
                className="btn btn-primary btn-sm"
                onClick={nextStep}
                disabled={
                  step < 4
                    ? getSelectedRows().length === 0
                    : false
                }
              >
                Next <i className="fas fa-arrow-right ms-1"></i>
              </button>
            )}
          </div>
        </div>

        {/* BRAND + MODEL ONLY FOR STEP 1 */}
        {step === 1 && (
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Brand</label>
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
                <option>Select Brand</option>
                <option value="Wipro">Wipro</option>
              </select>
            </div>

            {brand === "Wipro" && (
              <div className="col-md-6">
                <label className="form-label">Switch Series</label>
                <select
                  className="form-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option>Select Switch Series</option>
                  <option value="Artisa">Artisa</option>
                  <option value="Nowa">Nowa</option>
                  <option value="Venia">Venia</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* LOADING FOR STEPS 2 & 3 */}
        {[2, 3].includes(step) && data.length === 0 && (
          <div className="text-center py-5">
            <i className="fas fa-spinner fa-spin fa-2x text-muted mb-3"></i>
            <p className="text-muted">Loading data...</p>
          </div>
        )}

        {/* TABLE FOR STEPS 1-3 */}
        {step < 4 && data.length > 0 && (
          <div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <table className="tm_round_border table align-items-center justify-content-center mb-0">
              <thead className="table-light sticky-top">
                {hasColors ? (
                  <>
                    <tr>
                      {commonHeaders.map((h) => (
                        <th key={h} rowSpan={2} className="text-nowrap">
                          {getNiceHeaderName(h)}
                        </th>
                      ))}

                      {mrpCols.map((col) => {
                        const color = getColorName(col);
                        return (
                          <th key={color} colSpan={2} className="text-center text-nowrap">
                            {color.toUpperCase()}
                          </th>
                        );
                      })}

                      <th rowSpan={2} className="text-nowrap">Dis %</th>
                      <th rowSpan={2} className="text-nowrap">Total</th>
                    </tr>

        <tr>
          {mrpCols.map((_, index) => (
            <React.Fragment key={`color-group-${index}`}>
              <th key={`mrp-${index}`} className="text-nowrap">MRP</th>
              <th key={`qty-${index}`} className="text-nowrap">Qty</th>
            </React.Fragment>
          ))}
        </tr>
                  </>
                ) : (
                  <tr>
                    {displayHeaders.map((h) => (
                      <th key={h} className="text-nowrap">
                        {getNiceHeaderName(h)}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={displayHeaders.length} className="text-center text-muted py-4">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row._id}>
                      {displayHeaders.map((head) => {
                        if (head === "total") {
                          return (
                            <td key={head} className="text-center fw-bold">
                              ₹{calculateTotal(row, mrpCols, hasColors)}
                            </td>
                          );
                        }

                        if (isEditableField(head)) {
                          return (
                            <td key={head} className="text-center">
                              <input
                                type="number"
                                min="0"
                                className="form-control form-control-sm"
                                style={{ width: head === "discount" ? "40px" : "50px" }}
                                value={row[head]}
                                onChange={(e) =>
                                  updateRow(
                                    row._id,
                                    head,
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>
                          );
                        }

                        // Handle MRP columns
                        const color = getColorName(head);
                        if (mrpCols.includes(head) || (head === "champagne_gold" && hasColors)) {
                          return <td key={head} className="text-center">₹{row[head]}</td>;
                        }

                        return <td key={head} className="text-nowrap">{row[head]}</td>;
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* GRAND TOTAL FOR STEPS 1-3 */}
        {step < 4 && data.length > 0 && (
          <div className="mt-3 p-3 rounded">
            <div className="d-flex justify-content-end">
              <div className="text-center">
                <strong>
                  Grand Total: ₹{currentGrandTotal.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* ACCESSORIES UI FOR STEP 4 */}
        {step === 4 && (
          <div className="p-3 rounded border">
            <h5 className="mb-3">Add Accessories</h5>
            <p className="text-muted mb-3">
              Add manual items such as cable ties, tape rolls, hooks, etc.
            </p>
            {accessories.map((acc, idx) => (
              <div key={acc.id} className="row g-2 mb-3 p-1 border rounded">
                <div className="col-md-3">
                  <label className="form-label small">Item Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g., Cable Ties"
                    value={acc.name}
                    onChange={(e) => updateAcc(idx, "name", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-sm"
                    value={acc.qty}
                    onChange={(e) =>
                      updateAcc(idx, "qty", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">MRP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control form-control-sm"
                    value={acc.mrp}
                    onChange={(e) =>
                      updateAcc(idx, "mrp", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="w-100 text-center">
                    <label className="form-label small mb-0 d-block">Total (₹)</label>
                    <div className="fw-bold">₹{(acc.qty * acc.mrp).toFixed(2)}</div>
                  </div>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-danger btn-sm ms-auto"
                    onClick={() => removeAcc(idx)}
                  >
                    <i className="fas fa-trash"></i> Remove
                  </button>
                </div>
              </div>
            ))}  
            {accessories.length === 0 && (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-plus-circle fa-2x mb-2"></i>
                <p>No accessories added yet.</p>
                <button className="btn btn-outline-primary btn-sm" onClick={addNewAcc}>
                  + Add First Item
                </button>
              </div>
            )}
            {accessories.length > 0 && (
              <button className="btn btn-success btn-sm mb-3" onClick={addNewAcc}>
                <i className="fas fa-plus me-1"></i>Add Another Item
              </button>
            )}
            {/* Grand Total for Accessories */}
            {accessories.some((a) => a.qty > 0) && (
              <div className="mt-3 p-1 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <span>Accessories Subtotal:</span>
                  <strong>
                    ₹
                    {accessories
                      .reduce((sum, a) => sum + a.qty * a.mrp, 0)
                      .toFixed(2)}
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINAL SUMMARY - DETAILED VIEW IN ONE TABLE */}
        {step === 5 && (
          <div className="col-12">
            <h5 className="mb-3 no-print">Final Summary - Detailed View</h5>
            {(() => {
              if (totalItems === 0) {
                return (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No items selected for quotation.</p>
                  </div>
                );
              }

              return (
                <div className="table-responsive">
                  <table className="tm_round_border table align-items-center justify-content-center mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th className="text-center">SR No</th>
                        <th onClick={() => handleSort('itemCode')}>Item Code {getSortIndicator('itemCode')}</th>
                        <th onClick={() => handleSort('description')}>Description {getSortIndicator('description')}</th>
                        <th onClick={() => handleSort('color')}>Color/Variant {getSortIndicator('color')}</th>
                        <th onClick={() => handleSort('category')}>Category {getSortIndicator('category')}</th>
                        <th className="text-center" onClick={() => handleSort('qty')}>Quantity {getSortIndicator('qty')}</th>
                        <th className="text-center" onClick={() => handleSort('mrp')}>MRP (₹) {getSortIndicator('mrp')}</th>
                        <th className="text-center" onClick={() => handleSort('lineTotal')}>Amount (₹) {getSortIndicator('lineTotal')}</th>
                        <th className="text-center" onClick={() => handleSort('discount')}>Discount % {getSortIndicator('discount')}</th>
                        <th className="text-center" onClick={() => handleSort('itemTotal')}>Net Amount (₹) {getSortIndicator('itemTotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((row, idx) => (
                        <tr key={`${row.category}-${row.itemCode}-${idx}`} className={row.isGrid ? "table-info" : ""}>
                          <td className="text-center">{idx + 1}</td>
                          <td>{row.itemCode}</td>
                          <td>{row.description}</td>
                          <td>{row.color}</td>
                          <td>{row.category}</td>
                          <td className="text-center">{row.qty}</td>
                          <td className="text-center">₹{row.mrp.toFixed(2)}</td>
                          <td className="text-center">₹{row.lineTotal.toFixed(2)}</td>
                          <td className="text-center">{row.discount}</td>
                          <td className="text-center">₹{row.itemTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* <tr className="table-dark fw-bold">
                        <td colSpan={9} className="text-center">
                          <h5>Grand Total</h5>
                        </td>
                        <td className="text-center">₹{grandTotal}</td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              );
            })()} 
          </div>
        )}
      </div>
    </div>
  );
}