export const SET_LOADING = "SET_LOADING";

export const SET_TYPE = "SET_TYPE"

export const SET_TYPES = "SET_TYPES"

export const SET_LOADING_LABEL = "SET_LOADING_LABEL";

export const setLoadingAction = state => ({ type: SET_LOADING, payload: state })

export const setLoadingLabelAction = label => ({ type: SET_LOADING_LABEL, payload: label});

export const setTypeAction = type => ({ type: SET_TYPE, payload: type });

export const setTypesAction = types => ({ type: SET_TYPES, payload: types });