import FancyLightsCatalog from "../components/FancyLightsCatalog";

const FancyLightsCatalogPage = () => {
  return (
    <>
      <div className="mini_banner Decore-Lights">
        <div className="content_box">
          <div>
            <h2 className="title">Fancy Lights </h2>
          </div>
        </div>
      </div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/dashboard">Dashboard</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Fancy Lights Catalog
          </li>
        </ol>
      </nav>
      <FancyLightsCatalog />
    </>
  );
};

export default FancyLightsCatalogPage;
