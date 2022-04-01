import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"
import { useMoralis } from "react-moralis"
import axios from "axios";
import { Loader } from 'rsuite';
import { Placeholder } from 'rsuite';

import { gotchiAddress, hostingLink, packAddress, secondKeys } from "../../config/constances";
import { formatPrice } from "../../utils/formatHelpers";
import "./MyItems.css";

function MyItems() {
  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const marketContract  = useSelector(state => state.wallet.marketContract);
  const { account, chainId } = useMoralis();
  const [ selectedCategory, setSelectedCategory ] = useState(0);
  const [ crntType, setCrntType ] = useState();
  const { Paragraph } = Placeholder;

  const [ gotchis, setGotchis ] = useState([]);
  const [ packs, setPacks ] = useState([]);
  const [ types, setTypes ] = useState([]);
  const [ filteredGotchis, setFilteredGotchis ] = useState([]);
  const [ assetsState, setAssetsState  ] = useState(0);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gotchiContract, chainId, account]);

  const loadData = async () => {
    if(typeof gotchiContract !== "undefined" && gotchiContract !== null) {
      try {
        let result = await marketContract.methods.viewItemsByCollectionAndSeller(gotchiAddress, account).call();
        let _gotchis = [];
        for(let i=0 ; i<result[0].length ; i++) {
          const res = await axios.get(result[1][i]);
          
          _gotchis.push({
            id: result[0][i],
            name: res.data.name,
            type: res.data.type,
            tier: res.data.tier,
            sprite: res.data.sprite,
            price: result[2][i].price,
            image: `${hostingLink}${res.data.spriteIMG}`,
            perks: res.data.perks
          });
        }

        _gotchis.length === 0 ? setAssetsState(2) : setAssetsState(1);

        let _types = _gotchis.map(g => g.type).filter((t, idx, self) => self.indexOf(t) === idx);
        setTypes(_types);
        setGotchis(_gotchis)
        setCrntType(_types[0]);

        result = await marketContract.methods.viewItemsByCollectionAndSeller(packAddress, account).call();
        let _packs = [];
        for(let i=0 ; i<result[0].length ; i++) {
          const res = await axios.get(result[1][i]);
          
          _packs.push({
            id: result[0][i],
            name: res.data.name,
            description: res.data.description,
            owner: result[2][i].seller,
            price: result[2][i].price,
            image: res.data.image
          });
        }
        setPacks(_packs)
      }catch {
      setAssetsState(2)
      }
    }else {
      setAssetsState(2)
    }
  }

  useEffect(() => {
    let result = gotchis.filter(g => crntType === "ALL" ? true : g.type === crntType)
    setFilteredGotchis(result);
  }, [ crntType, gotchis ])

  const AssetsComponent = () => {
    switch (assetsState) {
      case 0:
          return (
            <Paragraph style={{ marginTop: 30 }} graph="image" rows={3}>
              <Loader center content="Loading..." />
            </Paragraph>
          )
        case 1:
          return (
            <ul className="list-unstyled mb-0 tabItemList">
              {
              selectedCategory === 0 &&
              filteredGotchis
              .map((v, idx) => {
                return (
                  <li key={idx}>

                    <Link className="d-block tabContentLink" to={`/my-gotchi-item-details/${v.id}`}>
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
                                  {formatPrice(v.price)}
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

              {
                selectedCategory === 1 &&
                packs
                .map((v, idx) => {
                  return (
                    <li key={idx}>

                      <Link className="d-block tabContentLink" to={`/my-pack-item-details/${v.id}`}>
                        <div className="row">
                          <div className="col-xl-3 col-lg-4 col-md-4 col-sm-4 col-12 text-center">
                            <img style={{maxHeight: '180px'}} className="d-block mx-auto img-fluid"
                              src={
                                `${v.image}`
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
                                      className="me-2 img-fluid"
                                      style={{
                                        width: "60px",
                                      }}
                                      src={"../logo.png"}
                                      alt=""
                                    />
                                    {formatPrice(v.price)}
                                  </span>
                                </div>
                              </div>
                              <div className="col_body" >
                                <ul className="list-unstyled">
                                  <li className="font-weight-bold">
                                      Name: {v.name}
                                  </li>
                                  <li className="font-weight-bold">
                                      Description: { v.description }
                                  </li>
                                
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>

                    </li>
                  );
                })
              }
            </ul>
          )
        case 2:
          return (
            <div className="content_body mt-3 p-3 p-md-5">
                <img
                  style={{ height: "100px" }}
                  src={require("../../Static/img/icon_img/baazaar.png").default}
                  alt="img"
                />

                <p className="py-3">Would you like to sell your own item? </p>

              <Link to={selectedCategory === 0 ? "/my-gotchis" : "/my-packs"} className="btn btn_visit">Visit Your { selectedCategory === 0? "Gotchi" : "Pack" } Page</Link>
            </div>
          )
      default:
        break;
    }
  }

  return (
    <div id="MyGotChis">
      <div className="content_header d-flex justify-content-between align-items-center">
        <div className="box d-flex align-items-center">

          <div className="dropdown content_dropdown">
            <button
              className="align-items-center btn_toggle btn text-white m-2"
              style={{ fontSize: "20px" }}
            // data-mdb-toggle="dropdown"
              onClick={() => setSelectedCategory(0)}
              disabled={selectedCategory === 0}
            >
              GotChis
            </button>
            <button
              className="align-items-center btn_toggle btn text-white m-2"
              style={{ fontSize: "20px" }}
              onClick={() => setSelectedCategory(1)}
              disabled={selectedCategory === 1}
            >
              Packs
            </button>
            
          </div>
        </div>
        {
          selectedCategory === 0 &&
        <div className="box">
          <div className="dropdown content_dropdown">
            <button
              className="dropdown-toggle p-2 px-1 px-sm-3"
              data-mdb-toggle="dropdown"
            >
              Sort By: {crntType}
            </button>
            <div className="dropdown-menu">
              <ul className="list-unstyled mb-0">
                {
                  types?.map((t, idx) => 
                    <li className="w-100 py-1 text-capitalize" key={idx} onClick={() => setCrntType(t)}>
                      {t.toLowerCase() === "background" ? "Area" : t}
                    </li>
                  )
                }
                <li className="w-100 py-1" onClick={() => setCrntType("ALL")}>
                  ALL
                </li>
              </ul>
            </div>
          </div>
        </div>
        }
        
      </div>

      <div className="content_body mt-3 p-3 p-md-5 tabItemContent">
        <AssetsComponent/>
      </div>

    </div>
  );
}



export default MyItems;
