import GetquotationTables from "../components/GetquotationTables";
import GetOutvoucherTable from "../components/GetquotationTables";

const GetOutVouchers = () => {
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Home</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            alloutvocuhers
          </li>
        </ol>
      </nav>
      <GetquotationTables />
    </>
  );
};

export default GetOutVouchers;
