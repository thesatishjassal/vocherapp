"use client";
import React, { useEffect, useState, useMemo } from "react";
import CustomItemsStep from "./Switch/CustomItems";
import GetEnglazeWoodPlates from "./GetEnglazeWoodPlatesesquotationTables";
import GetEnglazeMetalPlates from "./GetEnglazeMetalPlatesesquotationTables";
import GetEnglazGlassPlatesesquotationTables from "./GetEnglazGlassPlatesesquotationTables";

export default function GetSwitchesquotationTables({
  onTotalChange,
  onRowsChange,
}) {
  const [step, setStep] = useState(1);

  const [switches, setSwitches] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [netPrice, setNetPrice] = useState({});

  const [switchJson, setSwitchJson] = useState([]);
  const [platesJson, setPlatesJson] = useState([]);
  const [metalPlatesJson, setMetalPlatesJson] = useState([]);
  const [glassPlatesJson, setGlassPlatesJson] = useState([]);
  const [customItemsJson, setCustomItemsJson] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* FETCH SWITCHES */
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
    return switches.filter(Boolean);
  }, [switches]);

  /* CALCULATIONS */
  const calculateTotals = (sw) => {
    const q = qty[sw.item_code] || {};
    const d = discount[sw.item_code] || 0;

    const total =
      (q.snow_white || 0) *
        (netPrice[sw.item_code]?.snow_white ?? sw.snow_white_mrp ?? 0) +
      (q.mountain_grey || 0) *
        (netPrice[sw.item_code]?.mountain_grey ?? sw.mountain_grey_mrp ?? 0) +
      (q.sparkle_black || 0) *
        (netPrice[sw.item_code]?.sparkle_black ?? sw.sparkle_black_mrp ?? 0);

    const finalAmt = total - (total * d) / 100;
    return finalAmt;
  };

  /* SWITCH JSON */
  useEffect(() => {
    const data = switchItems
      .map((sw) => {
        const q = qty[sw.item_code] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        return {
          item_code: sw.item_code,
          description: sw.description,
          brand: sw.brand || "L&T",
          model: sw.model || "Englaze",
          mrp: {
            snow_white: Number(sw.snow_white_mrp),
            mountain_grey: Number(sw.mountain_grey_mrp),
            sparkle_black: Number(sw.sparkle_black_mrp),
          },
          netPrice: {
            snow_white:
              netPrice[sw.item_code]?.snow_white ?? Number(sw.snow_white_mrp),
            mountain_grey:
              netPrice[sw.item_code]?.mountain_grey ??
              Number(sw.mountain_grey_mrp),
            sparkle_black:
              netPrice[sw.item_code]?.sparkle_black ??
              Number(sw.sparkle_black_mrp),
          },
          qty: q,
          discount_percent: discount[sw.item_code] || 0,
          final_amount: calculateTotals(sw),
        };
      })
      .filter(Boolean);

    setSwitchJson(data);
  }, [qty, discount, netPrice, switchItems]);

  /* HANDLERS */
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

  /* SUMMARY BUILDER — all fields required by POST API */
  const buildSummaryRows = () => {
    const rows = [];

    const safeLoop = (arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((it) => {
        if (!it) return;
        rows.push({
          // Identity fields
          itemCode: it.itemCode || it.item_code || "-",   // → itemcode in API
          itemName: it.itemName || it.description || "-", // → item_name
          description: it.customerDescription || it.description || it.itemName || "-", // → description
          brand: it.brand || "L&T",                       // → brand
          model: it.model || "Englaze",                   // → model
          color: it.color || "-",                         // → color
          category: it.category || "-",                   // → category
          image: it.image || null,                        // → image
          unit: it.unit || "pcs",                         // → unit
          comments: it.comments || "N/A",                 // → remarks

          // Numeric fields
          qty: Number(it.qty) || 0,                       // → quantity
          mrp: Number(it.mrp) || 0,                       // → mrp
          discount: Number(it.discount) || 0,             // → discount_percent
          netPrice: Number(it.netPrice) || Number(it.net_price) || 0, // → net_price
          amount: Number(it.amount) || 0,                 // → amount (total after disc)
        });
      });
    };

    /* SWITCHES — expand per variant */
    safeLoop(
      switchJson.flatMap((sw) =>
        Object.entries(sw.qty).map(([variant, q]) => {
          if (!q) return null;

          const mrp = sw.mrp[variant];
          const net = sw.netPrice[variant] ?? mrp;
          const d = sw.discount_percent;
          const gross = q * net;
          const amount = gross * (1 - d / 100);

          return {
            itemCode: sw.item_code,
            itemName: sw.description,
            description: sw.description,
            brand: sw.brand,
            model: sw.model,
            color: variant,
            category: "Switch",
            image: null,
            unit: "pcs",
            comments: "N/A",
            qty: q,
            mrp,
            discount: d,
            netPrice: net,
            amount,
          };
        })
      )
    );

    /* WOOD PLATES */
    safeLoop(platesJson);

    /* METAL PLATES */
    safeLoop(metalPlatesJson);

    /* GLASS PLATES */
    safeLoop(glassPlatesJson);

    /* CUSTOM ITEMS */
    safeLoop(customItemsJson);

    return rows;
  };

  /* TOTAL SYNC */
  useEffect(() => {
    const rows = buildSummaryRows();
    const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
    console.log("Summary Rows:", rows);
    onRowsChange?.(rows);
    onTotalChange?.(total);
  }, [
    switchJson,
    platesJson,
    metalPlatesJson,
    glassPlatesJson,
    customItemsJson,
  ]);

  const getRowTotal = (sw) => calculateTotals(sw).toFixed(2);

  return (
    <div>
      {/* STEPS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
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

      {/* STEP 1 — SWITCHES */}
      {step === 1 && (
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Snow MRP</th>
              <th>Snow Net</th>
              <th>Qty</th>
              <th>Grey MRP</th>
              <th>Grey Net</th>
              <th>Qty</th>
              <th>Black MRP</th>
              <th>Black Net</th>
              <th>Qty</th>
              <th>Disc%</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              switchItems.map((sw) => (
                <tr key={sw.item_code}>
                  <td>{sw.item_code}</td>
                  <td>{sw.description}</td>

                  {/* SNOW WHITE */}
                  <td>{sw.snow_white_mrp}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        netPrice[sw.item_code]?.snow_white ?? sw.snow_white_mrp
                      }
                      onChange={(e) =>
                        handleNetPriceChange(
                          sw.item_code,
                          "snow_white",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      onChange={(e) =>
                        handleQtyChange(
                          sw.item_code,
                          "snow_white",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* MOUNTAIN GREY */}
                  <td>{sw.mountain_grey_mrp}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        netPrice[sw.item_code]?.mountain_grey ??
                        sw.mountain_grey_mrp
                      }
                      onChange={(e) =>
                        handleNetPriceChange(
                          sw.item_code,
                          "mountain_grey",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      onChange={(e) =>
                        handleQtyChange(
                          sw.item_code,
                          "mountain_grey",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* SPARKLE BLACK */}
                  <td>{sw.sparkle_black_mrp}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        netPrice[sw.item_code]?.sparkle_black ??
                        sw.sparkle_black_mrp
                      }
                      onChange={(e) =>
                        handleNetPriceChange(
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
                      onChange={(e) =>
                        handleDiscountChange(sw.item_code, e.target.value)
                      }
                    />
                  </td>

                  <td>₹ {getRowTotal(sw)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {step === 2 && <GetEnglazeWoodPlates onDataChange={setPlatesJson} />}
      {step === 3 && <GetEnglazeMetalPlates onDataChange={setMetalPlatesJson} />}
      {step === 4 && (
        <GetEnglazGlassPlatesesquotationTables onDataChange={setGlassPlatesJson} />
      )}
      {step === 5 && <CustomItemsStep onDataChange={setCustomItemsJson} />}

      {/* STEP 6 — ORDER SUMMARY */}
      {step === 6 && (
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
                <th>Net Price</th>
                <th>Disc %</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {buildSummaryRows().map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.itemCode}</td>
                  <td>{r.description}</td>
                  <td>{r.brand}</td>
                  <td>{r.model}</td>
                  <td>
                    {r.color
                      ?.replace(/_/g, " ")
                      ?.replace(/\b\w/g, (c) => c.toUpperCase())}
                  </td>
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

      <div
        style={{ marginTop: 20 }}
        className="d-flex justify-content-between align-items-center p-2"
      >
        <button
          className="btn btn-secondary"
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
        >
          Back
        </button>
        <button
          className="btn btn-primary"
          disabled={step === 6}
          onClick={() => setStep(step + 1)}
        >
          Next
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
