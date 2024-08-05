import { combineReducers } from "@reduxjs/toolkit";
import loginReducer from "./slices/LoginSlice";

export default combineReducers({
  login: loginReducer,
});