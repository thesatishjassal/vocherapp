import React, { useEffect, useState } from "react";

const API_URL =
  "https://api.panvic.in/csv/read-file/wipro_artisa_plates.csv";

export default function ArtisaPlatesStepWizard() {
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
        setError("Failed to load plates data");
        setLoading(false);
      });
  }, []);

  /* HANDLERS */
  const handleQtyChange = (code, color, value) => {
    setQty((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [color]: Number(value),
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

    const total =
      (q.back_grid || 0) * (pl.back_Grid_Mrp || 0) +
      (q.white || 0) * (pl.white_mrp || 0) +
      (q.galaxy || 0) * (pl.galaxy_black_mrp || 0) +
      (q.silver || 0) * (pl.silver_grey_mrp || 0) +
      (q.champagne || 0) * (pl.champagne_gold || 0);

    const discountAmt = (total * d) / 100;
    const finalAmt = total - discountAmt;

    return { total, discountAmt, finalAmt };
  };

  /* GENERATE SUMMARY */
  const generateSummary = () => {
    const jsonData = plates
      .map((pl) => {
        const q = qty[pl.item_code] || {};
        const hasQty = Object.values(q).some((v) => v > 0);
        if (!hasQty) return null;

        const totals = calculateTotals(pl);

        return {
          item_code: pl.item_code,
          description: pl.description,
          category: pl.category,
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
            galaxy_black: q.galaxy || 0,
            silver_grey: q.silver || 0,
            champagne_gold: q.champagne || 0,
          },
          total_amount: totals.total,
          discount_percent: discount[pl.item_code] || 0,
          discount_amount: totals.discountAmt,
          final_amount: totals.finalAmt,
        };
      })
      .filter(Boolean);

    setFinalJson(jsonData);
    console.log("Generated JSON:", jsonData);
  };

  /* SUMMARY TABLE */
  const renderSummaryTable = () => {
    let srNo = 1;
    const colors = [
      { key: "back_grid", label: "Back Grid" },
      { key: "white", label: "White" },
      { key: "galaxy_black", label: "Galaxy Black" },
      { key: "silver_grey", label: "Silver Grey" },
      { key: "champagne_gold", label: "Champagne Gold" },
    ];

    const rows = [];
    finalJson.forEach((item) => {
      colors.forEach((c) => {
        const q = item.qty[c.key];
        if (q > 0) {
          const mrp = item.prices[c.key];
          const amount = q * mrp;
          const net = amount * (1 - item.discount_percent / 100);

          rows.push(
            <tr key={`${item.item_code}-${c.key}`}>
              <td>{srNo++}</td>
              <td>{item.item_code}</td>
              <td>{item.description}</td>
              <td>{c.label}</td>
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
        <h4>Final Summary</h4>
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>SR</th>
              <th>Item Code</th>
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

  return (
    <div>
      <h3>Artisa Plates Selection</h3>

      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th rowSpan="2">Item Code</th>
              <th>Description</th>
              <th rowSpan="2">Module</th>

              <th colSpan="2">Back Grid</th>
              <th colSpan="2">White</th>
              <th colSpan="2">Galaxy Black</th>
              <th colSpan="2">Silver Grey</th>
              <th colSpan="2">Champagne Gold</th>

              <th rowSpan="2">Total</th>
              <th rowSpan="2">Discount %</th>
              <th rowSpan="2">Discount Amt</th>
              <th rowSpan="2">Final Amt</th>
            </tr>
            <tr>
              <th>Price</th><th>Qty</th>
              <th>Price</th><th>Qty</th>
              <th>Price</th><th>Qty</th>
              <th>Price</th><th>Qty</th>
              <th>Price</th><th>Qty</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr><td colSpan="18" align="center">Loading...</td></tr>
            )}
            {error && (
              <tr><td colSpan="18" align="center">{error}</td></tr>
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
                    <td><input type="number" min="0" style={{ width: 50 }}
                      onChange={(e) => handleQtyChange(pl.item_code, "back_grid", e.target.value)} /></td>

                    <td>{pl.white_mrp}</td>
                    <td><input type="number" min="0" style={{ width: 50 }}
                      onChange={(e) => handleQtyChange(pl.item_code, "white", e.target.value)} /></td>

                    <td>{pl.galaxy_black_mrp}</td>
                    <td><input type="number" min="0" style={{ width: 50 }}
                      onChange={(e) => handleQtyChange(pl.item_code, "galaxy", e.target.value)} /></td>

                    <td>{pl.silver_grey_mrp}</td>
                    <td><input type="number" min="0" style={{ width: 50 }}
                      onChange={(e) => handleQtyChange(pl.item_code, "silver", e.target.value)} /></td>

                    <td>{pl.champagne_gold}</td>
                    <td><input type="number" min="0" style={{ width: 50 }}
                      onChange={(e) => handleQtyChange(pl.item_code, "champagne", e.target.value)} /></td>

                    <td>{totals.total}</td>
                    <td>
                      <input type="number" min="0" max="100" style={{ width: 50 }}
                        onChange={(e) => handleDiscountChange(pl.item_code, e.target.value)} />
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
