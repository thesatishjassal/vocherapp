import { useState, useEffect } from "react";

const GSTCalculator = ({ totalAmount, onGSTChange }) => {
  const [gstPercentage, setGstPercentage] = useState(0);
  const [gstType, setGstType] = useState("include"); // 'include' or 'exclude'

  const gstAmount = (totalAmount * gstPercentage) / 100;
  const totalWithGST =
    gstType === "exclude" ? totalAmount + gstAmount : totalAmount;
  const withoutGST = gstType === "exclude" ? totalAmount : totalAmount / (1 + gstPercentage / 100);


  // Pass calculated values to parent whenever they change
useEffect(() => {
  if (onGSTChange) {
    onGSTChange({
      gstAmount: gstAmount || 0,
      totalWithGST: totalWithGST || 0,
      withoutGST: withoutGST || 0,
      gstPercentage,
      gstType,
    });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [gstAmount, totalWithGST, withoutGST, gstPercentage, gstType]);

  return (
    <div className="row p-4">
      {gstType === "exclude" && (
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
      )}

      <div className="col-md-6 no-print">
        <select
          value={gstType}
          onChange={(e) => setGstType(e.target.value)}
          className="form-select m-0"
        >
          <option value="" disabled>
            Select GST type?
          </option>
          <option value="include">Include GST</option>
          <option value="exclude">Exclude GST</option>
        </select>
      </div>

      <table>
        <tbody>
          {gstType === "exclude" && (
            <>
              <tr>
                <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                  <p className="m-0">Without GST:</p>
                </td>
                <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                  {totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                  <p className="m-0">
                    GST Amt (<b>{gstPercentage}%</b>):
                  </p>
                </td>
                <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                  {gstAmount.toFixed(2)}
                </td>
              </tr>
            </>
          )}

          <tr>
            <td className="tm_width_2 tm_primary_color tm_border_none tm_bold">
              <p className="m-0">
                Total Amount <b>{gstType === "exclude" ? "with" : "including"} GST</b>:
              </p>
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
              {totalWithGST.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GSTCalculator;