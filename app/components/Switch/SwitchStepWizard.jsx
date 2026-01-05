import React, { useEffect, useState } from "react";

const API_URL =
  "https://api.panvic.in/csv/read-file/wipro_artisa_switches.csv";

export default function SwitchStepWizard() {
  const [step, setStep] = useState(1);
  const [switches, setSwitches] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [summary, setSummary] = useState([]);

  /* LOAD DATA */
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => setSwitches(json.data || []));
  }, []);

  /* HANDLERS */
  const handleQtyChange = (code, variant, value) => {
    setQty((p) => ({
      ...p,
      [code]: {
        ...p[code],
        [variant]: Number(value),
      },
    }));
  };

  const handleDiscountChange = (code, value) => {
    setDiscount((p) => ({
      ...p,
      [code]: Number(value),
    }));
  };

  /* STEP 1 → STEP 2 */
  const generateSummary = () => {
    let sr = 1;
    const rows = [];

    switches.forEach((sw) => {
      const q = qty[sw.item_code] || {};
      const disc = discount[sw.item_code] || 0;

      const variants = [
        { key: "white", label: "White", mrp: sw.white_mrp },
        { key: "galaxy", label: "Galaxy Black", mrp: sw.galaxy_black_mrp },
        { key: "silver", label: "Silver Grey", mrp: sw.silver_grey_mrp },
      ];

      variants.forEach((v) => {
        const quantity = q[v.key] || 0;
        if (quantity > 0) {
          const amount = quantity * v.mrp;
          const net = amount * (1 - disc / 100);

          rows.push({
            sr: sr++,
            item_code: sw.item_code,
            description: sw.material_description,
            variant: v.label,
            qty: quantity,
            mrp: v.mrp,
            amount,
            disc,
            net,
          });
        }
      });
    });

    setSummary(rows);
    setStep(2);
  };

  return (
    <div>
      <h3>Switch Selection Wizard</h3>

      {/* STEP 1 : INPUT */}
      {step === 1 && (
        <>
          <table className="tm_round_border table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>White</th>
                <th>Qty</th>
                <th>Galaxy</th>
                <th>Qty</th>
                <th>Silver</th>
                <th>Qty</th>
                <th>Disc %</th>
              </tr>
            </thead>
            <tbody>
              {switches.map((sw) => (
                <tr key={sw.item_code}>
                  <td>{sw.item_code}</td>
                  <td>{sw.material_description}</td>

                  <td>{sw.white_mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          sw.item_code,
                          "white",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>{sw.galaxy_black_mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          sw.item_code,
                          "galaxy",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>{sw.silver_grey_mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleQtyChange(
                          sw.item_code,
                          "silver",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      onChange={(e) =>
                        handleDiscountChange(
                          sw.item_code,
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={generateSummary}>Generate Summary</button>
        </>
      )}

      {/* STEP 2 : SUMMARY */}
      {step === 2 && (
        <>
          <h4>Summary</h4>

          <table className="tm_round_border table">
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
            <tbody>
              {summary.map((r) => (
                <tr key={r.sr}>
                  <td>{r.sr}</td>
                  <td>{r.item_code}</td>
                  <td>{r.description}</td>
                  <td>{r.variant}</td>
                  <td>{r.qty}</td>
                  <td>{r.mrp}</td>
                  <td>{r.amount}</td>
                  <td>{r.disc}</td>
                  <td>{r.net}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={() => setStep(1)}>Back</button>
        </>
      )}
    </div>
  );
}
