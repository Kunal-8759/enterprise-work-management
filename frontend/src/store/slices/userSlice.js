import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/api.js";

export const searchUserByEmail = createAsyncThunk(
  "users/searchByEmail",
    async (email, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/users/search", {
                params: { email },
            });
            return data.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to search user"
            );
        }
    }
);

const userSlice = createSlice({
    name: "users",
    initialState: {
        searchedUser: null,
        searching: false,
        error: null,
    },
    reducers: {
        clearSearchedUser: (state) => {
            state.searchedUser = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(searchUserByEmail.pending, (state) => {
            state.searching = true;
            state.searchedUser = null;
            state.error = null;
        })
        .addCase(searchUserByEmail.fulfilled, (state, action) => {
            state.searching = false;
            state.searchedUser = action.payload;
        })
        .addCase(searchUserByEmail.rejected, (state, action) => {
            state.searching = false;
            state.error = action.payload;
        });
    },
});

export const { clearSearchedUser } = userSlice.actions;
export default userSlice.reducer;