import GetSwitchQuotationTables from "../components/GetSwitchesquotationTables";

const GetOutVouchers = () => {
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Home</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            alloquotaions
          </li>
        </ol>
      </nav>
      <GetSwitchQuotationTables />
    </>
  );
};

export default GetOutVouchers;
