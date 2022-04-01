import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmptyBalance } from "../MyPacks/MyPacks";
import { useSelector } from "react-redux"
import { useMoralis } from "react-moralis"
import axios from "axios";
import { hostingLink, secondKeys } from "../../config/constances";
import { Loader } from 'rsuite';
import { Placeholder } from 'rsuite';
import "./MyGotChis.css";

const LOWEST = "LOWEST";
const HIGHEST = "HIGHEST";

function MyGotChis() {
  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const { account, chainId } = useMoralis();
  const { Paragraph } = Placeholder;

  const [ gotchis, setGotchis ] = useState([]);
  const [ filteredGotchis, setFilteredGotchis ] = useState([]);
  const [ types, setTypes ] = useState([]);
  const [ rarities, setRarities ] = useState([]);
  const [ crntType, setCrntType ] = useState();
  const [ qSortby, setSortQBy ] = useState(LOWEST);
  const [ filterRBy, setFilterRBy ] = useState("ALL");
  const [ assetsState, setAssetsState  ] = useState(0);

  useEffect(() => {

    (async () => {
      if(typeof gotchiContract !== "undefined" && gotchiContract !== null) {
        try {
          const uris = await gotchiContract.methods.holderTokenUris(account).call();
          const ids = await gotchiContract.methods.holderTokenIds(account).call();
          let _gotchis = [];
          for(let i=0 ; i<uris.length ; i++) {
            try {
              const res = await axios.get(uris[i]);
              let newGotchi = {...res.data, id: ids[i]};
  
              _gotchis.push(newGotchi);
            } catch {}
          }
          _gotchis.length === 0 ? setAssetsState(2) : setAssetsState(1);
          let _types = _gotchis.map(g => g.type).filter((t, idx, self) => self.indexOf(t) === idx);
          let _rarities = _gotchis.map(g => g.tier).filter((t, idx, self) => self.indexOf(t) === idx);
          setRarities(_rarities);
          setTypes(_types);
          setGotchis(_gotchis);
          setCrntType(_types[0]);
        }catch {
          setAssetsState(2)
        }
      }else {
        setAssetsState(2)
      }
    })()
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gotchiContract, chainId, account]);

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
            filteredGotchis
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
                                  Token ID: #{v.id}
                              </li>
                              <li className="font-weight-bold">
                                  Quality: {Number.parseFloat(v.quality).toFixed(2)}%
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
        case 2:
          return <EmptyBalance title={"Would you like to buy any item?"} buttonTitle="Visit Market" link={"/"}/>
      default:
        break;
    }
    
  }

  useEffect(() => {
    let result = gotchis.filter(g => crntType === "ALL" ? true : g.type === crntType).filter(g => filterRBy === "ALL" ? true : g.tier === filterRBy).sort((frt, sec) => qSortby === HIGHEST ? sec.quality - frt.quality : frt.quality - sec.quality);
    setFilteredGotchis(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ crntType, qSortby, filterRBy ])

  return (
    <div id="MyGotChis">
      <div className="content_header d-flex justify-content-between align-items-center">
        <div className="box d-flex align-items-center">

          <div className="dropdown content_dropdown m-3">
            <button
              className="dropdown-toggle p-2 px-1 px-sm-3 text-capitalize"
              data-mdb-toggle="dropdown"
            >
              Filter Type By: {crntType}
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
          <div className="dropdown content_dropdown m-3">
            <button
              className="dropdown-toggle p-2 px-1 px-sm-3 text-capitalize"
              data-mdb-toggle="dropdown"
            >
              Sort By Quality: {qSortby}
            </button>
            <div className="dropdown-menu">
              <ul className="list-unstyled mb-0">
                <li className="w-100 py-1 text-capitalize" onClick={() => setSortQBy(LOWEST)}>
                  { LOWEST }
                </li>
                <li className="w-100 py-1 text-capitalize" onClick={() => setSortQBy(HIGHEST)}>
                  { HIGHEST }
                </li>

              </ul>
            </div>
          </div>
          <div className="dropdown content_dropdown m-3">
            <button
              className="dropdown-toggle p-2 px-1 px-sm-3 text-capitalize"
              data-mdb-toggle="dropdown"
            >
              Filter By Rarity: {filterRBy}
            </button>
            <div className="dropdown-menu">
              <ul className="list-unstyled mb-0">
              {
                  rarities?.map((t, idx) => 
                    <li className="w-100 py-1 text-capitalize" key={idx} onClick={() => setFilterRBy(t)}>
                      {t}
                    </li>
                  )
                }
                <li className="w-100 py-1" onClick={() => setFilterRBy("ALL")}>
                ALL
                </li>

              </ul>
            </div>
          </div>
        </div>

      </div>

      <div className="content_body mt-3 p-3 p-md-5 tabItemContent">
        <AssetsComponent/>
      </div>
    </div>
  );
}

export default MyGotChis;
