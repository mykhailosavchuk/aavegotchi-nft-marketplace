export const SET_WEB3 = "SET_WEB3";
export const SET_BALANCE = "SET_BALANCE";
export const SET_MARKETPLACE_CONTRACT = "SET_MARKETPLACE_CONTRACT";
export const SET_TOKEN_CONTRACT = "SET_TOKEN_CONTRACT";
export const SET_GHST_CONTRACT = "SET_GHST_CONTRACT";
export const SET_GOTCHI_CONTRACT = "SET_GOTCHI_CONTRACT";
export const SET_PACK_CONTRACT = "SET_PACK_CONTRACT";

export const setWeb3Action = web3 => ({ type: SET_WEB3, payload: web3 });

export const setBalanceAction = data => ({ type: SET_BALANCE, payload: data });

export const setMarketContractAction = data => ( { type: SET_MARKETPLACE_CONTRACT, payload: data } )

export const setTokenContractAction = data => ( { type: SET_TOKEN_CONTRACT, payload: data } )

export const setGhstContractAction = data => ( { type: SET_GHST_CONTRACT, payload: data } )

export const setGotchiContractAction = data => ({type: SET_GOTCHI_CONTRACT, payload: data});

export const setPackContractAction = data => ({type: SET_PACK_CONTRACT, payload: data})
