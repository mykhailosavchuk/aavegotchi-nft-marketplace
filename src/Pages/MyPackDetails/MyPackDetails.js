import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"
import axios from "axios";
import { Modal } from "rsuite";
import { useMoralis } from "react-moralis"
import tokenLogo from "../../Static/img/logo.png"
import { decimals, marketPlaceAddress, packAddress, packType } from "../../config/constances";
import { formatPrice } from "../../utils/formatHelpers";
import { hostingLink } from "../../config/constances";
import { setLoadingAction, setLoadingLabelAction } from "../../store/actions/GlobalActions";
import Loading from "../../Components/Loading";

function MyPackDetails() {

  const packContract  = useSelector(state => state.wallet.packContract);
  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const marketContract  = useSelector(state => state.wallet.marketContract);
  const { account, Moralis } = useMoralis();
  const [ pack, setPack ] = useState(null);
  const params = useParams();
  const [ price, setPrice ] = useState(0);
  const navigate = useNavigate();
  const [ isApproved, setIsApproved ] = useState(false);
  const [ transferModal, setTransferModal ] = useState(false);
  const [ sellModal, setSellModal ] = useState(false);
  const [ recipient, setRecipient ] = useState();
  const [ gotchis, setGotchis ] = useState([]);
  const [ isOpened, setIsOpened ] = useState(false);
  const dispatch = useDispatch();

  useEffect(async () => {

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
  }, [packContract]);
 
  const openPackHandler = async () => {
    dispatch(setLoadingLabelAction("Opening Pack"))
    dispatch(setLoadingAction(true))
    const _ids = await packContract.methods.getIdsByPack(params.id).call();
    const _uris = await gotchiContract.methods.tokenURIs(_ids).call();

    await packContract.methods.openPack(params.id).send({from: account});
    
    let _gotchis = [];
    for(let i=0 ; i<_uris.length ; i++) {
      try{
        const res = await axios.get(_uris[i]);
        let newGotchi = {...res.data, id: _ids[i]};

        _gotchis.push(newGotchi);
      }catch {}
    }

    setGotchis(_gotchis);
    setIsOpened(true);
    dispatch(setLoadingAction(false))
  }

  const approveHandler = async id => {
    await packContract.methods.approve(marketPlaceAddress, params.id).send({from: account});
    setIsApproved(true);
  }

  const transferHanlder = async () => {
    const options = {
      type: "erc721",  
      receiver: recipient,
      contractAddress: packAddress,
      tokenId: params.id
    }
    await Moralis.transfer(options);
    setTransferModal(false);
  }

  const sellHandler = async () => {
    await marketContract.methods.createItemOrder(packAddress, params.id, (price*Math.pow(10, decimals)).toString(), packType).send({from: account});
    setSellModal(false);
    navigate(`/item-list/${packType}`)
  }


  if(!pack) {
    return <Loading/>
  }

  return (
    <div id="MyGotChis">

      <div className="content_body mt-3 p-3 p-md-5 tabItemContent">
    
        <div className="d-block tabContentLink">
          <div className="row">
            
            {
              isOpened ?
              (
                <ul className="list-unstyled mb-0 tabItemList">
          {
            gotchis
            .map((v, idx) => {
              return (
                <li key={idx}>

                  <Link className="d-block tabContentLink" to={`/my-gotchi-details/${v.id}`}>
                    <div className="row">
                      <div className="col-xl-3 col-lg-4 col-md-4 col-sm-4 col-12">
                        <img style={{maxHeight: '180px'}} className="d-block mx-auto img-fluid"
                          src={
                            `${hostingLink}${v.spriteIMG}`
                          }
                          alt="img"
                        />
                      </div>

                      <div className="col-xl-9 col-lg-8 col-md-8 col-sm-8 col-12">
                        <div className="col_wrapper">
                          <div className="col_header">
                            <div className="d-flex align-items-center justify-content-between">
                              <h3 className="mb-0 text-uppercase">
                                {v.name}
                              </h3>

                              <span>
                                <img
                                  className="me-2"
                                  style={{
                                    width: "60px",
                                  }}
                                  src={"./logo.png"}
                                  alt=""
                                />
                                1
                              </span>
                            </div>
                          </div>
                          <div className="col_body" >
                            <ul className="list-unstyled">
                              <li className="font-weight-bold">
                                  Type: {v.type}
                              </li>
                              <li className="font-weight-bold">
                                  Tier: {v.tier}
                              </li>
                              <li className="font-weight-bold">
                                  ID: #{v.id}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                </li>
              );
            })}
          </ul>
              ):
              (
                <>
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
                          to="/my-gotchis"
                          className="back_btn"
                        >{`<< Back`}</Link>
                          <h3 className="mb-0">
                            { "GOTCHI HEROES PACK" }
                          </h3>
      
                         
                        </div>
                      </div>
                      <div className="col_body" >
                        <ul className="list-unstyled">
                          <li className="font-weight-bold">
                              ID: #{ pack?.id }
                          </li>
                          <li className="font-weight-bold">
                              Description: { "Each Gotchi Heroes Pack contains 5 items randomly selected from the Gotchi Heroes item pool. Each pack is guaranteed to contain at least one item that is Rare or better." }
                          </li>
      
                        </ul>
                        
                       
                        <button
                          className="btn_toggle btn text-white m-2"
                          style={{ fontSize: "20px", width: "100%" }}
                          onClick={() => openPackHandler()}
                        >
                          Open Pack
                        </button>
                        <button
                          className="btn_toggle btn text-white m-2"
                          style={{ fontSize: "20px", width: "100%" }}
                          onClick={() => approveHandler()}
                        >
                          Approve
                        </button>
                        <button
                          className="btn_toggle btn text-white m-2"
                          style={{ fontSize: "20px", width: "250px" }}
                          onClick={() => {
                            setTransferModal(true)
                          }}
                          disabled={!isApproved}
                        >
                          Transfer Pack
                        </button>
                        <button
                          className="btn_toggle btn text-white m-2"
                          style={{ fontSize: "20px", width: "250px" }}
                          onClick={() => {
                            setSellModal(true);
                          }}
                          disabled={!isApproved}
                        >
                          Sell Pack
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )
            }

           
          </div>
        </div>
        




      </div>



      <Modal open={transferModal} onClose={() => setTransferModal(false)}  style={{marginTop: "100px"}}>
        <Modal.Body>
          <div className="container row">
            
          <input
            type="text"
            className="form-control border_all_box px-4 mb-3 text-uppercase py-2"
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



export default MyPackDetails;
