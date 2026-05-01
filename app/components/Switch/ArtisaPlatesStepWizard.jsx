"use client";
import React, { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ArtisaPlatesStepWizard({ onRowsChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [netPrice, setNetPrice] = useState({}); // ✅ NEW
  const [platesJson, setPlatesJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetch(`${API_URL}/csv/read-file/wipro_artisa_plates.csv`)
      .then((res) => res.json())
      .then((json) => {
        setPlates(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load plates data");
        setLoading(false);
      });
  }, []);

  /* ================= HANDLERS ================= */
  const handleQtyChange = (code, type, value) => {
    setQty((prev) => ({
      ...prev,
      [code]: { ...prev[code], [type]: Number(value) || 0 },
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
      [code]: { ...prev[code], [type]: Number(value) || 0 },
    }));
  };

  /* ================= TOTALS ================= */
  const calculateTotals = (pl) => {
    const q = qty[pl.item_code] || {};
    const d = discount[pl.item_code] || 0;

    const prices = {
      white:     netPrice[pl.item_code]?.white     ?? Number(pl.white_mrp)      ?? 0,
      galaxy:    netPrice[pl.item_code]?.galaxy    ?? Number(pl.galaxy_black_mrp) ?? 0,
      silver:    netPrice[pl.item_code]?.silver    ?? Number(pl.silver_grey_mrp) ?? 0,
      champagne: netPrice[pl.item_code]?.champagne ?? Number(pl.champagne_gold)  ?? 0,
    };

    const total =
      (q.white     || 0) * prices.white +
      (q.galaxy    || 0) * prices.galaxy +
      (q.silver    || 0) * prices.silver +
      (q.champagne || 0) * prices.champagne;

    return {
      total,
      final: total * (1 - (d / 100)),
      prices,
    };
  };

  const getRowTotal = (pl) => calculateTotals(pl).final.toFixed(2);

  /* ================= BUILD PLATES JSON ================= */
  useEffect(() => {
    const data = plates
      .map((pl) => {
        const q = qty[pl.item_code] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(pl);

        return {
          item_code: pl.item_code,
          description: pl.description,

          mrp: {
            white:     Number(pl.white_mrp),
            galaxy:    Number(pl.galaxy_black_mrp),
            silver:    Number(pl.silver_grey_mrp),
            champagne: Number(pl.champagne_gold),
          },

          // netPrice per variant (falls back to MRP if not overridden)
          netPrice: {
            white:     netPrice[pl.item_code]?.white     ?? Number(pl.white_mrp),
            galaxy:    netPrice[pl.item_code]?.galaxy    ?? Number(pl.galaxy_black_mrp),
            silver:    netPrice[pl.item_code]?.silver    ?? Number(pl.silver_grey_mrp),
            champagne: netPrice[pl.item_code]?.champagne ?? Number(pl.champagne_gold),
          },

          // kept for backward-compat with safeLoop in parent
          prices: totals.prices,

          qty: {
            white:     q.white     || 0,
            galaxy:    q.galaxy    || 0,
            silver:    q.silver    || 0,
            champagne: q.champagne || 0,
          },

          discount_percent: discount[pl.item_code] || 0,
          final_amount: totals.final,
        };
      })
      .filter(Boolean);

    setPlatesJson(data);
  }, [plates, qty, discount, netPrice]);

  /* ================= SYNC TO PARENT ================= */
  useEffect(() => {
    onRowsChange?.(platesJson);
  }, [platesJson, onRowsChange]);

  /* ================= UI ================= */
  return (
    <div className="table-responsive switch_table">
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>

            <th>White MRP</th>
            <th>White Net</th>
            <th>White Qty</th>

            <th>Galaxy MRP</th>
            <th>Galaxy Net</th>
            <th>Galaxy Qty</th>

            <th>Silver MRP</th>
            <th>Silver Net</th>
            <th>Silver Qty</th>

            <th>Champagne MRP</th>
            <th>Champagne Net</th>
            <th>Champagne Qty</th>

            <th>Disc %</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan="16" align="center">Loading...</td>
            </tr>
          )}

          {!loading &&
            plates.map((pl) => (
              <tr key={pl.item_code}>
                <td>{pl.item_code}</td>
                <td>{pl.description}</td>

                {/* WHITE */}
                <td>{pl.white_mrp}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={netPrice[pl.item_code]?.white ?? pl.white_mrp ?? ""}
                    onChange={(e) =>
                      handleNetPriceChange(pl.item_code, "white", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "white", e.target.value)
                    }
                  />
                </td>

                {/* GALAXY */}
                <td>{pl.galaxy_black_mrp}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={netPrice[pl.item_code]?.galaxy ?? pl.galaxy_black_mrp ?? ""}
                    onChange={(e) =>
                      handleNetPriceChange(pl.item_code, "galaxy", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "galaxy", e.target.value)
                    }
                  />
                </td>

                {/* SILVER */}
                <td>{pl.silver_grey_mrp}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={netPrice[pl.item_code]?.silver ?? pl.silver_grey_mrp ?? ""}
                    onChange={(e) =>
                      handleNetPriceChange(pl.item_code, "silver", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "silver", e.target.value)
                    }
                  />
                </td>

                {/* CHAMPAGNE */}
                <td>{pl.champagne_gold}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={netPrice[pl.item_code]?.champagne ?? pl.champagne_gold ?? ""}
                    onChange={(e) =>
                      handleNetPriceChange(pl.item_code, "champagne", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "champagne", e.target.value)
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
                      handleDiscountChange(pl.item_code, e.target.value)
                    }
                  />
                </td>

                {/* AMOUNT */}
                <td>₹ {getRowTotal(pl)}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
