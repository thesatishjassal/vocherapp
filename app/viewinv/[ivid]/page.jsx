import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/invouchers";

const InvoucherDetail = () => {
  const router = useRouter();
  const { ivid } = router.query;
  const [voucher, setVoucher] = useState(null);

  useEffect(() => {
    if (!ivid) return;
    
    const fetchVoucher = async () => {
      try {
        const response = await axios.get(`${API_URL}/${ivid}`, {
          withCredentials: true,
        });
        setVoucher(response.data);
      } catch (error) {
        toast.error("Failed to load voucher details!");
      }
    };

    fetchVoucher();
  }, [id]);

  if (!voucher) {
    return <p>Loading...</p>;
  }

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Invoucher Details</h6>
      </div>
      <div className="card-body">
        <p><strong>ID:</strong> {voucher.voucher_id}</p>
        <p><strong>Voucher Number:</strong> {voucher.voucher_number}</p>
        <p><strong>Transaction Type:</strong> {voucher.transaction_type}</p>
        <p><strong>Voucher Date:</strong> {voucher.voucher_date}</p>
        <p><strong>Client ID:</strong> {voucher.client_id}</p>
        <p><strong>Invoice Number:</strong> {voucher.invoice_number}</p>
        <p><strong>Invoice Date:</strong> {voucher.invoice_date}</p>
        <p><strong>Mode of Transport:</strong> {voucher.mode_of_transport}</p>
        <p><strong>Number of Packages:</strong> {voucher.number_of_packages}</p>
        <p><strong>Freight Status:</strong> {voucher.freight_status}</p>
        <p><strong>Total Amount:</strong> {voucher.total_amount}</p>
        <p><strong>Remarks:</strong> {voucher.remarks}</p>
      </div>
    </div>
  );
};

export default InvoucherDetail;

export async function getServerSideProps(context) {
  return {
    props: {},
  };
}
