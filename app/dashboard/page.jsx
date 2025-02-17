import DynamicGreeting from "../components/getGreeting";

export default function Home() {
  return (
    <>
      <div className="row welcome">
        <DynamicGreeting />
        <p className="text-sm mb-0">Let’s make today amazing! 🚀</p>
      </div>
      <div className="row mb-4">
        {/* Add Clients */}
        <div className="col-lg-2 col-md-3 col-12">
          <a href="/addclient">
            <div className="card">
              <span className="mask opacity-10 border-radius-lg"></span>
              <div className="card-body p-3 position-relative">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="icon_wrapper">
                      <img
                        src="https://freedesignfile.com/upload/2023/09/Businessman-3D-professions-icon-vector.jpg"
                        alt=""
                        className="client_img"
                      />
                    </div>
                    <h5 className="font-weight-bolder mb-0 mt-3">
                      Add Clients
                    </h5>
                    <span className="count text-sm">1600</span>
                  </div>
                </div>
              </div>
              <p className="bottom_lablel">Master Head</p>
            </div>
          </a>
        </div>

        {/* Add Invoice */}
        <div className="col-lg-2 col-md-2 col-12 mt-4 mt-md-0">
          <a href="/products">
            <div className="card">
              <span className="mask opacity-10 border-radius-lg"></span>
              <div className="card-body p-3 position-relative">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="icon_wrapper">
                      <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/product-3d-icon-download-in-png-blend-fbx-gltf-file-formats--tag-packages-box-marketing-advertisement-pack-branding-icons-4863042.png?f=webp"
                        alt=""
                        className="client_img"
                      />
                    </div>
                    <h5 className="font-weight-bolder mb-0 mt-3">Add Stocks</h5>
                    <span className="count text-sm">100</span>
                  </div>
                </div>
              </div>
              <p className="bottom_lablel">Master Head</p>
            </div>
          </a>
        </div>

        {/* Add Outinvoice */}
        <div className="col-lg-2 col-md-2 col-12">
          <a href="/addinvoice">
            {" "}
            <div className="card">
              <span className="mask opacity-10 border-radius-lg"></span>
              <div className="card-body p-3 position-relative">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="icon_wrapper">
                      <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/receipt-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--product-invoice-purchase-record-bill-business-pack-finance-illustrations-4280960.png?f=webp"
                        alt=""
                        className="client_img"
                      />
                    </div>
                    <h5 className="font-weight-bolder mb-0 mt-3">
                      Add In Vocher
                    </h5>
                    <span className="count text-sm">100</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Add Warehouse */}
        <div className="col-lg-2 col-md-2 col-12 mt-4 mt-md-0">
          <a href="/addoutinvoice">
            {" "}
            <div className="card">
              <span className="mask opacity-10 border-radius-lg"></span>
              <div className="card-body p-3 position-relative">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="icon_wrapper">
                      <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/order-list-3d-icon-download-in-png-blend-fbx-gltf-file-formats--logistic-checklist-currier-product-pack-e-commerce-shopping-icons-6159358.png"
                        alt=""
                        className="client_img"
                      />
                    </div>
                    <h5 className="font-weight-bolder mb-0 mt-3">
                      Out Voucher
                    </h5>
                    <span className="count text-sm">100</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
        {/* Add Warehouse */}
        <div className="col-lg-2 col-md-2 col-12 mt-4 mt-md-0">
          <a href="/report">
            {" "}
            <div className="card">
              <span className="mask opacity-10 border-radius-lg"></span>
              <div className="card-body p-3 position-relative">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="icon_wrapper">
                      <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/business-report-3d-icon-download-in-png-blend-fbx-gltf-file-formats--document-clipboard-data-pack-icons-9291057.png?f=webp"
                        alt=""
                        className="client_img"
                      />
                    </div>
                    <h5 className="font-weight-bolder mb-0 mt-3">
                      Make Reports
                    </h5>
                    <span className="count text-sm">100</span>
                  </div>
                </div>
              </div>
            </div>
          </a>  
        </div>
        <div className="col-lg-2 col-md-2 col-12 mt-4 mt-md-0">
          <a href="/quotation">
            {" "}
            <div className="card">
              <span className="mask opacity-10 border-radius-lg"></span>
              <div className="card-body p-3 position-relative">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="icon_wrapper">
                      <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/invoice-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--bill-transaction-payment-purchase-business-pack-illustrations-3928170.png"
                        alt=""
                        className="client_img"
                      />
                    </div>
                    <h5 className="font-weight-bolder mb-0 mt-3">
                      Add Quotation
                    </h5>
                    <span className="count text-sm">100</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      <div className="row my-4 ">
        <div className="col-lg-8 col-md-6 mb-md-0 mb-4">
          <div className="card">
            <div className="card-header pb-0">
              <div className="row">
                <div className="col-lg-6 col-7">
                  <h6>Stocks</h6>
                </div>
              </div>
            </div>
            <div className="card-body pb-2">
              <div className="table-responsive">
                <table className="table align-items-center justify-content-center mb-0  ">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Category</th>
                      <th scope="col">Rack</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fan Item */}
                    <tr>
                      <td>1</td>
                      <td>Fan</td>
                      <td>15</td>
                      <td>Electronics</td>
                      <td>A1</td>
                      <td>
                        <span className="badge bg-success">Available</span>
                      </td>
                      <div className="d-flex ">
                        <button className="btn action_icons">
                          <i className="fa fa-eye"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </tr>

                    {/* Fancy Lights Item */}
                    <tr>
                      <td>2</td>
                      <td>Fancy Lights</td>
                      <td>30</td>
                      <td>Electronics</td>
                      <td>A2</td>
                      <td>
                        <span className="badge bg-success">Available</span>
                      </td>
                      <div className="d-flex ">
                        <button className="btn action_icons">
                          <i className="fa fa-eye"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </tr>

                    {/* Geexer Item */}
                    <tr>
                      <td>3</td>
                      <td>Geexer</td>
                      <td>10</td>
                      <td>Electronics</td>
                      <td>A3</td>
                      <td>
                        <span className="badge bg-danger">Not Available</span>
                      </td>
                      <div className="d-flex ">
                        <button className="btn action_icons">
                          <i className="fa fa-eye"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </tr>

                    {/* Bolard Item */}
                    <tr>
                      <td>4</td>
                      <td>Bolard</td>
                      <td>8</td>
                      <td>Electronics</td>
                      <td>A4</td>
                      <td>
                        <span className="badge bg-success">Available</span>
                      </td>
                      <div className="d-flex ">
                        <button className="btn action_icons">
                          <i className="fa fa-eye"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button className="btn action_icons">
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card h-100">
            <div className="card-header pb-0">
              <h6>Daily Activity</h6>
              <p className="text-sm">
                <span className="font-weight-bold">By</span> Users
              </p>
            </div>
            <div className="card-body p-3">
              <div className="timeline timeline-one-side mb-4">
                <div className="timeline-block">
                  <span className="timeline-step">
                    <i className="fa fa-file-invoice text-success"></i>
                  </span>
                  <div className="timeline-content">
                  <h6 className="text-primary text-sm mb-1">Voucher</h6>

                    <h6 className="text-dark text-sm font-weight-bold mb-0">
                      $2400, Design changes
                    </h6>
                    <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                      Added by: <span className="text-dark">John Doe</span> |
                       <span className="text-dark">22 DEC 2024</span> |
                       <span className="text-dark">7:20 PM</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="timeline timeline-one-side mb-4">
                <div className="timeline-block">
                  <span className="timeline-step">
                    <i className="fa fa-box-open text-info"></i>
                  </span>
                  <div className="timeline-content">
                  <h6 className="text-primary text-sm mb-1">Stock Item</h6>
                    <h6 className="text-dark text-sm font-weight-bold mb-0">
                      Stock replenished
                    </h6>
                    <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                      Added by: <span className="text-dark">Jane Smith</span> |
                       <span className="text-dark">21 DEC 2024</span> |
                      Time: <span className="text-dark">9:34 PM</span>
                    </p>
                  </div>
                </div>
              </div>

             
              <div className="timeline timeline-one-side mb-4">
                <div className="timeline-block">
                  <span className="timeline-step">
                    <i className="fa fa-user-plus text-primary"></i>
                  </span>
                  <div className="timeline-content">
                  <h6 className="text-primary text-sm mb-1">Client</h6>
                    <h6 className="text-dark text-sm font-weight-bold mb-0">
                      New client added
                    </h6>
                    <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                      Added by: <span className="text-dark">Michael Brown</span>{" "}
                      |  <span className="text-dark">18 DEC 2024</span> |
                      Time: <span className="text-dark">4:54 AM</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
