"use client";
import React, { useState } from "react";

export default function CustomItemsStep({ onDataChange }) {
  const [items, setItems] = useState([
    { item_name: "", qty: "", mrp: "", discount: "", net_price: 0, total_amount: 0 },
  ]);

  const recalcAndSend = (updated) => {
    const json = updated
      .map((i) => {
        const qty = Number(i.qty || 0);
        const mrp = Number(i.mrp || 0);
        const discount = Number(i.discount || 0);

        const net_price = mrp - (mrp * discount) / 100;
        const total_amount = net_price * qty;

        return {
          ...i,
          qty,
          mrp,
          discount,
          net_price,
          total_amount,
        };
      })
      .filter((i) => i.qty > 0);

    onDataChange?.(json);
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    const qty = Number(updated[index].qty || 0);
    const mrp = Number(updated[index].mrp || 0);
    const discount = Number(updated[index].discount || 0);

    const net_price = mrp - (mrp * discount) / 100;
    const total_amount = net_price * qty;

    updated[index].net_price = net_price;
    updated[index].total_amount = total_amount;

    setItems(updated);
    recalcAndSend(updated);
  };

  const addRow = () => {
    setItems([
      ...items,
      { item_name: "", qty: "", mrp: "", discount: "", net_price: 0, total_amount: 0 },
    ]);
  };

  const removeRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    recalcAndSend(updated);
  };

  return (
    <div>
      <h4>Step 2 – Custom Items</h4>

      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>MRP</th>
            <th>Net Price</th>
            <th>Disc %</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((row, i) => (
            <tr key={i}>
              <td>
                <input
                  value={row.item_name}
                  onChange={(e) => handleChange(i, "item_name", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) => handleChange(i, "qty", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={row.mrp}
                  onChange={(e) => handleChange(i, "mrp", e.target.value)}
                />
              </td>

              <td>{row.net_price.toFixed(2)}</td>

              <td>
                <input
                  type="number"
                  value={row.discount}
                  onChange={(e) => handleChange(i, "discount", e.target.value)}
                />
              </td>

              <td>{row.total_amount.toFixed(2)}</td>

              <td>
                <button onClick={() => removeRow(i)}>✖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow}>➕ Add</button>
    </div>
  );
}