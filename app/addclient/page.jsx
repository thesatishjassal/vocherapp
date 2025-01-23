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
      <AddClientForm />
    </>
  );
};

export default AddNewClient;
