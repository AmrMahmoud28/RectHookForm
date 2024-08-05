import axios from "axios";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../redux/slices/LoginSlice";

export const loginUser = (email, password) => (dispatch) => {
  dispatch(loginStart());

  const WS_URL = `ws://127.0.0.1:8888?email=${email}&password=${password}`;
  const webSocket = new WebSocket(WS_URL);

  return new Promise((resolve) => {
    webSocket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    webSocket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      setTimeout(() => {
        if (response.success) {
          dispatch(loginSuccess(response.user));
          resolve(response);
        } else {
          dispatch(loginFailure(response.error));
          resolve(response);
        }
      }, 1500);
    };

    webSocket.onerror = (error) => {
      dispatch(loginFailure("WebSocket connection error"));
      resolve({ success: false, error: "WebSocket connection error" });
    };

    webSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  });

  // try {
  //   const response = await axios.post("http://localhost:8888/login", {
  //     email,
  //     password,
  //   });

  //   dispatch(loginSuccess(response.data.user));
  //   return { success: true, user: response.data.user };
  // } catch (error) {
  //   const errorMessage = error.response?.data?.message || error.message;
  //   dispatch(loginFailure(errorMessage));
  //   return { success: false, error: errorMessage };
  // }
};
