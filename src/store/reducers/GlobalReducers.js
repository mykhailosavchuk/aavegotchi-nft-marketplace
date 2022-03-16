import { SET_LOADING, SET_TYPE, SET_TYPES, SET_LOADING_LABEL } from "../actions/GlobalActions";

const globalReducer = (state = { isLoading: false, types: []  }, { type, payload }) =>{
	switch(type){
		case SET_LOADING: 
			return {
				...state,
				isLoading: payload,
			};
		case SET_TYPE: 
			return {
				...state,
				type: payload,
			};
		case SET_TYPES: 
			return {
				...state,
				types: payload,
			};
		case SET_LOADING_LABEL:
			return  {
				...state,
				loadingLabel: payload
			}
		default:
			return state;
		 
	}
}
export default globalReducer;