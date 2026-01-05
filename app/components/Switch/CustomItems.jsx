"use client";
import React, { useEffect, useState } from "react";

export default function CustomItemsStep({ onDataChange }) {
  const [items, setItems] = useState([
    { item_name: "", qty: "", mrp: "", total_amount: 0 },
  ]);

  const recalcAndSend = (updated) => {
    const json = updated
      .map((i) => ({
        ...i,
        qty: Number(i.qty),
        mrp: Number(i.mrp),
        total_amount: Number(i.qty) * Number(i.mrp),
      }))
      .filter((i) => i.qty > 0);

    onDataChange?.(json);
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    const qty = Number(updated[index].qty || 0);
    const mrp = Number(updated[index].mrp || 0);
    updated[index].total_amount = qty * mrp;

    setItems(updated);
    recalcAndSend(updated);
  };

  const addRow = () => {
    setItems([
      ...items,
      { item_name: "", qty: "", mrp: "", total_amount: 0 },
    ]);
  };

  const removeRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    recalcAndSend(updated);
  };

  return (
    <div>
      <h4>Step 4 – Custom Items</h4>

      <div className="table-responsive">
        <table className="tm_round_border table mb-0">
          <thead>
            <tr>
              <th style={{ width: "50%" }}>Item Name</th>
              <th>Qty</th>
              <th>MRP</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    className="form-control"
                    placeholder="Cable / Tie / Tape / Roll"
                    value={row.item_name}
                    onChange={(e) =>
                      handleChange(i, "item_name", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    min="0"
                    style={{ width: 70 }}
                    value={row.qty}
                    onChange={(e) =>
                      handleChange(i, "qty", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    min="0"
                    style={{ width: 90 }}
                    value={row.mrp}
                    onChange={(e) =>
                      handleChange(i, "mrp", e.target.value)
                    }
                  />
                </td>

                <td>{row.total_amount}</td>

                <td>
                  <button onClick={() => removeRow(i)}>✖</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button style={{ marginTop: 10 }} onClick={addRow}>
        ➕ Add Item
      </button>
    </div>
  );
}
