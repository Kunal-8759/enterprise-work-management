import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import dashboardReducer from "./slices/dashboardSlice";
import notificationReducer from "./slices/notificationSlice.js";
import projectReducer from "./slices/projectSlice.js";
import userReducer from "./slices/userSlice.js";
import taskReducer from "./slices/taskSlice.js";
import analyticsReducer from "./slices/analyticsSlice.js";

const Store = configureStore({
  reducer: {
    auth : authReducer,
    dashboard : dashboardReducer,
    notifications: notificationReducer,
    projects: projectReducer,
    users : userReducer,
    tasks: taskReducer,
    analytics: analyticsReducer,
  },
});

export default Store;