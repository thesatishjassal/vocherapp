import AddClientForm from "../components/AddClientForm ";

const AddNewClient = () => {
  return (
    <>
      <div className="mini_banner clientsbg">
        <div className="content_box">
          <div>
            <h2 className="title">Our Clients </h2>
            <p className="description">Add/Edit Your Clients</p>
          </div>
        </div>
      </div>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <a href="/">Home</a>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            addclient
          </li>
        </ol>
      </nav>

      <AddClientForm />
    </>
  );
};

export default AddNewClient;
