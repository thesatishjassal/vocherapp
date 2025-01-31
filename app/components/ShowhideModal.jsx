import ShowHideFilter from "./ShowHideFilter";

const SHowHideModalFilter = ({ columns, onChange }) => {

    const handleColumnVisibilityChange = (updatedColumns) => {
        setColumns(updatedColumns);
      };
      
    return ( <div
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
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header clinetdeatails_header">
                <h5 className="modal-title clinettitle">Show/Hide Columns
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                //   onClick={onClose}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
              <ShowHideFilter columns={columns} onChange={handleColumnVisibilityChange} />
              </div>
            </div>
          </div>
        </div> );
}
 
export default SHowHideModalFilter;