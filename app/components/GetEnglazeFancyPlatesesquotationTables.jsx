"use client";
import React, { useEffect, useState, useMemo } from "react";
import CustomItemsStep from "./Switch/CustomItems";

export default function GetSwitchesquotationTables({
  onTotalChange,
  onRowsChange,
}) {
  const [step, setStep] = useState(1);

  const [switches, setSwitches] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [switchJson, setSwitchJson] = useState([]);

  const [platesJson, setPlatesJson] = useState([]);
  const [fancyPlatesJson, setFancyPlatesJson] = useState([]);
  const [customItemsJson, setCustomItemsJson] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetch(`https://api.panvic.in/csv/read-file/englaze_swithces.csv`)
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

  const switchItems = useMemo(() => {
    return switches.filter((item) => item);
  }, [switches]);

  /* ================= CALCULATIONS ================= */
  const calculateTotals = (sw) => {
    const q = qty[sw.item_code] || {};
    const d = discount[sw.item_code] || 0;

    const total =
      (q.snow_white || 0) * (sw.snow_white_mrp || 0) +
      (q.mountain_grey || 0) * (sw.mountain_grey_mrp || 0) +
      (q.sparkle_black || 0) * (sw.sparkle_black_mrp || 0);

    const discountAmt = (total * d) / 100;
    const finalAmt = total - discountAmt;

    return { total, finalAmt };
  };

  /* ================= SWITCH JSON ================= */
  useEffect(() => {
    const data = switchItems
      .map((sw) => {
        const q = qty[sw.item_code] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(sw);

        return {
          item_code: sw.item_code,
          description: sw.description,
          brand: sw.brand || "L&T",
          model: sw.model || "Englaze",
          category: sw.category || "Switches",
          prices: {
            snow_white: sw.snow_white_mrp,
            mountain_grey: sw.mountain_grey_mrp,
            sparkle_black: sw.sparkle_black_mrp,
          },
          qty: {
            snow_white: q.snow_white || 0,
            mountain_grey: q.mountain_grey || 0,
            sparkle_black: q.sparkle_black || 0,
          },
          discount_percent: discount[sw.item_code] || 0,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    setSwitchJson(data);
  }, [qty, discount, switchItems]);

  /* ================= HANDLERS ================= */
  const handleQtyChange = (code, type, value) => {
    setQty((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [type]: Number(value) || 0,
      },
    }));
  };

  const handleDiscountChange = (code, value) => {
    setDiscount((prev) => ({
      ...prev,
      [code]: Number(value) || 0,
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
              brand: it.brand,
              model: it.model,
              color:
                variant === "snow_white"
                  ? "Snow White"
                  : variant === "mountain_grey"
                  ? "Mountain Grey"
                  : variant === "sparkle_black"
                  ? "Sparkle Black"
                  : variant,
              category,
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
          brand: null,
          model: null,
          color: null,
          category: "Custom",
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
  }, [switchJson, platesJson, fancyPlatesJson, customItemsJson]);

  /* ================= UI ================= */
  return (
    <div>
      {/* Step Indicator */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        {[1, 2, 3].map((s) => (
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

      {/* Step 1 */}
      {step === 1 && (
        <div className="table-responsive switch_table">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Model</th>
                <th>Category</th>
                <th>Snow White</th>
                <th>Qty</th>
                <th>Mountain Grey</th>
                <th>Qty</th>
                <th>Sparkle Black</th>
                <th>Qty</th>
                <th>Disc %</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                switchItems.map((sw) => (
                  <tr key={sw.item_code}>
                    <td>{sw.item_code}</td>
                    <td>{sw.description}</td>
                    <td>{sw.model}</td>
                    <td>{sw.category}</td>

                    <td>{sw.snow_white_mrp || 0}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) =>
                          handleQtyChange(
                            sw.item_code,
                            "snow_white",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>{sw.mountain_grey_mrp || 0}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) =>
                          handleQtyChange(
                            sw.item_code,
                            "mountain_grey",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>{sw.sparkle_black_mrp || 0}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) =>
                          handleQtyChange(
                            sw.item_code,
                            "sparkle_black",
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

      {/* Step 2 */}
      {step === 2 && (
        <CustomItemsStep onDataChange={setCustomItemsJson} />
      )}

      {/* Step 3 - Summary */}
      {step === 3 && (
        <>
          <h4>Order Summary</h4>
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Sr</th>
                <th>Item</th>
                <th>Description</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Variant</th>
                <th>Category</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Gross</th>
                <th>Disc %</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {buildSummaryRows().map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.itemCode}</td>
                  <td>{r.customerDescription}</td>
                  <td>{r.brand}</td>
                  <td>{r.model}</td>
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

      {/* Navigation */}
      <div style={{ marginTop: 20 }}>
        <button disabled={step === 1} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <button disabled={step === 3} onClick={() => setStep(step + 1)}>
          Next
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  ); 
}