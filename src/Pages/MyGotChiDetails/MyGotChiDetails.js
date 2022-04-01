import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import axios from "axios";
import { Modal } from "rsuite";
import classNames from "classnames";
import { useMoralis } from "react-moralis"

import { decimals, gotchiAddress, hostingLink, marketPlaceAddress, secondKeys } from "../../config/constances";
import Loading from "../../Components/Loading";

function MyGotChiDetails(props) {

  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const marketContract  = useSelector(state => state.wallet.marketContract);
  const { account, Moralis } = useMoralis();
  const [ sellModal, setSellModal ] = useState(false);
  const [ transferModal, setTransferModal ] = useState(false);
  const [ gotchi, setGotchi ] = useState(null);
  const params = useParams();
  const [ isApproved, setIsApproved ] = useState(false);
  const [ price, setPrice ] = useState(0);
  const [ recipient, setRecipient ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    (async () => {
      if(typeof gotchiContract !== "undefined" && gotchiContract !== null) {
        const uri = await gotchiContract.methods.tokenURI(params.id).call();
        
        axios.get(uri).then(res => {
          setGotchi(res.data);
        })
  
        const addr = await gotchiContract.methods.getApproved(params.id).call();
        if(addr === marketPlaceAddress) {
          setIsApproved(true);
        }
      }
    })()
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gotchiContract]);

  const approveHandler = async () => {
    await gotchiContract.methods.approve(marketPlaceAddress, params.id).send({from: account});
    setIsApproved(true)
  }

  const transferHanlder = async () => {
    const options = {
      type: "erc721",  
      receiver: recipient,
      contractAddress: gotchiAddress,
      tokenId: params.id
    }
    await Moralis.transfer(options);
    setTransferModal(false);
    navigate("/my-gotchis");
  }

  const sellHandler = async () => {
    await marketContract.methods.createItemOrder(gotchiAddress, params.id, (price*Math.pow(10, decimals)).toString(), gotchi.type).send({from: account});
    setSellModal(false);
    navigate("/my-gotchis");
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

                    {/* <span>
                      <img
                        className="me-2"
                        style={{
                          width: "60px",
                        }}
                        src={"./logo.png"}
                        alt=""
                      />
                      1
                    </span> */}
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
                    {
                      ! isApproved && 
                      <li className="text-center">
                        <button
                          className="btn_toggle btn text-white m-2"
                          style={{ fontSize: "20px", width: "200px" }}
                          onClick={approveHandler}
                        >
                          Approve
                        </button>
                      </li>
                    }
                    <li className="text-center">
                    <button
                      className={classNames("btn text-white m-2", { "btn_toggle": isApproved })}
                      style={{ fontSize: "20px", width: "200px" }}
                      disabled={!isApproved}
                      onClick={() => setTransferModal(true)}
                    >
                      Transfer
                    </button>
                    <button
                      className={classNames("btn text-white m-2", { "btn_toggle": isApproved })}
                      style={{ fontSize: "20px", width: "200px" }}
                      disabled={!isApproved}
                      onClick={() => setSellModal(true)}
                    >
                      Sell
                    </button>
                    </li>
                    
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
     

      <Modal open={transferModal} onClose={() => setTransferModal(false)}  style={{marginTop: "100px"}}>
        <Modal.Body>
          <div className="container row">
            
          <input
            type="text"
            className="form-control border_all_box px-4 mb-3 py-2"
            placeholder="Recipient Address"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
           <button className="border_all_box btn w-100 btn-secondary"
           onClick={transferHanlder}
            >
              Transfer
            </button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal open={sellModal} onClose={() => setSellModal(false)}  style={{marginTop: "100px"}}>
        <Modal.Body>
          <div className="container row">
            
          <div className="form-group row m-2">
              <label className="col-3 col-form-label" htmlFor="price" style={{fontSize: "20px", fontWeight: "bold"}}>
                  Price
              </label>
              <div className="col-9">
                <input
                  type="number"
                  id="price"
                  className="form-control border_all_box"
                  placeholder="Price"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
            </div>

           <button className="border_all_box btn w-100 btn-secondary"
           onClick={sellHandler}
            >
              Sell
            </button>
          </div>
        </Modal.Body>
      </Modal>


    </div>
  );
}



export default MyGotChiDetails;
