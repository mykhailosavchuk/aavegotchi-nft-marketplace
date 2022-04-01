import React, { useEffect, useState, useMemo } from "react";
import { useMoralis } from "react-moralis";
import { useSelector, useDispatch } from "react-redux";
// import { create as ipfsHttpClient } from "ipfs-http-client";
import { defaultPackId, ipfsLink, packAddress, starterPackId } from "../../config/constances";
import axios from "axios";
import { setLoadingAction, setLoadingLabelAction } from "../../store/actions/GlobalActions";
import { useNavigate } from "react-router-dom";
import { toastAction } from "../../store/actions/ToastActions";

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function Mint() {

  const dispatch = useDispatch();
  const ghstContract  = useSelector(state => state.wallet.ghstContract);
  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const packContract  = useSelector(state => state.wallet.packContract);
  const { account, isAuthenticated, Moralis } = useMoralis();
  const [ count, setCount ] = useState(-1);
  const navigate = useNavigate();

  const [ isApproved, setIsApproved ] = useState(false);

  useEffect(() => {
    initialAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghstContract, account]);

  const initialAction = async () => {
    if(typeof ghstContract !== "undefined" && ghstContract !== null) {
      const amount = await ghstContract.methods.allowance(account, packAddress).call();
      // const newPcak = {
      //   name: `Gotchi Heroes Pack`,
      //   description: `Each Gotchi Heroes Pack contains 5 items randomly selected from the Gotchi Heroes item pool. Each pack is guaranteed to contain at least one item that is Rare or better.`,
      //   gotchiCount: 5,
      //   price: 5,
      //   image: `${ipfsLink}QmX2t4j1dG11LtrCfYEAmpE3bL75MvppD4JwEqmdnKgQJa`
      // }

      // const newSPcak = {
      //   name: `Gotchi Heroes Starter Pack`,
      //   description: `Each Gotchi Heroes Starter Pack contains 10 items randomly selected from the Gotchi Heroes item pool. Each pack is guaranteed to contain at least one Weapon, one Skill and one Area.`,
      //   gotchiCount: 10,
      //   price: 15,
      //   image: `${ipfsLink}QmbVCNyurXuhpUh8673db8GqKsXs1bQ6apG768c4rYpRzr`
      // }
      
      // await uploadToIpfs(newPcak);
      // await uploadToIpfs(newSPcak);
      if(Number.parseInt(amount) > 500*Math.pow(10, 18)) {
        setIsApproved(true)
      }
    }
  }

  const approveHandler = async () => {
    const balance = await ghstContract.methods.balanceOf(account).call();
    await ghstContract.methods.approve(packAddress, balance).send({from: account});
    setIsApproved(true)
  }

  const mintPackHandler = async () => {
    if(isAuthenticated) {
      try {
        window.uris_ = [];
        window.types_ = [];

        if(count < 0) {
          dispatch(toastAction("error", "Please select pack type first."));
          return;
        }

        dispatch(setLoadingLabelAction("Minting Pack"));
        dispatch(setLoadingAction(true));
        
        window.itemCnt = 5;
        if(count === 0) {
          const isStarted = await packContract.methods.isStarted(account).call();
          if(isStarted) {
            dispatch(toastAction("error", "You have already starter pack."));
            return;
          }
          window.itemCnt = 10;
        }else if(count > 0) {
          window.itemCnt = count * 5;
        }
        
        const { packId, uris, types } = await getDetails(window.itemCnt);

        if(count < 2) {
          await packContract.methods.mint(count === 0 ? starterPackId : defaultPackId, uris, types).send({from: account});
        }else if(count > 1) {
          let packIds = Array(count).fill().map((_) => defaultPackId);
          await packContract.methods.mintBatch(packIds, uris, types).send({from: account});
        }

        dispatch(setLoadingAction(false));
        navigate(`/my-pack-details/${packId}`);
      }catch (e) {
        console.log(e)
        dispatch(setLoadingAction(false));
      }
    }
  }

  const selectedCount = useMemo(() => {
    switch (count) {
      case -1:
        return "Select Type";
      case 0:
        return "Starter Pack";
      case 1:
      case 10:
      case 100:
      case 50:
        return `${count} Packs`;
      default:
        break;
    }
  }, [count])

  const uploadToIpfs = async data => {
    let item;
    try {
      const file = new Moralis.File("file", {base64 : btoa(JSON.stringify(data))});
      await file.saveIPFS();
      item = file._hash
    }catch {
        await sleep(5000)
        console.log("error: upload to ipfs")
        //dispatch(toastAction("error", "IPFS server Error!, please try again"));
      return null;
    }
    return item;
  }

  const uploadFileToIpfs = async data => {
    let item;
    try {
      const file = new Moralis.File("file", data);
      await file.saveIPFS();
      item = file._hash
      await axios.get(`${ipfsLink}${item}`)
    }catch {
        await sleep(5000)
        console.log("error: upload to ipfs")
        //dispatch(toastAction("error", "IPFS server Error!, please try again"));
      return null;
    }
    return item;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const fetchItems = async (itemCnt) => {
    console.log("fetch items", itemCnt)
    let url = "";
    if(count === 0){
      url = `https://gotchiheroes.com/server/generator.php?count=7&starterPack=true`;
    }else if(count > 0) {
      url = `https://gotchiheroes.com/server/generator.php?count=${itemCnt}`;
    }
    let res = null;
    try {
      res = await axios.get(url);
      
    }catch {
      console.log("fetch error")
      await sleep(5000)
      return await fetchItems(itemCnt);
    }
    
    if(!res.data.items.map(i => i.tier.toLowerCase()).includes("rare")) {
      return await fetchItems(itemCnt);
    }
    return res;
  }

  const getDetails = async (itemCnt) => {

    if(itemCnt <= 0) return null;
    console.log("start get details", itemCnt, window.itemCnt)
    const res = await fetchItems(itemCnt);

    console.log(res.data.items.length)
    let gotchiId = await gotchiContract.methods.newId().call();

    console.log("getDetails", itemCnt);
    for(let i=res.data.items.length-itemCnt ; i<res.data.items.length ; i++){
      let newGotchi = {
        id: gotchiId ++,
        createdAt: Date.now(),
        ...res.data.items[i]
      }
      console.log(newGotchi)

      let item = null;
      try {
        item = await uploadToIpfs(newGotchi);
      }catch {
       console.log("catch error-----------") 
      }
      console.log(item)
      if(typeof item === "undefined" || item === null) {
        console.log("will call getdetails", window.itemCnt, window.uris_.length, window.itemCnt - window.uris_.length)
        return await getDetails(window.itemCnt - window.uris_.length);
      }

      console.log(window.types_.length)

      window.types_.push(newGotchi.type);
      window.uris_.push(item)
      
    }

    

    const packId = await packContract.methods.newId().call();

    return {
      packId,
      uris: window.uris_,
      types: window.types_,
    }

  }
  
  return (
    <div id="MyGotChis">
  
      <input type="hidden" onChange={e => uploadFileToIpfs(e.target.files[0])} />

      <div className="content_body p-3 p-md-5">
        <div className="mt-5">
          <img
            style={{ height: "100px" }}
            src={require("../../Static/img/icon_img/baazaar.png").default}
            alt="img"
          />

          <h4>Each Gotchi Heroes Pack contains 5 items randomly selected from the Gotchi Heroes item pool. Each pack is guaranteed to contain at least one item that is Rare or better.</h4>

        <div className="container">
          <div className="d-flex row align-items-center" style={{justifyContent: "center"}}>

            <button
              className="btn_toggle btn text-white m-2"
              style={{ fontSize: "20px", width: "200px" }}
              onClick={approveHandler}
              disabled={isApproved}
            >
              Approve GHST
            </button>

            <div style={{width: "230px"}}>
              <div className="text-white dropdown content_dropdown" style={{width: "200px"}}>
                <button
                  className="btn_toggle btn text-white m-2 text-capitalize m-2"
                  data-mdb-toggle="dropdown"
                  style={{fontSize: "20px", width: "200px"}}
                >
                  {selectedCount}
                </button>
                <div className="dropdown-menu">
                  <ul className="list-unstyled mb-0">
                    <li className="w-100 py-1 text-capitalize" onClick={() => setCount(0)}>
                      Starter Pack
                    </li>
                    <li className="w-100 py-1" onClick={() => setCount(1)}>
                      1 pack
                    </li>
                    <li className="w-100 py-1" onClick={() => setCount(10)}>
                      10 packs
                    </li>
                    <li className="w-100 py-1" onClick={() => setCount(50)}>
                      50 packs
                    </li>
                    <li className="w-100 py-1" onClick={() => setCount(100)}>
                      100 packs
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              className="btn_toggle btn text-white m-2"
              style={{ fontSize: "20px", width: "200px" }}
              onClick={mintPackHandler}
              disabled={!isApproved}
            >
              Mint Pack
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mint;
