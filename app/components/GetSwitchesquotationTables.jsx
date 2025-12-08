"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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

export default function GetSwitchQuotationTables() {
  const [step, setStep] = useState(1);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Collected Final Data
  const [switchesSelected, setSwitchesSelected] = useState([]);
  const [platesSelected, setPlatesSelected] = useState([]);
  const [fancyPlatesSelected, setFancyPlatesSelected] = useState([]);

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

        const mrpCols = Object.keys(row).filter(
          (k) => k.endsWith("_mrp") && !k.toLowerCase().includes("back")
        );

        // DEFAULT QTY = 0 (IMPORTANT)
        if (mrpCols.length > 0) {
          mrpCols.forEach((col) => {
            const color = col.replace("_mrp", "");
            newRow[`qty_${color}`] = 0; // SET DEFAULT QTY 0
          });
        } else {
          newRow.qty = 0;
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
    if (brand === "Wipro" && model) {
      fetchSwitches(model);
    }
  }, [brand, model]);

  // ================================
  // SEARCH FILTER
  // ================================
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

  // ================================
  // UPDATE ROW
  // ================================
  const updateRow = (id, field, value) => {
    const updated = data.map((row) =>
      row._id === id ? { ...row, [field]: value } : row
    );

    setData(updated);
    setFilteredData(updated);
  };

  // ================================
  // CALCULATE TOTAL PER ROW
  // ================================
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

  // ================================
  // NEXT BUTTON HANDLER
  // ================================
  const nextStep = () => {
    const selected = getSelectedRows();

    if (step === 1) {
      setSwitchesSelected(selected);
      setStep(2);
      fetchSwitches("ArtisaPlates");
    } else if (step === 2) {
      setPlatesSelected(selected);
      setStep(3);
      fetchSwitches("ArtisaFancyPlates");
    } else if (step === 3) {
      setFancyPlatesSelected(selected);
      setStep(4); // Final Summary
    }
  };

  const prevStep = () => setStep(step - 1);

  // HEADER CALCULATION
  const sampleRow = data[0] || {};
  const mrpCols = Object.keys(sampleRow).filter(
    (h) => h.endsWith("_mrp") && !h.toLowerCase().includes("back")
  );
  const hasColors = mrpCols.length > 0;

  const commonHeaders = Object.keys(sampleRow).filter(
    (h) =>
      !h.endsWith("_mrp") &&
      !h.startsWith("qty_") &&
      h !== "qty" &&
      h !== "discount" &&
      h !== "_id"
  );

  const displayHeaders = (() => {
    if (!sampleRow) return [];
    if (!hasColors)
      return [...commonHeaders, "qty", "discount", "total"];

    const colorGroups = mrpCols.map((c) => {
      const color = c.replace("_mrp", "");
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
    if (h.endsWith("_mrp")) return name.replace("mrp", "MRP");
    if (h.startsWith("qty_"))
      return "Qty " + h.slice(4).replace(/_/g, " ");
    if (h === "discount") return "Discount (%)";
    if (h === "total") return "Total";
    if (h === "qty") return "Qty";
    return name;
  };

  // ================================
  // UI STARTS
  // ================================
  return (
    <div className="card">
      <div className="card-header">
        <h6>
          Step {step} / 4 —{" "}
          {step === 1 && "Select Switches"}
          {step === 2 && "Select Plates"}
          {step === 3 && "Select Fancy Plates"}
          {step === 4 && "Final Summary"}
        </h6>
      </div>

      <div className="card-body">

        {/* BRAND + MODEL ONLY FOR STEP 1 */}
        {step === 1 && (
          <div className="d-flex gap-3 mb-4">
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

            {brand === "Wipro" && (
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
            )}

            <input
              type="text"
              placeholder="Search..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* TABLE */}
        {step !== 4 && (
          <div className="table-responsive">
            <table className="tm_round_border table align-items-center justify-content-center mb-0">
              <thead>
                {hasColors ? (
                  <>
                    <tr>
                      {commonHeaders.map((h) => (
                        <th key={h} rowSpan={2}>
                          {getNiceHeaderName(h)}
                        </th>
                      ))}

                      {mrpCols.map((col) => {
                        const color = col.replace("_mrp", "");
                        return (
                          <th key={color} colSpan={2}>
                            {color.toUpperCase()}
                          </th>
                        );
                      })}

                      <th rowSpan={2}>Dis %</th>
                      <th rowSpan={2}>Total</th>
                    </tr>

                    <tr>
                      {mrpCols.map(() => (
                        <>
                          <th>MRP</th>
                          <th>Qty</th>
                        </>
                      ))}
                    </tr>
                  </>
                ) : (
                  <tr>
                    {displayHeaders.map((h) => (
                      <th key={h}>{getNiceHeaderName(h)}</th>
                    ))}
                  </tr>
                )}
              </thead>

              <tbody>
                {filteredData.map((row) => (
                  <tr key={row._id}>
                    {displayHeaders.map((head) => {
                      if (head === "total") {
                        return (
                          <td key={head}>
                            {calculateTotal(row, mrpCols, hasColors)}
                          </td>
                        );
                      }

                      if (isEditableField(head)) {
                        return (
                          <td key={head}>
                            <input
                              type="number"
                              min="0"
                              className="form-control form-control-sm"
                              style={{ width: "60px" }}
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

                      return <td key={head}>{row[head]}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FINAL SUMMARY */}
        {step === 4 && (
          <div>
            <h5>Selected Switches</h5>
            <pre>{JSON.stringify(switchesSelected, null, 2)}</pre>

            <h5>Selected Plates</h5>
            <pre>{JSON.stringify(platesSelected, null, 2)}</pre>

            <h5>Selected Fancy Plates</h5>
            <pre>{JSON.stringify(fancyPlatesSelected, null, 2)}</pre>
          </div>
        )}

        {/* BUTTONS */}
        <div className="d-flex justify-content-between mt-4">
          {step > 1 && step < 4 && (
            <button className="btn btn-secondary" onClick={prevStep}>
              Previous
            </button>
          )}

          {step < 4 && (
            <button className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
