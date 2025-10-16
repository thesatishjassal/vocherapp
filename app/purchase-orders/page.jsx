import GetPurchaseOrderTable from "../components/GetallPurchaseOrders";

const GetPurchaseOrders = () => {
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Home</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Purchase Orders
          </li>
        </ol>
      </nav>
      <GetPurchaseOrderTable />
    </>
  );
};

export default GetPurchaseOrders;
