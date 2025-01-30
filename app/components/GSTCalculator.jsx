import { useState } from "react";

const GSTCalculator = ({ totalAmount }) => {
  const [gstPercentage, setGstPercentage] = useState(0);
  const [gstType, setGstType] = useState("include"); // 'include' or 'exclude'

  const gstAmount = (totalAmount * gstPercentage) / 100;
  const totalWithGST =
    gstType === "include" ? totalAmount + gstAmount : totalAmount;

  return (
    <div className="row p-4">
        <div className="col-md-6">  <input
        type="number"
        placeholder="Enter GST%"
        value={gstPercentage}
        onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
        className="form-control tm_input tm_border tm_width_2 m-0"
      /></div>
        <div className="col-md-6">
            <select
        value={gstType}
        onChange={(e) => setGstType(e.target.value)}
        className="form-select tm_input tm_border tm_width_2 m-0"
      >
        <option value="" disabled>Select GST type?</option>
        <option value="include">Include GST</option>
        <option value="exclude">Exclude GST</option>
      </select>
      </div>
      <table>
        <tbody>
          <tr>
            <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
              <p className="m-0">Amount Without GST:</p>
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
              {totalAmount.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
              <p className="m-0">GST Amount( <b>{gstPercentage}%</b> ): </p>
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
              {gstAmount.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="tm_width_2 tm_primary_color tm_border_none tm_bold">
              <p className="m-0">Total Amount <b>{gstType === "include" ? "with" : "excluding"} GST</b>: </p> 
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
