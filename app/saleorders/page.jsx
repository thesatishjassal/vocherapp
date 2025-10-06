import GetSalesOrders from "../components/Getallsalesorders";

const GetOutVouchers = () => {
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Home</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            saleorders
          </li>
        </ol>
      </nav>
      <GetSalesOrders />
    </>
  );
};

export default GetOutVouchers;
