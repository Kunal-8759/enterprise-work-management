import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import dashboardReducer from "./slices/dashboardSlice";
import notificationReducer from "./slices/notificationSlice.js";
const Store = configureStore({
  reducer: {
    auth : authReducer,
    dashboard : dashboardReducer,
    notifications: notificationReducer,
  },
});

export default Store;