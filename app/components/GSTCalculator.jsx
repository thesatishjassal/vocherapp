import { useState, useEffect, useRef } from "react";

const GSTCalculator = ({
  totalAmount = 0,
  onGSTChange,
  initialData = null,
}) => {
  // ✅ DEFAULT VALUES
  const [gstPercentage, setGstPercentage] = useState(18);
  const [gstType, setGstType] = useState("include");

  const [enableDiscount, setEnableDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);

  // ✅ PREVENT API OVERRIDE AFTER FIRST LOAD
  const hasLoaded = useRef(false);

  // ✅ LOAD API DATA (EDIT MODE SAFE)
  useEffect(() => {
    if (initialData && !hasLoaded.current) {
      setGstPercentage(initialData.gst_percentage ?? 18);
      setGstType(initialData.gst_type ?? "include");

      const discountPercent = initialData.additional_discount_percentage ?? 0;

      setEnableDiscount(discountPercent > 0);
      setDiscountValue(discountPercent);

      hasLoaded.current = true;
    }
  }, [initialData]);

  const formatNumber = (num) => {
    return parseFloat(num || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ CALCULATION LOGIC
  const calculateGST = () => {
    let withoutGST = 0;
    let gstAmount = 0;
    let totalWithGSTBeforeDiscount = 0;

    // 👉 STEP 1: GST CALCULATION
    if (gstPercentage > 0) {
      if (gstType === "exclude") {
        // GST added on top
        withoutGST = totalAmount;
        gstAmount = (totalAmount * gstPercentage) / 100;
        totalWithGSTBeforeDiscount = totalAmount + gstAmount;
      } else {
        // ✅ INCLUDE GST (NO SPLIT)
        totalWithGSTBeforeDiscount = totalAmount;
        withoutGST = totalAmount;
        gstAmount = 0;
      }
    } else {
      withoutGST = totalAmount;
      gstAmount = 0;
      totalWithGSTBeforeDiscount = totalAmount;
    }

    // 👉 STEP 2: DISCOUNT (ONLY AFTER GST)
    const discountAmount = enableDiscount
      ? (totalWithGSTBeforeDiscount * discountValue) / 100
      : 0;

    const finalTotal = totalWithGSTBeforeDiscount - discountAmount;

    return {
      withoutGST,
      gstAmount,
      amountAfterGST: totalWithGSTBeforeDiscount,
      discountAmount,
      finalTotal,
    };
  };

  const { withoutGST, gstAmount, amountAfterGST, discountAmount, finalTotal } =
    calculateGST();

  // ✅ SEND CLEAN DATA TO PARENT
  useEffect(() => {
    if (onGSTChange) {
      onGSTChange({
        gstAmount: Number(gstAmount || 0),
        totalWithGST: Number(finalTotal || 0),
        withoutGST: Number(withoutGST || 0),

        // backend fields
        gst_percentage: Number(gstPercentage || 0),
        gst_type: gstType,
        final_amount: Number(finalTotal || 0),

        additional_discount_percentage: enableDiscount
          ? Number(discountValue || 0)
          : 0,

        additional_discount_amount: Number(discountAmount || 0),
        amount_after_discount: Number(finalTotal || 0),
      });
    }
  }, [
    gstAmount,
    finalTotal,
    withoutGST,
    gstPercentage,
    gstType,
    discountAmount,
    discountValue,
    enableDiscount,
    onGSTChange,
  ]);

  return (
    <div className="row m-3 p-4 border">
      {/* GST INPUT */}
      <div className="col-md-4 mb-2">
        <label className="form-label">GST %</label>
        <input
          type="number"
          value={gstPercentage}
          onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
          className="form-control"
        />
      </div>

      {/* GST TYPE */}
      <div className="col-md-4 mb-2">
        <label className="form-label">GST Type</label>
        <select
          value={gstType}
          onChange={(e) => setGstType(e.target.value)}
          className="form-select"
        >
          <option value="include">Include GST (price includes tax)</option>
          <option value="exclude">Exclude GST (tax added on top)</option>
        </select>
      </div>

      {/* DISCOUNT SWITCH */}
      <div className="col-md-4 d-flex align-items-end mb-2">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={enableDiscount}
            onChange={() => setEnableDiscount(!enableDiscount)}
          />
          <label className="form-check-label ms-2">Additional Discount</label>
        </div>
      </div>

      {/* DISCOUNT INPUT */}
      {enableDiscount && (
        <div className="col-md-4 mb-3">
          <label className="form-label">Discount %</label>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
            className="form-control"
          />
        </div>
      )}

      {/* RESULT */}
      <table className="table mt-3">
        <tbody>
          <tr>
            <td>
              <b>Base Amount :</b>
            </td>
            <td className="text-end">{formatNumber(totalAmount)}</td>
          </tr>

          <tr>
            <td>
              <b>Amount After GST :</b>
            </td>
            <td className="text-end">{formatNumber(amountAfterGST)}</td>
          </tr>

          {enableDiscount && (
            <tr className="text-danger">
              <td>
                <b>Discount ({discountValue}%) :</b>
              </td>
              <td className="text-end">- {formatNumber(discountAmount)}</td>
            </tr>
          )}

          <tr className="table-success">
            <td>
              <b>Final Total :</b>
            </td>
            <td className="text-end">
              <b>{formatNumber(finalTotal)}</b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GSTCalculator;
