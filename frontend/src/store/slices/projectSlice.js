import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/api.js";

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/projects");
      return data.data.projects;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch projects"
      );
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/projects/${id}`);
      return data.data.project;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project"
      );
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/projects", projectData);
      return data.data.project;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create project"
      );
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/projects/${id}`, updateData);
      // Re-fetch to get fully populated data (with names, emails etc.)
      const { data } = await axiosInstance.get(`/projects/${id}`);
      return data.data.project;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update project"
      );
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete project"
      );
    }
  }
);

export const addProjectMember = createAsyncThunk(
  "projects/addMember",
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/projects/${projectId}/members`, { memberId });
      // Re-fetch to get fully populated data
      const { data } = await axiosInstance.get(`/projects/${projectId}`);
      return data.data.project;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add member"
      );
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  "projects/removeMember",
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${projectId}/members/${memberId}`);
      // Re-fetch to get fully populated data
      const { data } = await axiosInstance.get(`/projects/${projectId}`);
      return data.data.project;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove member"
      );
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [],
    selectedProject: null,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetch by id
      .addCase(fetchProjectById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createProject.fulfilled, (state, action) => {
        // Remove any existing entry with the same _id before prepending,
        // preventing duplicate-key warnings when fetchProjects already loaded it.
        state.projects = state.projects.filter(
          (p) => p._id !== action.payload._id
        );
        state.projects.unshift(action.payload);
      })

      // update
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.projects[index] = action.payload;
        if (state.selectedProject?._id === action.payload._id) {
          state.selectedProject = action.payload;
        }
      })

      // delete
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (state.selectedProject?._id === action.payload) {
          state.selectedProject = null;
        }
      })

      // add member
      .addCase(addProjectMember.fulfilled, (state, action) => {
        if (state.selectedProject?._id === action.payload._id) {
          state.selectedProject = action.payload;
        }
      })

      // remove member
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        if (state.selectedProject?._id === action.payload._id) {
          state.selectedProject = action.payload;
        }
      });
  },
});

export const { clearSelectedProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;