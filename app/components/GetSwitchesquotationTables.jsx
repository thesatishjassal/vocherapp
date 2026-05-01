"use client";
import React, { useEffect, useState } from "react";

import ArtisaPlatesStepWizard from "./Switch/ArtisaPlatesStepWizard";
import ArtisaFancyPlatesStepWizard from "./Switch/ArtisaFancyPlatesStepWizard";
import CustomItemsStep from "./Switch/CustomItems";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  /* ================= NET PRICE ================= */
  const [netPrice, setNetPrice] = useState({}); // ✅ NEW

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

  const handleNetPriceChange = (code, type, value) => {
    setNetPrice((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [type]: Number(value) || 0,
      },
    }));
  };

  /* ================= CALCULATIONS ================= */
  const calculateTotals = (sw) => {
    const q = qty[sw.item_code] || {};
    const d = discount[sw.item_code] || 0;

    const total =
      (q.white || 0) *
        (netPrice[sw.item_code]?.white ?? Number(sw.white_mrp) ?? 0) +
      (q.galaxy || 0) *
        (netPrice[sw.item_code]?.galaxy ?? Number(sw.galaxy_black_mrp) ?? 0) +
      (q.silver || 0) *
        (netPrice[sw.item_code]?.silver ?? Number(sw.silver_grey_mrp) ?? 0);

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
          brand: sw.brand || "Wipro",
          model: sw.model || "Artisa",

          mrp: {
            white: Number(sw.white_mrp),
            galaxy: Number(sw.galaxy_black_mrp),
            silver: Number(sw.silver_grey_mrp),
          },

          netPrice: {
            white: netPrice[sw.item_code]?.white ?? Number(sw.white_mrp),
            galaxy:
              netPrice[sw.item_code]?.galaxy ?? Number(sw.galaxy_black_mrp),
            silver:
              netPrice[sw.item_code]?.silver ?? Number(sw.silver_grey_mrp),
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
  }, [qty, discount, netPrice, switches]);

  /* ================= SUMMARY BUILDER ================= */
  const buildSummaryRows = () => {
    const rows = [];

    // ── Switches ──────────────────────────────────────────
    switchJson.forEach((it) => {
      const variants = ["white", "galaxy", "silver"];
      const names = { white: "White", galaxy: "Galaxy Black", silver: "Silver Grey" };

      variants.forEach((v) => {
        const q = it.qty[v];
        if (q > 0) {
          const mrp = it.mrp?.[v] ?? 0;
          const net = it.netPrice?.[v] ?? mrp;
          const disc = it.discount_percent || 0;

          const netPerUnit = net - (net * disc) / 100;
          const amount = netPerUnit * q;

          rows.push({
            itemCode: it.item_code,
            itemName: it.description,
            customerDescription: it.description,
            brand: it.brand || "Wipro",
            model: it.model || "Artisa",
            color: names[v],
            category: "Switch",
            qty: q,
            mrp,
            netPrice: netPerUnit,
            discount: disc,
            amount,
            unit: "pcs",
          });
        }
      });
    });
  

    // ── Plates (safeLoop) ─────────────────────────────────
    const safeLoop = (arr, category) => {
      arr.forEach((it) => {
        if (!it?.qty) return;
        Object.entries(it.qty).forEach(([variant, q]) => {
          if (q > 0) {
            const mrp = it.prices?.[variant] || 0;
            const net = it.netPrice?.[variant] ?? mrp;
            const disc = it.discount_percent || 0;
            const netPerUnit = net - (net * disc) / 100;
            const amount = netPerUnit * q;

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
              netPrice: netPerUnit,
              discount: disc,
              amount,
              unit: "pcs",
              comments: "N/A",
            });
          }
        });
      });
    };

    safeLoop(platesJson, "Plate");
    safeLoop(fancyPlatesJson, "Fancy Plate");

    // ── Custom Items ──────────────────────────────────────
    customItemsJson.forEach((it) => {
      if (it.qty > 0) {
        rows.push({
          itemCode: "-",
          itemName: it.item_name,
          customerDescription: it.item_name,
          color: "-",
          category: "Custom",
          brand: "-",
          model: "-",
          image: null,
          qty: it.qty,
          mrp: it.mrp || 0,
          netPrice: it.net_price || it.mrp || 0,
          discount: it.discount || 0,
          amount: it.total_amount || 0,
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
    const grandTotal = rows.reduce((s, r) => s + (r.amount || 0), 0);
    onRowsChange?.(rows);
    onTotalChange?.(grandTotal);
  }, [switchJson, platesJson, fancyPlatesJson, customItemsJson]);

  /* ================= ROW TOTAL HELPER ================= */
  const getRowTotal = (sw) => calculateTotals(sw).finalAmt.toFixed(2);

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
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>

                {/* WHITE */}
                <th>White MRP</th>
                <th>White Net</th>
                <th>White Qty</th>

                {/* GALAXY */}
                <th>Galaxy MRP</th>
                <th>Galaxy Net</th>
                <th>Galaxy Qty</th>

                {/* SILVER */}
                <th>Silver MRP</th>
                <th>Silver Net</th>
                <th>Silver Qty</th>

                <th>Disc %</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                switches.map((sw) => (
                  <tr key={sw.item_code}>
                    <td>{sw.item_code}</td>
                    <td>{sw.material_description}</td>

                    {/* WHITE */}
                    <td>{sw.white_mrp}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={
                          netPrice[sw.item_code]?.white ?? sw.white_mrp ?? ""
                        }
                        onChange={(e) =>
                          handleNetPriceChange(
                            sw.item_code,
                            "white",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        onChange={(e) =>
                          handleQtyChange(sw.item_code, "white", e.target.value)
                        }
                      />
                    </td>

                    {/* GALAXY */}
                    <td>{sw.galaxy_black_mrp}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={
                          netPrice[sw.item_code]?.galaxy ??
                          sw.galaxy_black_mrp ??
                          ""
                        }
                        onChange={(e) =>
                          handleNetPriceChange(
                            sw.item_code,
                            "galaxy",
                            e.target.value
                          )
                        }
                      />
                    </td>
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

                    {/* SILVER */}
                    <td>{sw.silver_grey_mrp}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={
                          netPrice[sw.item_code]?.silver ??
                          sw.silver_grey_mrp ??
                          ""
                        }
                        onChange={(e) =>
                          handleNetPriceChange(
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
                        onChange={(e) =>
                          handleQtyChange(
                            sw.item_code,
                            "silver",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    {/* DISC */}
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

                    {/* AMOUNT */}
                    <td>₹ {getRowTotal(sw)}</td>
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
                <th>Brand</th>
                <th>Variant</th>
                <th>Category</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Net Price</th>
                <th>Disc %</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {buildSummaryRows().map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.itemCode}</td>
                  <td>{r.customerDescription}</td>
                  <td>{r.brand}</td>
                  <td>{r.color}</td>
                  <td>{r.category}</td>
                  <td>{r.qty}</td>
                  <td>{(r.mrp || 0).toFixed(2)}</td>
                  <td>{(r.netPrice || 0).toFixed(2)}</td>
                  <td>{r.discount}</td>
                  <td>{(r.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* NAV */}
      <div style={{ marginTop: 20 }} className="d-flex justify-content-between gap-2">
        <button className="btn btn-secondary" disabled={step === 1} onClick={() => setStep(step - 1)}>
          Back
       </button>
         <button className="btn btn-primary" disabled={step === 5} onClick={() => setStep(step + 1)}>
          Next
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
