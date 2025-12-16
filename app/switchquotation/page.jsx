import GetAllSwitchesquotations from "../components/GetAllSwitchesquotations";

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
      <GetAllSwitchesquotations />
    </>
  );
};

export default GetOutVouchers;
