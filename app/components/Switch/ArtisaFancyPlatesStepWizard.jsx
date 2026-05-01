"use client";
import React, { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ArtisaFancyPlatesStepWizard({ onDataChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [netPrice, setNetPrice] = useState({}); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetch(`${API_URL}/csv/read-file/wipro_artisa_fancy_plates.csv`)
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

  /* ================= HELPERS ================= */
  const getMrpKeys = (pl) => Object.keys(pl).filter((k) => k.endsWith("_mrp"));

  const getColorNameFromMrpKey = (mrpKey) =>
    mrpKey
      .replace("_mrp", "")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  /* ================= HANDLERS ================= */
  const handleQtyChange = (itemKey, colorKey, value) => {
    setQty((prev) => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], [colorKey]: Number(value) || 0 },
    }));
  };

  const handleDiscountChange = (itemKey, value) => {
    setDiscount((prev) => ({ ...prev, [itemKey]: Number(value) || 0 }));
  };

  const handleNetPriceChange = (itemKey, colorKey, value) => {
    setNetPrice((prev) => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], [colorKey]: Number(value) || 0 },
    }));
  };

  /* ================= TOTALS ================= */
  const calculateTotals = (pl, itemKey) => {
    const q = qty[itemKey] || {};
    const d = discount[itemKey] || 0;

    let total = 0;
    getMrpKeys(pl).forEach((mrpKey) => {
      const colorKey = mrpKey.replace("_mrp", "");
      const net = netPrice[itemKey]?.[colorKey] ?? Number(pl[mrpKey]) ?? 0;
      total += (q[colorKey] || 0) * net;
    });

    const finalAmt = total * (1 - d / 100);
    return { total, finalAmt };
  };

  /* ================= SYNC TO PARENT ================= */
  useEffect(() => {
    const data = plates
      .map((pl) => {
        const itemKey = `${pl.description}-${pl.module_size}`;
        const q = qty[itemKey] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(pl, itemKey);

        const mrpObj = {};
        const netPriceObj = {};
        const qtyObj = {};

        getMrpKeys(pl).forEach((mrpKey) => {
          const colorKey = mrpKey.replace("_mrp", "");
          mrpObj[colorKey]      = Number(pl[mrpKey]);
          netPriceObj[colorKey] = netPrice[itemKey]?.[colorKey] ?? Number(pl[mrpKey]);
          qtyObj[colorKey]      = q[colorKey] || 0;
        });

        return {
          description: pl.description,
          module_size: pl.module_size,
          mrp: mrpObj,
          netPrice: netPriceObj,
          prices: netPriceObj, // backward-compat with safeLoop in parent
          qty: qtyObj,
          discount_percent: discount[itemKey] || 0,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    onDataChange(data);
  }, [qty, discount, netPrice, plates, onDataChange]);

  /* ================= UI ================= */
  return (
    <div className="table-responsive switch_table">
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          {/* ROW 1 — group headers */}
          <tr>
            <th>Description</th>
            <th>Module</th>
            {plates[0] &&
              getMrpKeys(plates[0]).map((mrpKey) => (
                <th key={mrpKey} colSpan="3">
                  {getColorNameFromMrpKey(mrpKey)}
                </th>
              ))}
            <th>Disc %</th>
            <th>Amount</th>
          </tr>

          {/* ROW 2 — sub-headers */}
          <tr>
            <th colSpan="2" />
            {plates[0] &&
              getMrpKeys(plates[0]).map((mrpKey) => (
                <React.Fragment key={mrpKey}>
                  <th>MRP</th>
                  <th>Net</th>
                  <th>Qty</th>
                </React.Fragment>
              ))}
            <th colSpan="2" />
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="20" align="center">Loading...</td>
            </tr>
          )}

          {!loading &&
            plates.map((pl) => {
              const itemKey = `${pl.description}-${pl.module_size}`;
              const totals = calculateTotals(pl, itemKey);

              return (
                <tr key={itemKey}>
                  <td>{pl.description}</td>
                  <td>{pl.module_size}</td>

                  {getMrpKeys(pl).map((mrpKey) => {
                    const colorKey = mrpKey.replace("_mrp", "");
                    return (
                      <React.Fragment key={mrpKey}>
                        {/* MRP — read only */}
                        <td>{pl[mrpKey]}</td>

                        {/* Net Price — editable */}
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={
                              netPrice[itemKey]?.[colorKey] ?? pl[mrpKey] ?? ""
                            }
                            onChange={(e) =>
                              handleNetPriceChange(itemKey, colorKey, e.target.value)
                            }
                          />
                        </td>

                        {/* Qty */}
                        <td>
                          <input
                            type="number"
                            min="0"
                            onChange={(e) =>
                              handleQtyChange(itemKey, colorKey, e.target.value)
                            }
                          />
                        </td>
                      </React.Fragment>
                    );
                  })}

                  {/* Disc % */}
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      onChange={(e) =>
                        handleDiscountChange(itemKey, e.target.value)
                      }
                    />
                  </td>

                  {/* Amount */}
                  <td>₹ {totals.finalAmt.toFixed(2)}</td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
