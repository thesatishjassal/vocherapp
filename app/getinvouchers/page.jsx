import GetInvoucherTable from "../components/GetInvoucherTable";

const GetInVouchers = () => {
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Home</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            allinvocuhers
          </li>
        </ol>
      </nav>
      <GetInvoucherTable />
    </>
  );
};

export default GetInVouchers;
