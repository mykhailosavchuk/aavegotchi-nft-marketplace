import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import axios from "axios";
import { Modal } from "rsuite";
import { useMoralis } from "react-moralis"
import { decimals, gotchiAddress, hostingLink, secondKeys } from "../../config/constances";
import { formatPrice } from "../../utils/formatHelpers";
import Loading from "../../Components/Loading";

function MyGotChiItemDetails() {

  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const marketContract  = useSelector(state => state.wallet.marketContract);
  const { account } = useMoralis();
  const [ changePriceModal, setChangePriceModal ] = useState(false);
  const [ gotchi, setGotchi ] = useState(null);
  const params = useParams();
  const [ price, setPrice ] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {

      if(typeof gotchiContract !== "undefined" && gotchiContract !== null) {
        const uri = await gotchiContract.methods.tokenURI(params.id).call();
        const info = await marketContract.methods.viewItemByCollectionAndTokenId(gotchiAddress, params.id).call();
  
        axios.get(uri).then(res => {
          setGotchi({
            ...res.data,
            id: params.id,
            price: info[1].price
          });
        })
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gotchiContract]);

 
  const cancelOrderHandler = async () => {
    await marketContract.methods.cancelItemOrder(gotchiAddress, gotchi.type, params.id).send({from: account});
    navigate("/my-items");
  }

  const changePricelHandler = async () => {
    await marketContract.methods.modifyItemOrder(gotchiAddress, params.id, (price*Math.pow(10, decimals)).toString()).send({from: account});
    setChangePriceModal(false);
  }

  if(!gotchi) {
    return <Loading/>
  }

  return (
    <div id="MyGotChis">

      <div className="content_body mt-3 p-3 p-md-5 tabItemContent">
    
        <div className="d-block tabContentLink">
          <div className="row">
            <div className="col-xl-3 col-lg-4 col-md-4 col-sm-4 col-12">
              <img style={{maxHeight: '180px'}} className="d-block mx-auto img-fluid"
                src={
                  `${hostingLink}${gotchi?.spriteIMG}`
                }
                alt="img"
              />
            </div>

            <div className="col-xl-9 col-lg-8 col-md-8 col-sm-8 col-12">
              <div className="col_wrapper">
                <div className="col_header">
                  <div className="d-flex align-items-center justify-content-between">
                  <Link
                    to="/my-gotchis"
                    className="back_btn"
                  >{`<< Back`}</Link>
                    <h3 className="mb-0 text-uppercase">
                      { gotchi.name }
                    </h3>

                  </div>
                </div>
                <div className="col_body" >
                  <ul className="list-unstyled">
                    <li className="font-weight-bold">
                        Type: { gotchi?.type }
                    </li>
                    <li  className="font-weight-bold">
                      TOKEN ID: #<span className="text_purple ">
                        {gotchi?.id}
                      </span>{" "}
                    </li>
                    <li  className="font-weight-bold">
                      {gotchi?.type}
                    </li>
                    <li className="font-weight-bold">
                        Tier: { gotchi?.tier }
                    </li>
                    <li  className="font-weight-bold">
                      Quality: {Number.parseFloat(gotchi?.quality).toFixed(2)}%
                    </li>
                    {
                      gotchi?.perks &&
                      Object.keys(gotchi?.perks)?.map((key, idx) => (
                        <li key={idx} className={"text-capitalize font-weight-bold"}>
                          { key.split(/(?=[A-Z])/).join(" ") } : { key.toLowerCase() === "damage" ? gotchi?.perks[key] : secondKeys.includes(key.toLowerCase()) ? `${gotchi?.perks[key]} Seconds` : `${gotchi?.perks[key]*100}%` }
                      </li>
                      ))
                    }
                    <li className="text-center mt-4">
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
                  defaultValue={formatPrice(gotchi?.price)}
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



export default MyGotChiItemDetails;
