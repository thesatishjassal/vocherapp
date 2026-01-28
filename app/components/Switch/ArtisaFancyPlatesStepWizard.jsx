"use client";
import React, { useEffect, useState } from "react";

// const API_URL =
//   "https://api.panvic.in/csv/read-file/wipro_artisa_fancy_plates.csv";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ArtisaFancyPlatesStepWizard({ onDataChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* LOAD FANCY PLATES DATA */
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

  /* UPDATE ON CHANGES */
  useEffect(() => {
    const data = plates
      .map((pl) => {
        const itemKey = `${pl.description}-${pl.module_size}`;
        const q = qty[itemKey] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(pl, itemKey);

        const prices = {};
        const qtyObj = {};
        getMrpKeys(pl).forEach((mrpKey) => {
          const colorKey = mrpKey.replace("_mrp", "");
          prices[colorKey] = pl[mrpKey];
          qtyObj[colorKey] = q[colorKey] || 0;
        });

        return {
          description: pl.description,
          module_size: pl.module_size,
          prices,
          qty: qtyObj,
          discount_percent: discount[itemKey] || 0,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    onDataChange(data);
  }, [qty, discount, plates, onDataChange]);

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

  /* ===== HELPERS ===== */
  const getMrpKeys = (pl) =>
    Object.keys(pl).filter((k) => k.endsWith("_mrp"));

  const calculateTotals = (pl, itemKey) => {
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

  const getColorNameFromMrpKey = (mrpKey) =>
    mrpKey
      .replace("_mrp", "")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="table-responsive switch_table">
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
            <th>Final</th>
          </tr>
          <tr>
            <th colSpan="2" />
            {plates[0] &&
              getMrpKeys(plates[0]).map((mrpKey) => (
                <React.Fragment key={mrpKey}>
                  <th>Price</th>
                  <th>Qty</th>
                </React.Fragment>
              ))}
            <th colSpan="3" />
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr><td colSpan="20" align="center">Loading...</td></tr>
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
                        <td>{pl[mrpKey]}</td> 
                        <td>
                          <input
                            type="number"
                            min="0"
                            onChange={(e) =>
                              handleQtyChange(itemKey, colorKey, e.target.value)
                            }
                          /></td>
                        </React.Fragment>
                      );
                    })}
                  <td>{totals.total}</td>
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
                  <td>{totals.finalAmt}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}