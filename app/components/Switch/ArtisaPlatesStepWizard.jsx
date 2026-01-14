"use client";
import React, { useEffect, useState } from "react";

const API_URL = "https://api.panvic.in/csv/read-file/wipro_artisa_plates.csv";

export default function ArtisaPlatesStepWizard({ onRowsChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
/* 🔥 SEND SUMMARY ROWS TO PARENT */
useEffect(() => {
  const rows = buildSummaryRows();

  const formattedRows = rows.map((r, index) => ({
    sr_no: index + 1,
    itemCode: r.code,
    itemName: r.desc,
    description: r.desc,
    color: r.variant,
    category: r.category,
    quantity: r.qty,
    mrp: r.mrp,
    amount: r.amount,
    discount_percent: r.discount,
    net_price: r.net,
    unit: "pcs",
  }));

  onRowsChange && onRowsChange(formattedRows);
}, [switchJson, platesJson, fancyPlatesJson, customItemsJson]);
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

  /* UPDATE ON CHANGES */
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
          prices: {
            back_grid: pl.back_Grid_Mrp,
            white: pl.white_mrp,
            galaxy_black: pl.galaxy_black_mrp,
            silver_grey: pl.silver_grey_mrp,
            champagne_gold: pl.champagne_gold,
          },
          qty: {
            back_grid: q.back_grid || 0,
            white: q.white || 0,
            galaxy_black: q.galaxy_black || 0,
            silver_grey: q.silver_grey || 0,
            champagne_gold: q.champagne_gold || 0,
          },
          discount_percent: discount[pl.item_code] || 0,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    onDataChange(data);
  }, [qty, discount, plates, onDataChange]);

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
  const calculateTotals = (pl) => {
    const q = qty[pl.item_code] || {};
    const d = discount[pl.item_code] || 0;

    const backGridTotal = (q.back_grid || 0) * (pl.back_Grid_Mrp || 0);
    const whiteTotal = (q.white || 0) * (pl.white_mrp || 0);
    const galaxyTotal = (q.galaxy_black || 0) * (pl.galaxy_black_mrp || 0);
    const silverTotal = (q.silver_grey || 0) * (pl.silver_grey_mrp || 0);
    const champagneTotal = (q.champagne_gold || 0) * (pl.champagne_gold || 0);

    const total = backGridTotal + whiteTotal + galaxyTotal + silverTotal + champagneTotal;
    const discountAmt = (total * d) / 100;
    const finalAmt = total - discountAmt;

    return { total, discountAmt, finalAmt };
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
            {Array(5).fill(0).map((_, i) => (
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
            <tr><td colSpan="16" align="center">Loading...</td></tr>
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
                        handleQtyChange(pl.item_code, "back_grid", e.target.value)
                      }
                    />
                  </td>

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
                        handleQtyChange(pl.item_code, "galaxy_black", e.target.value)
                      }
                    />
                  </td>

                  <td>{pl.silver_grey_mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(pl.item_code, "silver_grey", e.target.value)
                      }
                    />
                  </td>

                  <td>{pl.champagne_gold}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(pl.item_code, "champagne_gold", e.target.value)
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
                        handleDiscountChange(pl.item_code, e.target.value)
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