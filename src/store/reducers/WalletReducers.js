import { SET_BALANCE, SET_GHST_CONTRACT, SET_GOTCHI_CONTRACT, SET_MARKETPLACE_CONTRACT, SET_PACK_CONTRACT, SET_TOKEN_CONTRACT, SET_WEB3 } from "../actions/WalletActions"


const walletReducer = (state = { }, { type, payload }) =>{
	switch (type) {
		case SET_BALANCE: 
			return {
				...state,
				[payload.token]: payload.balance
			}  
		case SET_WEB3:
		  return {
			  ...state,
			  web3: payload
			}
		case SET_MARKETPLACE_CONTRACT:
			return { 
			  ...state,
			  marketContract: payload
			 }
		case SET_TOKEN_CONTRACT:
			return { 
			  ...state,
			  tokenContract: payload
			 }
		case SET_GHST_CONTRACT:
			return { 
			  ...state,
			  ghstContract: payload
			 }
		case SET_GOTCHI_CONTRACT:
			return { 
			  ...state,
			  gotchiContract: payload
			 }
		case SET_PACK_CONTRACT:
			return { 
				...state,
				packContract: payload
				}
		default:
		  return state
	  }
}
export default walletReducer;