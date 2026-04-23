import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/api.js";

//  Async Thunks for authentication actions
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post("/auth/login", credentials);
            console.log("Login response:", data); // Debugging log
            return data.data;
        } catch (error) {
            console.log("Error message:", error.response?.data?.message); // Debugging log
            return rejectWithValue(error.response?.data?.message || "Login failed");
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post("/auth/register", userData);
            console.log("Registration response:", data); // Debugging log
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Registration failed"
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Logout failed");
        } finally {
            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("accessToken");
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/auth/me");
            return data.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch user"
            );
        }
    }
);

//  Initial State 

const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem("accessToken") || !!sessionStorage.getItem("accessToken"),
  loading: false,
  userLoading : false,
  error: null,
};

// Slice definition
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
        // Login cases
        .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Register cases
        .addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = action.payload.user;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Logout cases
        .addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        })

        // Fetch Current User cases
        .addCase(fetchCurrentUser.pending, (state) => {
            state.userLoading = true;
        })
        .addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.userLoading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        })
        .addCase(fetchCurrentUser.rejected, (state) => {
            state.userLoading = false;
            state.isAuthenticated = false;
            state.user = null;
        });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;