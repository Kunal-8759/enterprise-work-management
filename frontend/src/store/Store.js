import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import dashboardReducer from "./slices/dashboardSlice";

const Store = configureStore({
  reducer: {
    auth : authReducer,
    dashboard : dashboardReducer,
  },
});

export default Store;