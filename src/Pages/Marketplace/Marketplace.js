import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"
import { HIGHEST_PRICE, hostingLink, LOWEST_PRICE, packAddress, packType, secondKeys } from "../../config/constances";
import { Link, useParams } from 'react-router-dom';
import axios from "axios";
import { useMoralis } from "react-moralis"
import { formatPrice, shapeAddress } from "../../utils/formatHelpers";
import { setTypeAction, setTypesAction } from "../../store/actions/GlobalActions";
import tokenLogo from "../../Static/img/logo.png"

import "./Marketplace.css";
import Loading from "../../Components/Loading";

function PortalClosed() {

  const params  = useParams();
  const dispatch = useDispatch();
  const marketContract  = useSelector(state => state.wallet.marketContract);
  const crntType = useSelector(state => state.global.type);
  const types = useSelector(state => state.global.types);
  const [ items, setItems ] = useState([]);
  const [ filteredItems, setFilteredItems ] = useState([])
  const [toggleDropdown, setToggleDropdown] = useState(false)
  const { account, chainId } = useMoralis();
  const [ sortBy, setSortBy ] = useState(LOWEST_PRICE)

  useEffect(async () => {
    if(typeof marketContract !== "undefined" && marketContract !== null) {
      try {
        const _types = await marketContract.methods.types().call();
        dispatch(setTypesAction([..._types, packType]));
        if(typeof params.type === "undefined" ||  params.type === null){
          dispatch(setTypeAction(_types[0]));
        }
        
      }catch {}
    }
  }, [marketContract, account, chainId ]);

  useEffect(() => {
    if(typeof params.type !== "undefined" &&  params.type !== null){
      dispatch(setTypeAction(params.type));
    }
  }, [params, types ])

  useEffect(async () => {

    if(typeof crntType !== "undefined" && crntType !== null) {
      try {
        let _items = [];
        if(packType === crntType) {
          const result = await marketContract.methods.viewItemsByCollection(packAddress).call();
          for(let i=0 ; i<result[0].length ; i++) {
            const res = await axios.get(result[1][i]);
            _items.push({
              id: result[0][i],
              name: res.data.name,
              description: res.data.description,
              owner: result[2][i].seller,
              price: result[2][i].price,
              image: res.data.image,
            });
          }
  
        }else {
          const result = await marketContract.methods.viewItemsByType(crntType).call();
          for(let i=0 ; i<result[0].length ; i++) {
            const res = await axios.get(result[1][i]);
            _items.push({
              id: result[0][i],
              name: res.data.name,
              tier: res.data.tier,
              sprite: res.data.sprite,
              owner: result[2][i].seller,
              price: result[2][i].price,
              image: `${hostingLink}${res.data.spriteIMG}`,
              perks: res.data.perks
            });
          }
        }
        
        setItems(_items);
      }catch {}
    }
    
  }, [crntType, types])

  useEffect(() => {
    if(items.length > 0) {
      switch (sortBy) {
        case LOWEST_PRICE:
          setFilteredItems(items.sort((frt, sec) => frt.price - sec.price))
          break;
        case HIGHEST_PRICE:
          setFilteredItems(items.sort((frt, sec) => sec.price - frt.price))
          break;
        default:
          break;
      }
    }
  }, [sortBy, items])
  
  return (
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
                  {types?.map((v, idx) => {
                    return (
                      <li key={idx}>
                        <Link
                          className={`d-flex align-items-center p-3 text-uppercase ${crntType === v && "active_link"
                            }`}
                          to={`/item-list/${v}`}
                        >
                          {v === packType ? "All Packs" : v}
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
              {types?.map((v, idx) => {
                return (
                  <li key={idx}>
                    <Link
                      className={`d-flex align-items-center p-3 text-uppercase ${crntType === v && "active_link"
                        }`}
                      to={`/item-list/${v}`}
                    >
                      {v === packType ? "All Packs" : v}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>


        <div className="w-75 content_right_side col_size_wrapper">
          <div className="content_wrapper">
            
            <div id="portalClosedContent">
              <ul
                className="list-unstyled d-flex tabItemWrapper mb-0 position-sticky flex-wrap flex-md-nowrap"
                style={{ top: "0px" }}
              >
                {/* <li className="d-none d-md-block"></li> */}
                <li className="result_list">{items?.length} RESULTS</li>

                <li className="list_dropdown dropdown">
                  <button
                    className="dropdown-toggle"
                    data-mdb-toggle="dropdown"
                  >
                    Sort: { sortBy }
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li>
                      <Link className="dropdown-item" to="#" onClick={() => setSortBy(LOWEST_PRICE)}>
                        {LOWEST_PRICE}
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#" onClick={() => setSortBy(HIGHEST_PRICE)}>
                        {HIGHEST_PRICE}
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>

              <div className="tabItemContent">
                {items.length === 0 ? (
                  <ul className="list-unstyled mb-0 tabItemList">
                    <Loading/>
                  </ul>
                ) : 
                crntType === packType ?
                (
                  <ul className="list-unstyled mb-0 tabItemList">
                    {items?.map((v) => {
                      return (
                        <li key={v.id}>

                          <Link className="d-block tabContentLink" 
                          to={`/item-details/${crntType}/${v.id}`}>
                            <div className="row">
                              <div className="col-xl-5 col-lg-5 col-md-12 col-sm-12 col-12">
                                <img style={{maxHeight: '180px'}} className="d-block mx-auto img-fluid"
                                  src={
                                    v.image
                                  }
                                  alt="img"
                                />
                              </div>

                              <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12 col-12">
                                <div className="col_wrapper">
                                  <div className="col_header">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <h3 className="mb-0">
                                      GOTCHI HEROES PACK
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
                                        { formatPrice(v.price) }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col_body">
                                    <ul className="list-unstyled">
                                      <li>
                                        Description: {"Each Gotchi Heroes Pack contains 5 items randomly selected from the Gotchi Heroes item pool. Each pack is guaranteed to contain at least one item that is Rare or better."}
                                      </li>
                                      <li>
                                        Owner: {" "}
                                        <span className="text_purple">
                                        {shapeAddress(v.owner)}
                                        </span>
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
                ) :
                (
                  <ul className="list-unstyled mb-0 tabItemList">
                    {filteredItems?.map((v) => {
                      return (
                        <li key={v.id}>

                          <Link className="d-block tabContentLink" 
                          to={`/item-details/${crntType}/${v.id}`}>
                            <div className="row">
                              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-4 col-12">
                                <img style={{maxHeight: '180px'}} className="d-block mx-auto img-fluid"
                                  src={
                                    v.image
                                  }
                                  alt="img"
                                />
                              </div>

                              <div className="col-xl-9 col-lg-8 col-md-8 col-sm-8 col-12">
                                <div className="col_wrapper">
                                  <div className="col_header">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <h3 className="mb-0">
                                        {v.name}
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
                                        { formatPrice(v.price) }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col_body">
                                    <ul className="list-unstyled">
                                      <li className="font-weight-bold">
                                        Tier: {v.tier}
                                      </li>
                                     
                                      <li className="font-weight-bold">
                                        Owner: {" "}
                                        <span className="text_purple">
                                          {shapeAddress(v.owner)}
                                        </span>
                                      </li>
                                      {
                                        v?.perks &&
                                        Object.keys(v?.perks)?.map((key, idx) => (
                                          <li key={idx} className={"text-capitalize font-weight-bold"}>
                                            { key.split(/(?=[A-Z])/).join(" ") } : { key.toLowerCase() === "damage" ? v?.perks[key] : secondKeys.includes(key.toLowerCase()) ? `${v?.perks[key]} Seconds` : `${v?.perks[key]*100}%` }
                                        </li>
                                        ))
                                      }
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
                )
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PortalClosed;


