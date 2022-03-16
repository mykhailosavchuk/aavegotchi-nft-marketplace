import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"
import { useMoralis } from "react-moralis"
import axios from "axios";

import "./MyGotChis.css";
import Loading from "../../Components/Loading";

function MyPacks(props) {

  const packContract  = useSelector(state => state.wallet.packContract);
  const { account, chainId } = useMoralis();
  const [ packs, setPacks ] = useState([]);
  const [ assetsState, setAssetsState  ] = useState(0);

  useEffect(async () => {
    await loadHandler();
       
  }, [packContract, account, chainId]);

  const loadHandler = async () => {
    if(typeof packContract !== "undefined" && packContract !== null) {
      const uris = await packContract.methods.holderTokenUris(account).call();
      const ids = await packContract.methods.holderTokenIds(account).call();
      let _packs = [];
      for(let i=0 ; i<uris.length ; i++) {
        const res = await axios.get(uris[i]);
        _packs.push({id: ids[i], ...res.data});
      }

      _packs.length === 0 ? setAssetsState(2) : setAssetsState(1);
      setPacks(_packs);
    }
  }

  const AssetsComponent = () => {
    switch (assetsState) {
      case 0:
        return (
          <ul className="list-unstyled mb-0 tabItemList">
            <li>
              <Loading/>
            </li>
          </ul>
        )    
      case 1:
        return (
          <ul className="list-unstyled mb-0 tabItemList">
            {packs.map((v, idx) => {
              return (
                <li key={idx}>

                  <Link to={`/my-pack-details/${v.id}`} className="d-block tabContentLink" >
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
                              GOTCHI HEROES PACK
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
                                {5}
                              </span>
                            </div>
                          </div>
                          <div className="col_body">
                            <ul className="list-unstyled">
                              <li className="font-weight-bold">
                                Gotchi count: {v.gotchiCount}
                              </li>
                              <li>
                                <p className="text-left flex">
                                Each Gotchi Heroes Pack contains 5 items randomly selected from the Gotchi Heroes item pool. Each pack is guaranteed to contain at least one item that is Rare or better.
                                </p>
                              </li>
                              <li>
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
        )
        case 2:
          return <EmptyBalance title={"Don’t have any packs? Visit the Mint page to get some!"} link={"/mint"} buttonTitle={"Mint Packs"}/>
      default:
        break;
    }
    
  }

  return (
    <div id="MyGotChis">

      <div className="content_body mt-3 p-3 p-md-5 tabItemContent">
        <AssetsComponent/>
      </div>
     
    </div>
  );
}



export const EmptyBalance = ({title, link, buttonTitle}) => {
  return (
    <div className="content_body mt-3 p-3 p-md-5">
      <img
        style={{ height: "100px" }}
        src={require("../../Static/img/icon_img/baazaar.png").default}
        alt="img"
      />

      <p className="py-3">{title}</p>

    <Link to={link} className="btn btn_visit">{ buttonTitle }</Link>
  </div>
  )
}

export default MyPacks;
