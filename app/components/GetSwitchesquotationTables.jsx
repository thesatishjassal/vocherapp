"use client";
import React, { useEffect, useState } from "react";

import ArtisaPlatesStepWizard from "./Switch/ArtisaPlatesStepWizard";
import ArtisaFancyPlatesStepWizard from "./Switch/ArtisaFancyPlatesStepWizard";
import CustomItemsStep from "./Switch/CustomItems";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// const API_URL =
//   "https://api.panvic.in/csv/read-file/wipro_artisa_switches.csv";

export default function GetSwitchesquotationTables({
  onTotalChange,
  onRowsChange,
}) {
  const [step, setStep] = useState(1);

  /* ================= SWITCHES ================= */
  const [switches, setSwitches] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [switchJson, setSwitchJson] = useState([]);
  const [subTotal, setSubTotal] = useState(0);

  /* ================= PLATES ================= */
  const [platesJson, setPlatesJson] = useState([]);
 
  /* ================= FANCY PLATES ================= */
  const [fancyPlatesJson, setFancyPlatesJson] = useState([]);

  /* ================= CUSTOM ================= */
  const [customItemsJson, setCustomItemsJson] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD SWITCHES ================= */
  useEffect(() => {
    fetch(`${API_URL}/csv/read-file/wipro_artisa_switches.csv`)
      .then((res) => res.json())
      .then((json) => {
        setSwitches(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load switch data");
        setLoading(false);
      });
  }, []);

  /* ================= CALCULATIONS ================= */
  const calculateTotals = (sw) => {
    const q = qty[sw.item_code] || {};
    const d = discount[sw.item_code] || 0;

    const total =
      (q.white || 0) * (sw.white_mrp || 0) +
      (q.galaxy || 0) * (sw.galaxy_black_mrp || 0) +
      (q.silver || 0) * (sw.silver_grey_mrp || 0);

    const discountAmt = (total * d) / 100;
    const finalAmt = total - discountAmt;

    return { total, finalAmt };
  };

  /* ================= SWITCH JSON ================= */
  useEffect(() => {
    const data = switches
      .map((sw) => {
        const q = qty[sw.item_code] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(sw);

        return {
          item_code: sw.item_code,
          description: sw.material_description,
          prices: {
            white: sw.white_mrp,
            galaxy: sw.galaxy_black_mrp,
            silver: sw.silver_grey_mrp,
          },
          qty: {
            white: q.white || 0,
            galaxy: q.galaxy || 0,
            silver: q.silver || 0,
          },
          discount_percent: discount[sw.item_code] || 0,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    setSwitchJson(data);
  }, [qty, discount, switches]);

  /* ================= HANDLERS ================= */
  const handleQtyChange = (code, type, value) => {
    setQty((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [type]: Number(value),
      },
    }));
  };

  const handleDiscountChange = (code, value) => {
    setDiscount((prev) => ({
      ...prev,
      [code]: Number(value),
    }));
  };

  /* ================= SUMMARY BUILDER ================= */
  const buildSummaryRows = () => {
    const rows = [];
    const safeLoop = (arr, category) => {
      arr.forEach((it) => {
        if (!it?.qty) return;
        Object.entries(it.qty).forEach(([variant, q]) => {
          if (q > 0) {
            const mrp = it.prices?.[variant] || 0;
            const amount = q * mrp;
            const net = amount * (1 - (it.discount_percent || 0) / 100);

            rows.push({
              itemCode: it.item_code || "-",
              itemName: it.description,
              customerDescription: it.description,
              color: variant,
              category,
              brand: "Wipro",
              image: null,
              qty: q,
              mrp,
              amount,
              discount: it.discount_percent || 0,
              netPrice: net,
              unit: "pcs",
              comments: "N/A",
            });
          }
        });
      });
    };

    safeLoop(switchJson, "Switch");
    safeLoop(platesJson, "Plate");
    safeLoop(fancyPlatesJson, "Fancy Plate");

    customItemsJson.forEach((it) => {
      if (it.qty > 0) {
        rows.push({
          itemCode: "-",
          itemName: it.item_name,
          customerDescription: it.item_name,
          color: null,
          category: "Custom",
          brand: null,
          image: null,
          qty: it.qty,
          mrp: it.mrp,
          amount: it.total_amount,
          discount: 0,
          netPrice: it.total_amount,
          unit: "pcs",
          comments: "N/A",
        });
      }
    });

    return rows;
  };

  /* ================= DATA SYNC ================= */
  useEffect(() => {
    const rows = buildSummaryRows();
    const grandTotal = rows.reduce((s, r) => s + (r.netPrice || 0), 0);
    onRowsChange?.(rows);
    onTotalChange?.(grandTotal);
  }, [switchJson, platesJson, fancyPlatesJson, customItemsJson, onRowsChange, onTotalChange]);

  /* ================= UI ================= */
  return (
    <div>
      {/* STEP INDICATOR */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontWeight: 600,
              background: step === s ? "#ddd" : "#f2f2f2",
            }}
          >
            Step {s}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="table-responsive switch_table">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>White</th>
                <th>Qty</th>
                <th>Galaxy</th>
                <th>Qty</th>
                <th>Silver</th>
                <th>Qty</th>
                <th>Disc %</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                switches.map((sw) => (
                  <tr key={sw.item_code}>
                    <td>{sw.item_code}</td>
                    <td>{sw.material_description}</td>
                    <td>{sw.white_mrp}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) =>
                          handleQtyChange(sw.item_code, "white", e.target.value)
                        }
                      />
                    </td>
                    <td>{sw.galaxy_black_mrp}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) =>
                          handleQtyChange(
                            sw.item_code,
                            "galaxy",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>{sw.silver_grey_mrp}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) =>
                          handleQtyChange(
                            sw.item_code,
                            "silver",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        onChange={(e) =>
                          handleDiscountChange(sw.item_code, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {step === 2 && <ArtisaPlatesStepWizard onRowsChange={setPlatesJson} />}
      {step === 3 && (
        <ArtisaFancyPlatesStepWizard onDataChange={setFancyPlatesJson} />
      )}
      {step === 4 && <CustomItemsStep onDataChange={setCustomItemsJson} />}

      {/* STEP 5 – ORDER SUMMARY */}
      {step === 5 && (
        <>
          <h4>Order Summary</h4>

          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Sr</th>
                <th>Item</th>
                <th>Description</th>
                <th>Variant</th>
                <th>Category</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Amount</th>
                <th>Disc %</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {buildSummaryRows().map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.itemCode}</td>
                  <td>{r.customerDescription}</td>
                  <td>{r.color}</td>
                  <td>{r.category}</td>
                  <td>{r.qty}</td>
                  <td>{r.mrp}</td>
                  <td>{r.amount}</td>
                  <td>{r.discount}</td>
                  <td>{(r.netPrice || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* NAV */}
      <div style={{ marginTop: 20 }}>
        <button disabled={step === 1} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <button disabled={step === 5} onClick={() => setStep(step + 1)}>
          Next
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}