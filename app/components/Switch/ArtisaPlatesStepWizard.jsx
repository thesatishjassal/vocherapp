"use client";
import React, { useEffect, useState } from "react";

const API_URL = "https://api.panvic.in/csv/read-file/wipro_artisa_plates.csv";

export default function ArtisaPlatesStepWizard({ onRowsChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // JSON STATES (important)
  const [platesJson, setPlatesJson] = useState([]);

  /* LOAD PLATES DATA */
  useEffect(() => {
    fetch(API_URL)
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

  /* CALCULATIONS */
  const calculateTotals = (pl) => {
    const q = qty[pl.item_code] || {};
    const d = discount[pl.item_code] || 0;

    const backGridTotal = (q.back_grid || 0) * (pl.back_Grid_Mrp || 0);
    const whiteTotal = (q.white || 0) * (pl.white_mrp || 0);
    const galaxyTotal =
      (q.galaxy_black || 0) * (pl.galaxy_black_mrp || 0);
    const silverTotal =
      (q.silver_grey || 0) * (pl.silver_grey_mrp || 0);
    const champagneTotal =
      (q.champagne_gold || 0) * (pl.champagne_gold || 0);

    const total =
      backGridTotal +
      whiteTotal +
      galaxyTotal +
      silverTotal +
      champagneTotal;

    const discountAmt = (total * d) / 100;
    const finalAmt = total - discountAmt;

    return { total, discountAmt, finalAmt };
  };

  /* BUILD PLATES JSON */
  useEffect(() => {
    const data = plates
      .map((pl) => {
        const q = qty[pl.item_code] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(pl);

        return {
          item_code: pl.item_code,
          description: pl.description,
          module_size: pl.module_size,
          qty: q,
          discount_percent: discount[pl.item_code] || 0,
          total: totals.total,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    setPlatesJson(data);
  }, [plates, qty, discount]);

  /* SEND SUMMARY TO PARENT */
  useEffect(() => {
    const formattedRows = platesJson.map((r, index) => ({
      sr_no: index + 1,
      itemCode: r.item_code,
      itemName: r.description,
      description: r.description,
      category: "Plates",
      quantity: Object.values(r.qty).reduce((a, b) => a + b, 0),
      amount: r.total,
      discount_percent: r.discount_percent,
      net_price: r.final_amount,
      unit: "pcs",
    }));

    onRowsChange && onRowsChange(formattedRows);
  }, [platesJson, onRowsChange]);

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

  return (
    <div className="table-responsive switch_table">
      <table className="tm_round_border table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Module</th>
            <th colSpan="2">Back Grid</th>
            <th colSpan="2">White</th>
            <th colSpan="2">Galaxy Black</th>
            <th colSpan="2">Silver Grey</th>
            <th colSpan="2">Champagne Gold</th>
            <th>Total</th>
            <th>Disc %</th>
            <th>Final</th>
          </tr>
          <tr>
            <th colSpan="3" />
            {Array(5)
              .fill(0)
              .map((_, i) => (
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
            <tr>
              <td colSpan="16" align="center">
                Loading...
              </td>
            </tr>
          )}

          {!loading &&
            plates.map((pl) => {
              const totals = calculateTotals(pl);
              return (
                <tr key={pl.item_code}>
                  <td>{pl.item_code}</td>
                  <td>{pl.description}</td>
                  <td>{pl.module_size}</td>

                  <td>{pl.back_Grid_Mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          pl.item_code,
                          "back_grid",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>{pl.white_mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          pl.item_code,
                          "white",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>{pl.galaxy_black_mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          pl.item_code,
                          "galaxy_black",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>{pl.silver_grey_mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          pl.item_code,
                          "silver_grey",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>{pl.champagne_gold}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          pl.item_code,
                          "champagne_gold",
                          e.target.value
                        )
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
                        handleDiscountChange(
                          pl.item_code,
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>{totals.finalAmt}</td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
