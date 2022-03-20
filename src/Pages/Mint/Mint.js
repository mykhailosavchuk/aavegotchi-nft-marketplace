import React, { useEffect, useState, useMemo } from "react";
import { useMoralis } from "react-moralis"
import { useSelector, useDispatch } from "react-redux"
import { create as ipfsHttpClient } from "ipfs-http-client";
import { decimals, defaultPackId, gotchiAddress, ipfsLink, packAddress } from "../../config/constances"
import axios from "axios";
import { setLoadingAction, setLoadingLabelAction } from "../../store/actions/GlobalActions";
import { useNavigate } from "react-router-dom"
import { toastAction } from "../../store/actions/ToastActions";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function Mint() {

  const dispatch = useDispatch();
  const ghstContract  = useSelector(state => state.wallet.ghstContract);
  const gotchiContract  = useSelector(state => state.wallet.gotchiContract);
  const packContract  = useSelector(state => state.wallet.packContract);
  const { account, isAuthenticated } = useMoralis();
  const [ count, setCount ] = useState(-1);
  const navigate = useNavigate();

  const [ isApproved, setIsApproved ] = useState(false);

  useEffect(() => {
    initialAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghstContract, account])

  const initialAction = async () => {
    if(typeof ghstContract !== "undefined" && ghstContract !== null) {
      const amount = await ghstContract.methods.allowance(account, gotchiAddress).call();

      const balance = await ghstContract.methods.decimals().call();
      console.log(balance)

      if(Number.parseInt(amount) > 500*Math.pow(10, 18)) {
        setIsApproved(true)
      }
    }
  }

  const approveHandler = async () => {
    const balance = await ghstContract.methods.balanceOf(account).call();
    await ghstContract.methods.approve(gotchiAddress, balance).send({from: account});
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
          window.itemCnt = 8;
        }else if(count > 0) {
          window.itemCnt = count * 5;
        }
        
        const { packId, uris, types } = await getDetails(window.itemCnt);

        if(count < 2) {
          await packContract.methods.mint(defaultPackId, uris, types).send({from: account});
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
      item = await client.add(JSON.stringify(data));
      await axios.get(`${ipfsLink}${item.path}`)
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
      url = `https://gotchiheroes.com/server/generator.php?count=${itemCnt}&starterPack=true`;
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
    console.log("start get details", itemCnt, window.itemCnt)
    const res = await fetchItems(itemCnt);

    console.log(res.data.items.length)
    let gotchiId = await gotchiContract.methods.newId().call();

    console.log("getDetails", itemCnt);
    for(let i=0 ; i<res.data.items.length ; i++){
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
      window.uris_.push(item.path)
      if(window.itemCnt%window.types_.length === 0) {
        dispatch(toastAction("success", "A pack is minted!"))
      }
    }

    // const newPcak = {
    //   name: `Gochi game pack`,
    //   description: `A Pack has 5 items and you can get these by openning it, so you need to pay 5 GHERO to buy this pack.`,
    //   gotchiCount: res.data.items.length,
    //   image: `${ipfsLink}QmbWDffqcugn4HzvYwyB1XhVnA3h6AFEGLf3GVRBdowb8E`
    // }

    const packId = await packContract.methods.newId().call();

    return {
      packId,
      uris: window.uris_,
      types: window.types_,
    }

  }
  
  return (
    <div id="MyGotChis">
  
      <div className="content_body p-3 p-md-5">
        <div className="mt-5">
          <img
            style={{ height: "100px" }}
            src={require("../../Static/img/icon_img/baazaar.png").default}
            alt="img"
          />

          <h4>Each Gotchi Heroes Pack contains 5 items randomly selected from the Gotchi Heroes item pool. Each pack is guaranteed to contain at least one item that is Rare or better.</h4>

        <div className="d-flex align-items-center" style={{justifyContent: "center"}}>

          <button
            className="btn_toggle btn text-white m-2"
            style={{ fontSize: "20px", width: "250px" }}
            onClick={approveHandler}
            disabled={isApproved}
          >
            Approve Zoe
          </button>

          <div className="text-white dropdown content_dropdown" style={{width: "150px"}}>
            <button
              className="dropdown-toggle p-2 px-1 px-sm-3 text-capitalize"
              data-mdb-toggle="dropdown"
              style={{width: "150px"}}
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

          <button
            className="btn_toggle btn text-white m-2"
            style={{ fontSize: "20px", width: "250px" }}
            onClick={mintPackHandler}
            disabled={!isApproved}
          >
            Mint Pack
          </button>

        </div>     

        </div>
        
      </div>
    </div>
  );
}

export default Mint;
