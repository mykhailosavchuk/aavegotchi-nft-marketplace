import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"
import { useMoralis } from "react-moralis"
import axios from "axios";
import { Loader } from 'rsuite';
import { Placeholder } from 'rsuite';
import "./MyGotChis.css";

function MyPacks(props) {

  const packContract  = useSelector(state => state.wallet.packContract);
  const { account, chainId } = useMoralis();
  const [ packs, setPacks ] = useState([]);
  const [ assetsState, setAssetsState  ] = useState(0);
  const { Paragraph } = Placeholder;

  useEffect(() => {
    (async () => {
      if(typeof packContract !== "undefined" && packContract !== null) {
        try {
          const uris = await packContract.methods.holderTokenUris(account).call();
          const ids = await packContract.methods.holderTokenIds(account).call();
          let _packs = [];
          for(let i=0 ; i<uris.length ; i++) {
              const res = await axios.get(uris[i]);
  
              _packs.push({id: ids[i], ...res.data});
            
          }
  
          _packs.length === 0 ? setAssetsState(2) : setAssetsState(1);
          setPacks(_packs);
        }catch {
          return setAssetsState(2)
        }
      }else {
        setAssetsState(2)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packContract, account, chainId]);

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
                              { v.name }
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
                                {v.price}
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
                                { v.description }
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

      <h4 className="py-3">{title}</h4>

      <Link to={link} className="btn btn_visit">{ buttonTitle }</Link>
    </div>
  )
}

export default MyPacks;
