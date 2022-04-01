import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"
import { gotchiAddress, hostingLink, marketPlaceAddress, packAddress, packType, secondKeys } from "../../config/constances";
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import { setTypeAction, setTypesAction } from "../../store/actions/GlobalActions";
import { formatPrice, shapeAddress } from "../../utils/formatHelpers";
import { useMoralis } from "react-moralis"
import tokenLogo from "../../Static/img/logo.png"
import { toastAction } from "../../store/actions/ToastActions";

import "../Marketplace/Marketplace.css";
import "./ItemDetails.css";

function PortalItems(props) {
  const [toggleDropdown, setToggleDropdown] = useState(false)
  const marketContract  = useSelector(state => state.wallet.marketContract);
  const packContract  = useSelector(state => state.wallet.packContract);
  const tokenContract  = useSelector(state => state.wallet.tokenContract);
  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const crntType = useSelector(state => state.global.type);
  const types = useSelector(state => state.global.types);
  const dispatch = useDispatch();
  const [ item, setItem ] = useState();
  const params = useParams();
  const [ isApproved, setIsApproved  ] = useState(false);
  const { account } = useMoralis();
  const navigate = useNavigate();
  const [ approvedAmount, setApprovedAmount ] = useState(0);

  useEffect(() => {
    (async () => {
      if(typeof tokenContract !== "undefined" && tokenContract !== null) {
        const amount = await tokenContract.methods.allowance(account, marketPlaceAddress).call();
  
        setApprovedAmount(amount);
  
        if(Number.parseInt(amount) > item?.price) {
          setIsApproved(true)
        }
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenContract, item])

  
  useEffect(() => {
    (async () => {
      if(typeof marketContract !== "undefined" && marketContract !== null) {
        if(types.length === 0) {
          const _types = await marketContract.methods.types().call();
          dispatch(setTypesAction([..._types, packType]));
          dispatch(setTypeAction(_types[0]));
        }
        if(typeof params.type !== "undefined" &&  params.type !== null){
          dispatch(setTypeAction(params.type));
        }
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketContract, params]);


  useEffect(() => {

    (async () => {
      if(typeof crntType !== "undefined" && crntType !== null) {
        if(packType === crntType) {
          const info = await marketContract.methods.viewItemByCollectionAndTokenId(packAddress, params.id).call();
          const uri = await packContract.methods.tokenURI(params.id).call();
          const res = await axios.get(uri);
          setItem({
            id: params.id,
            price: info[1].price,
            name: res.data.name,
            description: res.data.description,
            owner: info[1].seller,
            image: res.data.image
          })
  
        }else {
          const info = await marketContract.methods.viewItemByCollectionAndTokenId(gotchiAddress, params.id).call();
          const uri = await gotchiContract.methods.tokenURI(params.id).call();
          const res = await axios.get(uri);
          setItem({
            ...res.data,
            image: `${hostingLink}${res.data.spriteIMG}`,
            id: params.id,
            price: info[1].price,
            owner: info[1].seller
          })
        }
      }
    })()
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crntType])

  

  const approveHandler = async () => {
    const balance = await tokenContract.methods.balanceOf(account).call();
    await tokenContract.methods.approve(marketPlaceAddress, balance).send({from: account});
    setIsApproved(true)
  }

  const buyHandler = async () => {
      console.log(item.owner, account);
        if(item.owner.toLowerCase() === account.toLowerCase()) {
        dispatch(toastAction("error", "This is your item."));
        return;
      }

    if(approvedAmount < item.price) {
      dispatch(toastAction("error", "Insufficient funds."));
      return;
    }
    if(crntType === packType) {
      await marketContract.methods.buyToken(packAddress, params.id, item.price, packType).send({from: account});
      navigate("/my-packs");
    }else {
      await marketContract.methods.buyToken(gotchiAddress, params.id, item.price, crntType).send({from: account});
      navigate("/my-gotchis");
    }
    
  }

  return (
    <div id="PortalItems">
      <div id="PortalClosed">
        <div className="row g-0 mt-5">
           
        <div className="w-25 col_size_wrapper">

          {/* for mobile aside */}
          <aside className="d-md-none position-sticky mobile_aside mb-4" style={{ top: "0px" }}>
            <div className={`aside_title dropdown ${toggleDropdown && 'active_title'}`}
            >
              <div onClick={() => setToggleDropdown(!toggleDropdown)} className="dropdown-toggle d-flex justify-content-evenly w-100" data-mdb-toggle="dropdown">
                <span>
                  Category:
                </span>
                <span>
                 { crntType }
                </span>
              </div>
              <div className="dropdown-menu w-100">
                <ul className="list-unstyled aside_link_list">
                  {types.map((v, idx) => {
                    return (
                      <li key={idx}>
                        <Link
                          className={`d-flex align-items-center p-3 ${crntType === v && "active_link"
                            }`}
                          to={`/item-list/${v}`}
                        >
                          {v}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>
          {/* for desktop aside */}
          <aside className="d-none d-md-block p-3 position-sticky" style={{ top: "0px" }}>
            <h3 className="box_title text-center">Collections</h3>
            <ul className="list-unstyled aside_link_list">
              {types.map((v, idx) => {
                return (
                  <li key={idx}>
                    <Link
                      className={`d-flex align-items-center p-3 ${crntType === v && "active_link"
                        }`}
                      to={`/item-list/${v}`}
                    >
                      {v}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>

          <div className="w-75 content_right_side col_size_wrapper">
            <div className="content_wrapper">
              <div className="col_header">
                <div className="d-flex flex-wrap py-3 align-items-center justify-content-between">
                  <Link to={`/item-list/${params.type}`}
                    className="back_btn"
                  >{`<< Back`}</Link>
                  <h3 className="mb-0">{item?.name }</h3>

                  <span>
                    <img
                      className="me-2"
                      style={{
                        width: "60px",
                      }}
                      src={tokenLogo}
                      alt=""
                    />
                    {formatPrice(item?.price) }
                  </span>
                </div>
              </div>
              {
                crntType === packType ?
                <div className="col_body">
                  <div className="row">
                    <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="left_side_img_box">
                        <img
                          src={
                            item?.image
                          }
                          alt="img"
                        />
                      </div>
                      <button 
                        disabled={isApproved} 
                        className={"btn text-white m-2 btn_toggle"}
                        style={{ fontSize: "20px", width: "200px" }}
                          // className="nes-btn"
                        onClick={approveHandler}
                      >
                        Approve
                      </button>
                      <button 
                        disabled={!isApproved} 
                          className={"btn text-white m-2 btn_toggle"}
                          style={{ fontSize: "20px", width: "200px" }}
                          onClick={buyHandler}
                          >
                          Buy
                      </button>
                      {/* <button disabled={true} className="nes-btn">
                        Connect Wallet to Purchase
                      </button> */}
                    </div>

                    <div className="col user_details_col p-3 p-md-4 px-md-5">
                      <ul className="list-unstyled">
                        <li>
                          <h2>
                            Owner:{" "}
                            <span className="text_purple">
                              {
                                shapeAddress(item?.owner)
                              }
                            </span>{" "}
                          </h2>
                        </li>
                        <li>
                          TOKEN ID: #<span className="text_purple">
                            {item?.id}
                          </span>{" "}
                        </li>
                        <li>
                          {item?.description}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                :
                <div className="col_body">
                  <div className="row">
                    <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="left_side_img_box container">
                        <img
                          src={
                            item?.image
                          }
                          alt="img"
                        />
                      </div>
                      <button 
                        disabled={isApproved} 
                        className={"btn text-white m-2 btn_toggle"}
                        style={{ fontSize: "20px", width: "200px" }}
                        // className="nes-btn"
                        onClick={approveHandler}
                      >
                        Approve
                      </button>
                      <button 
                      disabled={!isApproved} 
                        className={"btn text-white m-2 btn_toggle"}
                        style={{ fontSize: "20px", width: "200px" }}
                        onClick={buyHandler}
                        >
                        Buy
                      </button>
                    </div>

                    <div className="col user_details_col p-3 p-md-4 px-md-5">
                      <ul className="list-unstyled">
                        <li>
                          <h2>
                            Owner:{" "}
                            <span className="text_purple">
                              {
                                shapeAddress(item?.owner)
                              }
                            </span>{" "}
                          </h2>
                        </li>
                        <li  className="font-weight-bold">
                          TOKEN ID: #<span className="text_purple ">
                            {item?.id}
                          </span>{" "}
                        </li>
                        <li  className="font-weight-bold">
                          {item?.type}
                        </li>
                        <li className="font-weight-bold">
                            Tier: { item?.tier }
                        </li>
                        <li  className="font-weight-bold">
                            Quality: { Number.parseFloat(item?.quality).toFixed(2) }%
                        </li>
                        {
                          item?.perks &&
                          Object.keys(item?.perks)?.map((key, idx) => (
                            <li key={idx} className={"text-capitalize font-weight-bold"}>
                              { key.split(/(?=[A-Z])/).join(" ") } : { key.toLowerCase() === "damage" ? item?.perks[key] : secondKeys.includes(key.toLowerCase()) ? `${item?.perks[key]} Seconds` : `${item?.perks[key]*100}%` }
                          </li>
                          ))
                        }
                        
                      </ul>
                    </div>
                  </div>
                </div>
              }
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortalItems;
