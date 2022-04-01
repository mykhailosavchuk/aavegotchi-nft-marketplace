import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import axios from "axios";
import { Modal } from "rsuite";
import { useMoralis } from "react-moralis"
import tokenLogo from "../../Static/img/logo.png"
import { decimals, packAddress, packType } from "../../config/constances";
import { formatPrice } from "../../utils/formatHelpers";
import Loading from "../../Components/Loading";

function MyPackItemDetails() {

  const packContract  = useSelector(state => state.wallet.packContract);
  const marketContract  = useSelector(state => state.wallet.marketContract);
  const { account } = useMoralis();
  const [ changePriceModal, setChangePriceModal ] = useState(false);
  const [ pack, setPack ] = useState(null);
  const params = useParams();
  const [ price, setPrice ] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {

      if(typeof packContract !== "undefined" && packContract !== null) {
        const uri = await packContract.methods.tokenURI(params.id).call();
        const info = await marketContract.methods.viewItemByCollectionAndTokenId(packAddress, params.id).call();
        
        axios.get(uri).then(res => {
          setPack({
            ...res.data,
            id: params.id,
            price: info[1].price
          });
        })
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packContract]);
 
  const cancelOrderHandler = async () => {
    try {
      await marketContract.methods.cancelItemOrder(packAddress, packType, params.id).send({from: account});
    }catch {}
    navigate("/my-items");
  }

  const changePricelHandler = async () => {
    try {
      await marketContract.methods.modifyItemOrder(packAddress, params.id, (price*Math.pow(10, decimals)).toString()).send({from: account});
    }catch {}
    setChangePriceModal(false);
  }

  if(!pack) {
    return <Loading/>;
  }

  return (
    <div id="MyGotChis">

      <div className="content_body mt-3 p-3 p-md-5 tabItemContent">
    
        <div className="d-block tabContentLink">
          <div className="row">
            <div className="col-xl-3 col-lg-4 col-md-4 col-sm-4 col-12">
              <img style={{maxHeight: '180px'}} className="d-block mx-auto img-fluid"
                src={
                  pack.image
                }
                alt="img"
              />
            </div>

            <div className="col-xl-9 col-lg-8 col-md-8 col-sm-8 col-12">
              <div className="col_wrapper">
                <div className="col_header">
                  <div className="d-flex align-items-center justify-content-between">
                  <Link
                    to="/my-items"
                    className="back_btn"
                  >{`<< Back`}</Link>
                    <h3 className="mb-0 text-uppercase">
                      { pack.name }
                    </h3>

                    <span>
                      <img
                        className="me-2"
                        style={{
                          width: "60px",
                        }}
                        src={tokenLogo}
                        alt=""
                      />
                      { formatPrice(pack?.price) }
                    </span>
                  </div>
                </div>
                <div className="col_body" >
                  <ul className="list-unstyled">
                    <li className="font-weight-bold">
                        TOKEN ID: #{ pack?.id }
                    </li>
                    <li className="font-weight-bold">
                        Description: { pack?.description }
                    </li>
                    <li className="text-center m-4">
                      <button
                        className={"btn text-white m-2 btn_toggle"}
                        style={{ fontSize: "20px", width: "200px" }}
                        onClick={cancelOrderHandler}
                      >
                        Cancel Order
                      </button>
                      <button
                        className={"btn text-white m-2 btn_toggle"}
                        style={{ fontSize: "20px", width: "200px" }}
                        onClick={() => setChangePriceModal(true)}
                      >
                        Change Price
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      <Modal open={changePriceModal} onClose={() => setChangePriceModal(false)}  style={{marginTop: "100px"}}>
        <Modal.Body>
          <div className="container row">
            <div className="form-group row m-2">
              <label className="col-3 col-form-label" htmlFor="newPrice" style={{fontSize: "20px", fontWeight: "bold"}}>
                  New Price
              </label>
              <div className="col-9">
                <input
                  type="number"
                  id="newPrice"
                  className="form-control border_all_box"
                  placeholder="New Price"
                  defaultValue={formatPrice(pack?.price)}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
                
            </div>
          
           <button className="border_all_box btn w-100 btn-secondary"
           onClick={changePricelHandler}
            >
              Change Price
            </button>
          </div>
        </Modal.Body>
      </Modal>


    </div>
  );
}



export default MyPackItemDetails;
