"use client";
import React, { useEffect, useState, useMemo } from "react";
import CustomItemsStep from "./Switch/CustomItems";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GetNowaSwitchesquotationTables({
  onTotalChange,
  onRowsChange,
}) {
  const [step, setStep] = useState(1);
  const [switches, setSwitches] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [switchJson, setSwitchJson] = useState([]);

  const [platesJson, setPlatesJson] = useState([]);
  const [fancyPlatesJson, setFancyPlatesJson] = useState([]);
  const [customItemsJson, setCustomItemsJson] = useState([]);

  const [netPrice, setNetPrice] = useState({}); // ✅ NEW

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_URL}/csv/read-file/nowa_switches_plates.csv`)
      .then((res) => res.json())
      .then((json) => {
        const allData = json.data || [];
        const switchData = allData.filter((i) => i.category === "Switch");
        setSwitches(switchData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load switch data");
        setLoading(false);
      });
  }, []);

  const switchItems = useMemo(() => switches, [switches]);

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

  /* ================= CALC ================= */
  const calculateTotals = (sw) => {
    const q = qty[sw.item_code] || {};
    const d = discount[sw.item_code] || 0;

    const total =
      (q.white || 0) *
        (netPrice[sw.item_code]?.white ?? Number(sw.white_mrp) ?? 0) +
      (q.galaxy_black || 0) *
        (netPrice[sw.item_code]?.galaxy_black ??
          Number(sw.galaxy_black_mrp) ??
          0) +
      (q.silver_grey || 0) *
        (netPrice[sw.item_code]?.silver_grey ??
          Number(sw.silver_grey_mrp) ??
          0);

    const final = total - (total * d) / 100;

    return { total, final };
  };

  /* ================= SWITCH JSON ================= */
  useEffect(() => {
    const data = switchItems
      .map((sw) => {
        const q = qty[sw.item_code] || {};
        if (!Object.values(q).some((v) => v > 0)) return null;

        const totals = calculateTotals(sw);

        return {
          item_code: sw.item_code,
          description: sw.material_description,
          brand: sw.brand || "Wipro",
          model: sw.model || "Nowa",

          mrp: {
            white: Number(sw.white_mrp),
            galaxy_black: Number(sw.galaxy_black_mrp),
            silver_grey: Number(sw.silver_grey_mrp),
          },

          netPrice: {
            white: netPrice[sw.item_code]?.white ?? Number(sw.white_mrp),
            galaxy_black:
              netPrice[sw.item_code]?.galaxy_black ??
              Number(sw.galaxy_black_mrp),
            silver_grey:
              netPrice[sw.item_code]?.silver_grey ?? Number(sw.silver_grey_mrp),
          },

          qty: {
            white: q.white || 0,
            galaxy_black: q.galaxy_black || 0,
            silver_grey: q.silver_grey || 0,
          },

          discount_percent: discount[sw.item_code] || 0,
          final_amount: totals.final,
        };
      })
      .filter(Boolean);

    setSwitchJson(data);
  }, [qty, discount, netPrice, switchItems]);

  /* ================= SUMMARY ================= */
  const buildSummaryRows = () => {
    const rows = [];
    const variants = ["white", "galaxy_black", "silver_grey"];
    const names = {
      white: "White",
      galaxy_black: "Galaxy Black",
      silver_grey: "Silver Grey",
    };

    switchJson.forEach((it) => {
      variants.forEach((v) => {
        const q = it.qty[v];
        if (q > 0) {
          const mrp =
            it.mrp?.[v] ??
            it.netPrice?.[v] ?? // fallback
            0;
          const net = it.netPrice[v] || 0;
          const disc = it.discount_percent || 0;

          const netPerUnit = net - (net * disc) / 100;
          const amount = netPerUnit * q;

          rows.push({
            itemCode: it.item_code,
            itemName: it.description, // ✅ ADD THIS

            customerDescription: it.description,
            brand: it.brand,
            model: it.model,
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
customItemsJson.forEach((it) => {
  if (it.qty > 0) {
    rows.push({
      itemCode: "-",
      itemName: it.item_name, // ✅ IMPORTANT
      customerDescription: it.item_name,
      brand: "-",
      model: "-",
      color: "-",
      category: "Custom",
      qty: it.qty,
      mrp: it.mrp || 0,
      netPrice: it.net_price || it.mrp || 0,
      discount: it.discount || 0,
      amount: it.total_amount || 0,
      unit: "pcs",
    });
  }
});
    return rows;
  };

  /* ================= SYNC ================= */
  useEffect(() => {
    const rows = buildSummaryRows();
    const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
    onRowsChange?.(rows);
    onTotalChange?.(total);
}, [switchJson, customItemsJson]);

  const getRowTotal = (sw) => {
    return calculateTotals(sw).final.toFixed(2);
  };

  /* ================= UI ================= */
  return (
    <div>
      {/* STEP */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        {[1, 2, 3].map((s) => (
          <div key={s}>{`Step ${s}`}</div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>White MRP</th>
              <th>White Net</th>
              <th>Qty</th>
              <th>Black MRP</th>
              <th>Black Net</th>
              <th>Qty</th>
              <th>Grey MRP</th>
              <th>Grey Net</th>
              <th>Qty</th>
              <th>Disc %</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              switchItems.map((sw) => (
                <tr key={sw.item_code}>
                  <td>{sw.item_code}</td>
                  <td>{sw.material_description}</td>

                  {/* WHITE */}
                  <td>{sw.white_mrp}</td>
                  <td>
                    <input
                      type="number"
                      value={netPrice[sw.item_code]?.white ?? sw.white_mrp}
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
                      onChange={(e) =>
                        handleQtyChange(sw.item_code, "white", e.target.value)
                      }
                    />
                  </td>

                  {/* BLACK */}
                  <td>{sw.galaxy_black_mrp}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        netPrice[sw.item_code]?.galaxy_black ??
                        sw.galaxy_black_mrp
                      }
                      onChange={(e) =>
                        handleNetPriceChange(
                          sw.item_code,
                          "galaxy_black",
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
                          "galaxy_black",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* GREY */}
                  <td>{sw.silver_grey_mrp}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        netPrice[sw.item_code]?.silver_grey ??
                        sw.silver_grey_mrp
                      }
                      onChange={(e) =>
                        handleNetPriceChange(
                          sw.item_code,
                          "silver_grey",
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
                          "silver_grey",
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
      {step === 2 && <CustomItemsStep onDataChange={setCustomItemsJson} />}
      {/* STEP 3 SUMMARY */}
      {step === 3 && (
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
                  <td>{r.customerDescription}</td>
                  <td>{r.brand}</td>
                  <td>{r.model}</td>
                  <td>{r.color}</td>
                  <td>{r.category}</td>
                  <td>{r.qty}</td>
                  <td>{(r.mrp || 0).toFixed(2)}</td>
                  <td>{(r.netPrice || 0).toFixed(2)}</td>
                  <td>{r.discount}</td>

                  <td>{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* NAV */}
      <button onClick={() => setStep(step - 1)}>Back</button>
      <button onClick={() => setStep(step + 1)}>Next</button>
    </div>
  );
}
