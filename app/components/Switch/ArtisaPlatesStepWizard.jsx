"use client";
import React, { useEffect, useState } from "react";

// const API_URL = "https://api.panvic.in/csv/read-file/wipro_artisa_plates.csv";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ArtisaPlatesStepWizard({ onRowsChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [platesJson, setPlatesJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* LOAD DATA */
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

  /* TOTALS */
  const calculateTotals = (pl) => {
    const q = qty[pl.item_code] || {};
    const d = discount[pl.item_code] || 0;

    const prices = {
      white: pl.white_mrp || 0,
      galaxy: pl.galaxy_black_mrp || 0,
      silver: pl.silver_grey_mrp || 0,
      champagne: pl.champagne_gold || 0,
    };

    const total =
      (q.white || 0) * prices.white +
      (q.galaxy || 0) * prices.galaxy +
      (q.silver || 0) * prices.silver +
      (q.champagne || 0) * prices.champagne;

    return {
      total,
      final: total * (1 - d / 100),
      prices,
    };
  };

  /* BUILD RAW PLATES JSON */
  useEffect(() => {
    const data = plates
      .map((pl) => {
        const q = qty[pl.item_code] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(pl);

        return {
          item_code: pl.item_code,
          description: pl.description,
          prices: totals.prices,
          qty: {
            white: q.white || 0,
            galaxy: q.galaxy || 0,
            silver: q.silver || 0,
            champagne: q.champagne || 0,
          },
          discount_percent: discount[pl.item_code] || 0,
        };
      })
      .filter(Boolean);

    setPlatesJson(data);
  }, [plates, qty, discount]);

  /* 🔑 SEND RAW DATA TO PARENT */
  useEffect(() => {
    onRowsChange?.(platesJson);
  }, [platesJson, onRowsChange]);

  /* HANDLERS */
  const handleQtyChange = (code, type, value) => {
    setQty((prev) => ({
      ...prev,
      [code]: { ...prev[code], [type]: Number(value) },
    }));
  };

  const handleDiscountChange = (code, value) => {
    setDiscount((prev) => ({
      ...prev,
      [code]: Number(value),
    }));
  };

  /* UI */
  return (
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
            <th>Champagne</th>
            <th>Qty</th>
            <th>Disc %</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan="11" align="center">
                Loading...
              </td>
            </tr>
          )}

          {!loading &&
            plates.map((pl) => (
              <tr key={pl.item_code}>
                <td>{pl.item_code}</td>
                <td>{pl.description}</td>

                <td>{pl.white_mrp}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "white", e.target.value)
                    }
                  />
                </td>

                <td>{pl.galaxy_black_mrp}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "galaxy", e.target.value)
                    }
                  />
                </td>

                <td>{pl.silver_grey_mrp}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "silver", e.target.value)
                    }
                  />
                </td>

                <td>{pl.champagne_gold}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    onChange={(e) =>
                      handleQtyChange(pl.item_code, "champagne", e.target.value)
                    }
                  />
                </td>

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
              </tr>
            ))}
        </tbody>
      </table>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
