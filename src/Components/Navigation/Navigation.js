import React, { useState, useEffect } from "react";
import { Drawer, Button, ButtonToolbar, Modal } from "rsuite";
import { Link } from "react-router-dom";
import { useMoralis, useTokenPrice, useChain } from "react-moralis"
import { shapeAddress } from "../../utils/formatHelpers";
import Web3 from "web3";
import { useDispatch } from "react-redux"
import { setWeb3Action, setMarketContractAction, setTokenContractAction, setPackContractAction, setGotchiContractAction, setGhstContractAction } from "../../store/actions/WalletActions"
import Market from "../../backend/abis/Marketplace.json";
import ERC20 from "../../backend/abis/GHERO.json"
import Gotchi from "../../backend/abis/Gotchi.json";
import Pack from "../../backend/abis/Pack.json";
import { tokenAddress, marketPlaceAddress, testTokenAddress, packAddress, gotchiAddress, chain as defaultChainId, testGhstAddress } from "../../config/constances"
import Metamask from "../../Static/img/icon_img/metamask.png";
import WalletConnect from "../../Static/img/icon_img/walletconnect.png";
import TrustWallet from "../../Static/img/icon_img/TrustWallet.png";
import Coin98 from "../../Static/img/icon_img/Coin98.png";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toastAction } from "../../store/actions/ToastActions";

import "rsuite/dist/rsuite.min.css";
import "./Navigation.css";


export const connectors = [
  {
    title: "Metamask",
    connectorId: "injected",
    icon: Metamask,
    priority: 1,
  },
  {
    title: "WalletConnect",
    connectorId: "walletconnect",
    icon: WalletConnect,
    priority: 2,
  },
  {
    title: "Trust Wallet",
    connectorId: "injected",
    icon: TrustWallet,
    priority: 3,
  },
  {
    title: "MathWallet",
    connectorId: "injected",
    icon: require("../../Static/img/icon_img/MathWallet.svg").default,
    priority: 999,
  },
  {
    title: "TokenPocket",
    connectorId: "injected",
    icon: require("../../Static/img/icon_img/TokenPocket.svg").default,
    priority: 999,
  },
  {
    title: "SafePal",
    connectorId: "injected",
    icon: require("../../Static/img/icon_img/SafePal.svg").default,
    priority: 999,
  },
  {
    title: "Coin98",
    connectorId: "injected",
    icon: Coin98,
    priority: 999,
  },
];

const drawer_link_object = {
  object1: [
    {
      id: 1,
      link: "/my-packs",
      name: "My Packs",
      icon: require("../../Static/img/icon_img/portal.gif").default,
    },
    {
      id: 2,
      link: "/my-gotchis",
      name: "My Items",
      icon: require("../../Static/img/icon_img/aavegotchialpha.png").default,
    },
    {
      id: 4,
      link: "/my-items",
      name: "My Listings",
      icon: require("../../Static/img/icon_img/my-items.svg").default,
    },
    {
      id: 5,
      link: "/mint",
      name: "Mint Packs",
      icon: require("../../Static/img/icon_img/90.svg").default,
    },
    {
      id: 6,
      link: "/",
      name: "Market ",
      icon: require("../../Static/img/icon_img/baazaar.png").default,
    },
    
  ],
};

