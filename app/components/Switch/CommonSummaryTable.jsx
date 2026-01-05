function CommonSummaryTable({ rows }) {
  let sr = 1;

  return (
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
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{sr++}</td>
            <td>{r.item_code || "-"}</td>
            <td>{r.description}</td>
            <td>{r.variant}</td>
            <td>{r.qty}</td>
            <td>{r.mrp}</td>
            <td>{r.amount}</td>
            <td>{r.discount_percent}</td>
            <td>{r.net_amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
