"use client";
import React, { useEffect, useState } from "react";

const API_URL =
  "https://api.panvic.in/csv/read-file/wipro_artisa_fancy_plates.csv";

/* ===== HELPERS ===== */

// unique key per item
const getItemKey = (pl) => `${pl.description}-${pl.module_size}`;

// convert mrp key to color name
const getColorNameFromMrpKey = (mrpKey) =>
  mrpKey
    .replace("_mrp", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// extract all *_mrp keys dynamically
const getMrpKeys = (pl) =>
  Object.keys(pl).filter((k) => k.endsWith("_mrp"));

export default function ArtisaFancyPlatesStepWizard() {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [finalJson, setFinalJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* LOAD DATA */
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        setPlates(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load fancy plates data");
        setLoading(false);
      });
  }, []);

  /* HANDLERS */
  const handleQtyChange = (itemKey, colorKey, value) => {
    setQty((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [colorKey]: Number(value),
      },
    }));
  };

  const handleDiscountChange = (itemKey, value) => {
    setDiscount((prev) => ({
      ...prev,
      [itemKey]: Number(value),
    }));
  };

  /* CALCULATIONS */
  const calculateTotals = (pl) => {
    const itemKey = getItemKey(pl);
    const q = qty[itemKey] || {};
    const d = discount[itemKey] || 0;

    let total = 0;
    getMrpKeys(pl).forEach((mrpKey) => {
      const colorKey = mrpKey.replace("_mrp", "");
      total += (q[colorKey] || 0) * (pl[mrpKey] || 0);
    });

    const discountAmt = (total * d) / 100;
    const finalAmt = total - discountAmt;

    return { total, discountAmt, finalAmt };
  };

  /* GENERATE SUMMARY */
  const generateSummary = () => {
    const jsonData = plates
      .map((pl) => {
        const itemKey = getItemKey(pl);
        const q = qty[itemKey] || {};

        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(pl);

        return {
          item_key: itemKey,
          description: pl.description,
          module_size: pl.module_size,
          category: pl.category,
          mrpKeys: getMrpKeys(pl),
          prices: pl,
          qty: q,
          discount_percent: discount[itemKey] || 0,
          total_amount: totals.total,
          discount_amount: totals.discountAmt,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    setFinalJson(jsonData);
    console.log("FINAL SUMMARY:", jsonData);
  };

  /* SUMMARY TABLE */
const renderSummaryTable = () => {
  let srNo = 1;
  const rows = [];

  finalJson.forEach((item) => {
    getMrpKeys(item.prices).forEach((mrpKey) => {
      const colorKey = mrpKey.replace("_mrp", "");
      const q = item.qty[colorKey];

      if (q > 0) {
        const mrp = item.prices[mrpKey];
        const amount = q * mrp;
        const net = amount * (1 - item.discount_percent / 100);

        rows.push(
          <tr key={`${item.item_key}-${colorKey}`}>
            <td>{srNo++}</td>
            <td>{item.module_size}</td>
            <td>{item.description}</td>
            <td>{getColorNameFromMrpKey(mrpKey)}</td>
            <td>{q}</td>
            <td>{mrp}</td>
            <td>{amount}</td>
            <td>{item.discount_percent}</td>
            <td>{net}</td>
          </tr>
        );
      }
    });
  });

  if (!rows.length) return null;

  return (
    <div className="table-responsive" style={{ marginTop: 30 }}>
      <h4>Final Summary – Fancy Plates</h4>
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR</th>
            <th>Module</th>
            <th>Description</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>MRP</th>
            <th>Amount</th>
            <th>Disc %</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

  /* MAIN TABLE */
  return (
    <div>
      <h3>Artisa Fancy Plates Selection</h3>

      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>Description</th>
              <th>Module</th>

              {plates[0] &&
                getMrpKeys(plates[0]).map((mrpKey) => (
                  <th key={mrpKey} colSpan="2">
                    {getColorNameFromMrpKey(mrpKey)}
                  </th>
                ))}

              <th>Total</th>
              <th>Disc %</th>
              <th>Disc Amt</th>
              <th>Final</th>
            </tr>
            <tr>
              {plates[0] &&
                getMrpKeys(plates[0]).map((mrpKey) => (
                  <React.Fragment key={mrpKey}>
                    <th>Price</th>
                    <th>Qty</th>
                  </React.Fragment>
                ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="22" align="center">
                  Loading...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan="22" align="center">
                  {error}
                </td>
              </tr>
            )}

            {!loading &&
              plates.map((pl) => {
                const itemKey = getItemKey(pl);
                const totals = calculateTotals(pl);

                return (
                  <tr key={itemKey}>
                    <td>{pl.description}</td>
                    <td>{pl.module_size}</td>

                    {getMrpKeys(pl).map((mrpKey) => {
                      const colorKey = mrpKey.replace("_mrp", "");
                      return (
                        <React.Fragment key={mrpKey}>
                          <td>{pl[mrpKey]}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              style={{ width: 50 }}
                              value={qty[itemKey]?.[colorKey] || ""}
                              onChange={(e) =>
                                handleQtyChange(
                                  itemKey,
                                  colorKey,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}

                    <td>{totals.total}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        style={{ width: 50 }}
                        value={discount[itemKey] || ""}
                        onChange={(e) =>
                          handleDiscountChange(itemKey, e.target.value)
                        }
                      />
                    </td>
                    <td>{totals.discountAmt}</td>
                    <td>{totals.finalAmt}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={generateSummary}>Generate Summary</button>
      </div>

      {renderSummaryTable()}
    </div>
  );
}
