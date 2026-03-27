import { useState, useEffect } from "react";

const GSTCalculator = ({ totalAmount, onGSTChange }) => {
  const [gstPercentage, setGstPercentage] = useState(0);
  const [gstType, setGstType] = useState("include");

  const formatNumber = (num) => {
    if (!num) return "0.00";
    return parseFloat(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  let withoutGST = 0;
  let gstAmount = 0;
  let totalWithGST = 0;

  if (gstType === "exclude") {
    withoutGST = totalAmount;
    gstAmount = (totalAmount * gstPercentage) / 100;
    totalWithGST = totalAmount + gstAmount;
  } else {
    withoutGST = totalAmount / (1 + gstPercentage / 100);
    gstAmount = totalAmount - withoutGST;
    totalWithGST = totalAmount;
  }
if (gstType === "exclude" && gstPercentage === 0) {
  setGstPercentage(18); // default GST
}
  // ✅ SEND DATA TO PARENT
  useEffect(() => {
    if (onGSTChange) {
      onGSTChange({
        gstAmount: gstAmount || 0,
        totalWithGST: totalWithGST || 0,
        withoutGST: withoutGST || 0,
        gstPercentage,
        gstType,

        // ✅ IMPORTANT FIELD
        gst_exclude_percentage:
          gstType === "exclude" ? gstPercentage : 0,
      });
    }
  }, [gstAmount, totalWithGST, withoutGST, gstPercentage, gstType]);

  return (
    <div className="row p-4">
      
      {/* GST % INPUT */}
      <div className="col-md-6">
        <input
          type="number"
          placeholder="Enter GST%"
          value={gstPercentage}
          onChange={(e) =>
            setGstPercentage(parseFloat(e.target.value) || 0)
          }
          className="form-control m-0 no-print"
        />
      </div>

      {/* GST TYPE */}
      <div className="col-md-6 no-print">
        <select
          value={gstType}
          onChange={(e) => setGstType(e.target.value)}
          className="form-select m-0"
        >
          <option value="include">Include GST</option>
          <option value="exclude">Exclude GST</option>
        </select>
      </div>

      {/* RESULT */}
      <table>
        <tbody>
          <tr>
            <td><b>Amount :</b></td>
            <td className="text-end">{formatNumber(withoutGST)}</td>
          </tr>

          <tr>
            <td>
              <b>GST ({gstPercentage}%) :</b>
            </td>
            <td className="text-end">{formatNumber(gstAmount)}</td>
          </tr>

          <tr>
            <td><b>Total :</b></td>
            <td className="text-end">{formatNumber(totalWithGST)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GSTCalculator;