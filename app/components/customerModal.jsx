const CustomerModal = ({ client, onClose }) => {
  console.log(client, onClose);
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
            <select
              id="clientSelect"
              className="form-select sm mb-4"
              name="clientSelect"
            >
              <option value="" disabled>
                Select a Cleint?
              </option>
              <option value="ABC Electronics Shop">
                ABC Eclectronics Shop - New York - NY - NY12345GST
              </option>
              <option value="XYZ Electronics">XYZ Electronics</option>
              <option value="LMN Electricals">LMN Electricals</option>
              <option value="PQR Electronics">PQR Electronics - WTC</option>
              <option value="DEF Appliances">DEF Appliances</option>
            </select>
            <div className="row">
              <div className="col-md-7 clinetdeatails">
                <p>
                  <strong>Client Name:</strong>{" "}
                </p>
                <p>
                  <strong>Business Name:</strong>{" "}
                </p>
                <p>
                  <strong>GST No.:</strong>{" "}
                </p>
                <p>
                  <strong>Contact:</strong>{" "}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                </p>
              </div>
              <div className="col-md-5 clinetdeatails">
                <p>
                  <strong>City:</strong>{" "}
                </p>
                <p>
                  <strong>State:</strong>{" "}
                </p>
                <p>
                  <strong>Pincode:</strong>
                </p>
                <p>
                  <strong>Client Type:</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="col-12 text-end">
              <button type="button" className="btn btn-success">
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
