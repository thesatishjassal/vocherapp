import SwitchesCatalog from "../components/SwitchesCatalog";

const catalogues = () => {
  return (
    <>
      <div className="mini_banner switchescbg">
        <div className="content_box">
          <div>
            <h2 className="title"> Download catalogue  </h2>
          </div>
        </div>
      </div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/dashboard">Dashboard</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
           catalogue
          </li>
        </ol>
      </nav>
      <SwitchesCatalog />
    </>
  );xz
};

export default catalogues;
