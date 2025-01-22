import React from 'react';

const ClientDetailsModal = ({client, onClose }) => {
  return (
    <div
    className="modal fade show"
    id="staticBackdrop"
    tabIndex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
    style={{
      display: "block",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    }}  
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header clinetdeatails_header">
            <h5 className="modal-title clinettitle">Client Invoice Details</h5>
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
            <div className="row">
              <div className="col-md-7 clinetdeatails">
                <p><strong>Client Name:</strong> {client.clientName}</p>
                <p><strong>Business Name:</strong> {client.businessName}</p>
                <p><strong>GST No.:</strong> {client.gstNo}</p>
                <p><strong>Contact:</strong> {client.contactNumber}</p>
                <p><strong>Email:</strong> {client.emailAddress}</p>
              </div>
              <div className="col-md-5 clinetdeatails">
                <p><strong>City:</strong> {client.city}</p>
                <p><strong>State:</strong> {client.state}</p>
                <p><strong>Pincode:</strong> {client.pincode}</p>
                <p><strong>Client Type:</strong> {client.clientType}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
