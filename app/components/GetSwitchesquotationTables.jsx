  "use client";
  import React, { useEffect, useState } from "react";
  import ArtisaPlatesStepWizard from "./Switch/ArtisaPlatesStepWizard";
  import ArtisaFancyPlatesStepWizard from "./Switch/ArtisaFancyPlatesStepWizard";
  import CustomItemsStep from "./Switch/CustomItems";

  const API_URL =
    "https://api.panvic.in/csv/read-file/wipro_artisa_switches.csv";

  export default function SwitchStepWizard() {
    const [step, setStep] = useState(1);

    /* STEP 1 – SWITCHES */
    const [switches, setSwitches] = useState([]);
    const [qty, setQty] = useState({});
    const [discount, setDiscount] = useState({});
    const [switchJson, setSwitchJson] = useState([]);
    const [rowsData, setRowsData] = useState([]);

    /* STEP 2 – PLATES */
    const [platesJson, setPlatesJson] = useState([]);

    /* STEP 3 – FANCY PLATES */
    const [fancyPlatesJson, setFancyPlatesJson] = useState([]);

    /* STEP 4 – CUSTOM ITEMS */
    const [customItemsJson, setCustomItemsJson] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* LOAD SWITCH DATA */
    useEffect(() => {
      fetch(API_URL)
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

    /* UPDATE SWITCHJSON ON CHANGES */
    useEffect(() => {
      const data = switches
        .map((sw) => {
          const q = qty[sw.item_code] || {};
          if (!Object.values(q).some((v) => v > 0)) return null;

          const totals = calculateTotals(sw);

          return {
            item_code: sw.item_code,
            description: sw.material_description,
            module_size: sw.module_size,
            prices: {
              white: sw.white_mrp,
              galaxy_black: sw.galaxy_black_mrp,
              silver_grey: sw.silver_grey_mrp,
            },
            qty: {
              white: q.white || 0,
              galaxy_black: q.galaxy || 0,
              silver_grey: q.silver || 0,
            },
            discount_percent: discount[sw.item_code] || 0,
            final_amount: totals.finalAmt,
          };
        })
        .filter(Boolean);

      setSwitchJson(data);
    }, [qty, discount, switches]);

    /* HANDLERS */
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

    /* CALCULATIONS */
    const calculateTotals = (sw) => {
      const q = qty[sw.item_code] || {};
      const d = discount[sw.item_code] || 0;

      const whiteTotal = (q.white || 0) * (sw.white_mrp || 0);
      const galaxyTotal = (q.galaxy || 0) * (sw.galaxy_black_mrp || 0);
      const silverTotal = (q.silver || 0) * (sw.silver_grey_mrp || 0);

      const total = whiteTotal + galaxyTotal + silverTotal;
      const discountAmt = (total * d) / 100;
      const finalAmt = total - discountAmt;

      return { total, discountAmt, finalAmt };
    };

    /* NEXT STEP */
    const handleNext = () => {
      setStep((p) => p + 1);
    };

    const formatVariant = (v) => {
      if (v === "-") return "-";
      return v
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    /* 🔥 BUILD COMMON SUMMARY ROWS */
    const buildSummaryRows = () => {
      const rows = [];

      // SWITCHES
      switchJson.forEach((it) => {
        Object.entries(it.qty).forEach(([variant, q]) => {
          if (q > 0) {
            const mrp = it.prices[variant];
            const amount = q * mrp;
            const net = amount * (1 - it.discount_percent / 100);

            rows.push({
              code: it.item_code || "-",
              desc: it.description,
              variant,
              category: "Switch",
              qty: q,
              mrp,
              amount,
              discount: it.discount_percent,
              net,
            });
          }
        });
      });

      // PLATES
      platesJson.forEach((it) => {
        Object.entries(it.qty).forEach(([variant, q]) => {
          if (q > 0) {
            const mrp = it.prices[variant];
            const amount = q * mrp;
            const net = amount * (1 - it.discount_percent / 100);

            rows.push({
              code: it.item_code || "-",
              desc: it.description,
              variant,
              category: "Plate",
              qty: q,
              mrp,
              amount,
              discount: it.discount_percent,
              net,
            });
          }
        });
      });

      // FANCY PLATES
      fancyPlatesJson.forEach((it) => {
        Object.entries(it.qty).forEach(([variant, q]) => {
          if (q > 0) {
            const mrp = it.prices[variant];
            const amount = q * mrp;
            const net = amount * (1 - it.discount_percent / 100);

            rows.push({
              code: it.item_code || "-",
              desc: it.description,
              variant,
              category: "Fancy Plate",
              qty: q,
              mrp,
              amount,
              discount: it.discount_percent,
              net,
            });
          }
        });
      });

      // CUSTOM ITEMS
      customItemsJson.forEach((it) => {
        if (it.qty > 0) {
          rows.push({
            code: "-",
            desc: it.item_name,
            variant: "-",
            category: "Custom",
            qty: it.qty,
            mrp: it.mrp,
            amount: it.total_amount,
            discount: 0,
            net: it.total_amount,
          });
        }
      });

      return rows;
    };

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

        {/* STEP 1 – SWITCHES */}
        {step === 1 && (
          <div className="table-responsive switch_table">
            <table className="tm_round_border table align-items-center justify-content-center mb-0 mb-0">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Module</th>
                  <th colSpan="2">White</th>
                  <th colSpan="2">Galaxy</th>
                  <th colSpan="2">Silver</th>
                  <th>Total</th>
                  <th>Disc %</th>
                  <th>Final</th>
                </tr>
                <tr>
                  <th colSpan="3" />
                  {Array(3).fill(0).map((_, i) => (
                    <React.Fragment key={i}>
                      <th>Price</th>
                      <th>Qty</th>
                    </React.Fragment>
                  ))}
                  <th colSpan="3" />
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr><td colSpan="12" align="center">Loading...</td></tr>
                )}

                {!loading &&
                  switches.map((sw) => {
                    const totals = calculateTotals(sw);
                    return (
                      <tr key={sw.item_code}>
                        <td>{sw.item_code}</td>
                        <td>{sw.material_description}</td>
                        <td>{sw.module_size}</td>

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
                              handleQtyChange(sw.item_code, "galaxy", e.target.value)
                            }
                          />
                        </td>

                        <td>{sw.silver_grey_mrp}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            onChange={(e) =>
                              handleQtyChange(sw.item_code, "silver", e.target.value)
                            }
                          />
                        </td>

                        <td>{totals.total}</td>
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
                        <td>{totals.finalAmt}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {step === 2 && <ArtisaPlatesStepWizard onRowsChange={setRowsData} />}
        {step === 3 && <ArtisaFancyPlatesStepWizard onDataChange={setFancyPlatesJson} />}
        {step === 4 && <CustomItemsStep onDataChange={setCustomItemsJson} />}

        {/* STEP 5 – SUMMARY */}
        {step === 5 && (() => {
          const rows = buildSummaryRows();
          const grandTotal = rows.reduce((s, r) => s + r.net, 0);

          return (
            <>
              <h4>Final Summary</h4>
              <table className="tm_round_border table align-items-center justify-content-center mb-0">
                <thead>
                  <tr>
                    <th>SR</th>
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
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.code}</td>
                      <td>{r.desc}</td>
                      <td>{formatVariant(r.variant)}</td>
                      <td>{r.category}</td>
                      <td>{r.qty}</td>
                      <td>{r.mrp}</td>
                      <td>{r.amount}</td>
                      <td>{r.discount}</td>
                      <td>{r.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h5 style={{ marginTop: 15 }}>Grand Total ₹ {grandTotal}</h5>
            </>
          );
        })()}

        {/* NAV */}
        <div style={{ marginTop: 20 }}>
          <button disabled={step === 1} onClick={() => setStep(step - 1)}>
            Back
          </button>
          <button disabled={step === 5} onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    );
  }