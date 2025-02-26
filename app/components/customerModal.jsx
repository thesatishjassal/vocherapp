import { useEffect, useState } from "react";
import Select from "react-select"; // Import React Select
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CustomerModal = ({ client, onClose, onConfirm }) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/clients/`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched clients:", data);
        setClients(data);
      })
      .catch((error) => console.error("Error fetching clients:", error));
  }, []);

  const handleClientSelect = (selectedOption) => {
    const clientData = clients.find((c) => c.id === selectedOption.value);
    setSelectedClient(clientData);
  };

  const handleConfirm = () => {
    if (selectedClient) {
      console.log(selectedClient)
      onConfirm(selectedClient); // Pass selected client to parent
      onClose(); // Close the modal
    } else {
      alert("Please select a client first!");
    }
  };

  // Transform data for react-select options
  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.buisnessname} - ${client.City} - ${client.State} - ${client.GST_Number}`,
  }));

  return (
    <div
      className={`modal fade show ${client ? "show" : ""}`}
      id="staticBackdrop"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header clinetdeatails_header">
            <h5 className="modal-title clinettitle">Select a Customer</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {clients.length === 0 ? (
              <p>Loading clients...</p>
            ) : (
              <Select
                options={clientOptions}
                onChange={handleClientSelect}
                placeholder="Search and select a client..."
                isSearchable
              />
            )}

            {selectedClient && (
              <div className="row mt-3">
                <div className="col-md-7 clinetdeatails">
                  <p>
                    <strong>Client Name:</strong> {selectedClient.client_name}
                  </p>
                  <p>
                    <strong>Business Name:</strong> {selectedClient.buisnessname}
                  </p>
                  <p>
                    <strong>GST No.:</strong> {selectedClient.gst_number}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedClient.client_phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedClient.client_email}
                  </p>
                </div>
                <div className="col-md-5 clinetdeatails">
                  <p>
                    <strong>City:</strong> {selectedClient.city}
                  </p>
                  <p>
                    <strong>State:</strong> {selectedClient.state}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {selectedClient.pincode}
                  </p>
                  <p>
                    <strong>Client Type:</strong> {selectedClient.client_type}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div className="col-12 text-end">
              <button type="button" className="btn btn-success" onClick={handleConfirm}>
                Confirm & Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
