import axios from "axios";
import { loginStart, loginSuccess, loginFailure } from "../redux/slices/LoginSlice";

export const loginUser = (email, password) => async (dispatch) => {
    dispatch(loginStart());
    try {
      const response = await axios.post("http://localhost:8888/login", {
        email,
        password,
      });
  
      dispatch(loginSuccess(response.data.user));
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };
  
