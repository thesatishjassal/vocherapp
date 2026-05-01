import { useState, useEffect } from "react";

const EditQuotationGST = ({ quotationId }) => {
  const [apiData, setApiData] = useState({
    without_gst: 0,
    gst_amount: 0,
    amount_with_gst: 0,
    amount_including_gst: 0,
    gst_percentage: 0,
  });

  useEffect(() => {
    if (!quotationId) return;

    fetch(`https://api.panvic.in/quotation/${quotationId}`)
      .then((res) => res.json())
      .then((data) => {
        let percent = 0;
        if (data.without_gst > 0 && data.gst_amount > 0) {
          percent = (data.gst_amount / data.without_gst) * 100;
        }

        setApiData({
          without_gst: data.without_gst ?? 0,
          gst_amount: data.gst_amount ?? 0,
          amount_with_gst: data.amount_with_gst ?? 0,
          amount_including_gst: data.amount_including_gst ?? 0,
          gst_percentage: Number(percent.toFixed(2)) || data.gst_percentage || 0,
        });
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [quotationId]);

  const format = (num) => {
    if (num == null || isNaN(num)) return "0.00";
    return Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalIncl = apiData.amount_including_gst || apiData.amount_with_gst || 0;

  return (
    <div className="row p-4">
      {/* Main display - also only from API */}
      <table className="table table-borderless">
        <tbody>
          <tr>
            <td className="tm_width_3 tm_primary_color tm_bold pb-0 pt-1">
              Amount (excl. GST):
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_bold">
              {format(apiData.without_gst)}
            </td>
          </tr>

          <tr>
            <td className="tm_width_3 tm_primary_color tm_bold pb-0 pt-1">
              GST Amt ({apiData.gst_percentage.toFixed(0)}%):
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_bold">
              {format(apiData.gst_amount)}
            </td>
          </tr>

          <tr>
            <td className="tm_width_3 tm_primary_color tm_bold">
              Total Amount:
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_bold">
              {format(totalIncl)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EditQuotationGST;