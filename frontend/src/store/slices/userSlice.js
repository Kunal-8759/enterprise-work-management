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

// new
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/users");
      return data.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "users/updateRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/users/${userId}/role`, { role });
      return data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role"
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/users/${userId}/status`, { status });
      return data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    searchedUser: null,
    searching: false,
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchedUser: (state) => {
      state.searchedUser = null;
      state.error = null;
    },
    clearUserError: (state) => {
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
      })

      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
      })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
      });
  },
});

export const { clearSearchedUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;