function Navigation(props) {
  const [openWithHeader, setOpenWithHeader] = React.useState(false);
  const [thumbToggle, setThumbToggle] = useState(false);

  const [ walletConnectModal, setWalletConnectModal ] = useState(false);
  const [ logoutModal, setLogoutModal ] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated, account, authenticate, logout, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3 } = useMoralis();
  const { chainId, switchNetwork } = useChain();

  const [ copyAddressLabel, setCopyAddressLabel ] = useState("Copy Address");

  useEffect(() => {
    let theme = thumbToggle ? "dark-theme" : "";
    window.document.documentElement.setAttribute("data-theme", theme);
  }, [thumbToggle]);

  useEffect(() => {

    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });

    if(typeof web3 !== "undefined" && web3 !== null) {
      const _web3 = new Web3(web3.provider);
      
      dispatch(setWeb3Action(_web3));
      const _marketContract = new _web3.eth.Contract(Market.abi, marketPlaceAddress);

      const _tokenContract = new _web3.eth.Contract(ERC20.abi, testTokenAddress);

      const _ghstContract = new _web3.eth.Contract(ERC20.abi, testGhstAddress);

      const _packContract = new _web3.eth.Contract(Pack.abi, packAddress);

      const _gotchiContract = new _web3.eth.Contract(Gotchi.abi, gotchiAddress);

      dispatch(setMarketContractAction(_marketContract));

      dispatch(setPackContractAction(_packContract));

      dispatch(setGotchiContractAction(_gotchiContract));

      dispatch(setTokenContractAction(_tokenContract));

      dispatch(setGhstContractAction(_ghstContract));

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    if(chainId && chainId !== defaultChainId) {
      dispatch(toastAction("info", "Please switch current network into Polygon.", 6000))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId])


  const copyAddrHandler = () => {
    setCopyAddressLabel("Copied")

    setTimeout(() => {
      setCopyAddressLabel("Copy Address")
    }, 3000)
  }

  const switchNetHandler = (chainId_) => {
      if(chainId_ !== chainId) {
      switchNetwork(chainId_)
    }
  }

  return (
    <div id="Navigation" className="modal-container">

      <div className="d-flex justify-content-end">
        {
          !isAuthenticated ?
          <Link
            to="#"
            className="d-flex align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
            style={{ fontSize: "20px" }}
            onClick={() => setWalletConnectModal(true)}
          >
            Connect Wallet
          </Link>
          :
          (
            <>
              <Link
                to="#"
                className="d-flex align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
                style={{ fontSize: "20px" }}
                onClick={() => setLogoutModal(true)}
              >
                {
                  shapeAddress(account)
                }
              </Link>
              <Link
                to="#"
                className="d-flex align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
                style={{ fontSize: "20px" }}
                // onClick={() => switchNetHandler("0x13881")}
                onClick={() => switchNetHandler(defaultChainId)}
              >
                Switch to testnet
              </Link>
            </>
          )
          
        }
        
        {/* <Link
          to="/my_gotchis"
          className="d-flex align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
          style={{ fontSize: "20px" }}
        >
          My GotChis
        </Link>
        <Link
          to="/mint"
          className="d-flex align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
          style={{ fontSize: "20px" }}
        >
          Mint
        </Link>
        <Link
          to="/portalitems"
          className="d-flex align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
          style={{ fontSize: "20px" }}
        >
          Portal
        </Link> */}
        <button
          onClick={() => setOpenWithHeader(true)}
          className="btn_toggle btn p-1 px-3 my-2 btn"
        >
          <img
            style={{ width: "50px", height: "55px" }}
            src={require("../../Static/img/icon_img/menu.svg").default}
            alt=""
          />
        </button>
      </div>

      <div>
        <Drawer open={openWithHeader} onClose={() => setOpenWithHeader(false)}>
          <Drawer.Header>
            {/* <Drawer.Title>Drawer Title</Drawer.Title>
            <Drawer.Actions>
              <Button onClick={() => setOpenWithHeader(false)}>Cancel</Button>
              <Button
                onClick={() => setOpenWithHeader(false)}
                appearance="primary"
              >
                Confirm
              </Button>
            </Drawer.Actions> */}
            <div className="d-flex align-items-center justify-content-center">
              <img
                className="mx-2"
                style={{ width: "22px", height: "22px" }}
                src={require("../../Static/img/icon_img/130.svg").default}
                alt=""
              />
              <button
                className={`bg_toggle_btn_wrapper ${
                  thumbToggle && "active_btn_toggle"
                }`}
                onClick={() => setThumbToggle(!thumbToggle)}
              >
                <span
                  className={`toggle_thumbnail active_cursor ${
                    thumbToggle && "toggle_active"
                  }`}
                ></span>
              </button>

              <img
                className="mx-2"
                style={{ width: "22px", height: "22px" }}
                src={require("../../Static/img/icon_img/90.svg").default}
                alt=""
              />
            </div>
          </Drawer.Header>
          <Drawer.Body>
            <ul className="drawer_nav_list list-unstyled">
              {drawer_link_object.object1.map((v) => {
                return (
                  <li
                    key={v.id}
                    onClick={() => setOpenWithHeader(false)}
                    className="mb-3"
                  >
                    <Link to={v.link}>
                      {" "}
                      <img
                        className="me-3"
                        src={v.icon}
                        alt="img"
                        style={{ width: "30px", height: "30px" }}
                      />{" "}
                      {v.name}{" "}
                    </Link>
                  </li>
                );
              })}

              {/* <li
                className="mb-3"
              >
                <Link to={"/mint"}>
                  {" "}
                  <img
                    className="me-3"
                    src={require("../../Static/img/icon_img/90.svg").default}
                    alt="img"
                    style={{ width: "30px", height: "30px" }}
                  />{" "}
                  Mint{" "}
                </Link>
              </li> */}
            </ul>
            <div className="list_divider"></div>

            {/* <ul className="drawer_nav_list list-unstyled">
              {drawer_link_object.object2.map((v) => {
                return (
                  <li key={v.id} className="mb-3">
                    <Link to={v.link}>
                      {" "}
                      <img
                        className="me-3"
                        src={v.icon}
                        alt="img"
                        style={{ width: "30px", height: "30px" }}
                      />{" "}
                      {v.name}{" "}
                    </Link>
                  </li>
                );
              })}
            </ul> */}

            {/* <div className="settings_action">
              <div className="drawer_nav_list d-flex w-100 h-100">
                <a
                  href="#"
                  className="text-center align-self-end w-100  justify-content-center"
                >
                  Settings
                  <img
                    className="ml-3"
                    src={require("../../Static/img/icon_img/settingsIconWhite.jpg").default}
                    alt="img"
                    style={{ width: "16px", height: "16px" }}
                  />
                </a>
              </div>
            </div> */}
          </Drawer.Body>
        </Drawer>
      </div>

        <Modal open={walletConnectModal} onClose={() => setWalletConnectModal(false)}  style={{marginTop: "100px"}}>
          <Modal.Body>
            <div className="container row">
              {
                connectors.map((c, idx) => (
                  <Link to="#" key={idx} className="wallet-item" onClick={async () => {
                    try {
                        await authenticate({ provider: c.connectorId });
                        window.localStorage.setItem("connectorId", c.connectorId);
                        setWalletConnectModal(false);
                      } catch (e) {
                        setWalletConnectModal(false);
                        console.error(e);
                      }
                }}>
                    <div className="center">
                      <img src={c.icon} style={{width: "50px"}} className="img-fluid" alt="logo"/>
                    </div>
                    <span className="center">
                      { c.name }
                      </span>  
                  </Link>
                ))
              }
              
              
            </div>
          </Modal.Body>
        </Modal>


      <Modal open={logoutModal} onClose={() => setLogoutModal(false)}  style={{marginTop: "100px"}}>
          <Modal.Body>
            <div className="container" style={{width: "80%"}}>
              <div className="row">
                <div className="col-6">
                  <Link to="#"
                  style={{ fontSize: "40px"}}
                  >
                    {shapeAddress(account)}
                  </Link>
                </div>
                <div className="col-6">
                <Link
                  to="#"
                  className="align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
                  style={{ fontSize: "20px", width: "80px", float: "right" }}
                  onClick={() => {logout(); setLogoutModal(false)}}
                >
                  Logout
                </Link>
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <CopyToClipboard text={account}>
                    <Link 
                    to="#"
                    style={{ fontSize: "20px"}}
                    onClick={copyAddrHandler}
                    >
                      { copyAddressLabel }
                    </Link>
                  </CopyToClipboard>
                  
                </div>
                <div className="col-6">
                <a
                  to={`https://polygonscan.com/address/${marketPlaceAddress}`}
                  target="_blank"
                  style={{ fontSize: "20px", float: "right" }}
                >
                  View On Block Explorer
                </a>
                </div>
              </div>
              
              <div className="row">
                <div className="col-6">
                  <Link to="#"
                  className="align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
                  style={{ fontSize: "20px"}}
                  onClick={() => switchNetHandler("0x01")}
                  >
                    Switch to Ethereum
                  </Link>
                </div>
                <div className="col-6">
                <Link
                  to="#"
                  className="align-items-center btn_toggle btn p-2 px-3 me-2 my-2 btn text-white"
                  style={{ fontSize: "20px", float: "right" }}
                  onClick={() => switchNetHandler("0x89")}
                >
                  Connected to Polygon
                </Link>
                </div>
              </div>
              
            </div>
          </Modal.Body>
        </Modal>

    </div>
  );
}

export default Navigation;
