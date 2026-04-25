import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/api.js";

export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/tasks", { params: filters });
      return data.data.tasks;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/tasks/${id}`);
      return data.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch task"
      );
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (taskData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/tasks", taskData);
      return data.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create task"
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/tasks/${id}`, updateData);
      return data.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update task"
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete task"
      );
    }
  }
);

export const addComment = createAsyncThunk(
  "tasks/addComment",
  async ({ taskId, text }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/tasks/${taskId}/comments`,
        { text }
      );
      return { taskId, comments: data.data.comments };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "tasks/deleteComment",
  async ({ taskId, commentId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}/comments/${commentId}`);
      return { taskId, commentId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

export const uploadAttachment = createAsyncThunk(
  "tasks/uploadAttachment",
  async ({ taskId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axiosInstance.post(
        `/tasks/${taskId}/attachments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return { taskId, attachments: data.data.attachments };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload attachment"
      );
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  "tasks/deleteAttachment",
  async ({ taskId, attachmentId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(
        `/tasks/${taskId}/attachments/${attachmentId}`
      );
      return { taskId, attachments: data.data.attachments };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete attachment"
      );
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    selectedTask: null,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
    updateTaskStatusLocally: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find((t) => t._id === taskId);
      if (task) task.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) state.tasks[index] = action.payload;
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.selectedTask?._id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.selectedTask?._id === action.payload.taskId) {
          state.selectedTask.comments = action.payload.comments;
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        if (state.selectedTask?._id === action.payload.taskId) {
          state.selectedTask.comments = state.selectedTask.comments.filter(
            (c) => c._id !== action.payload.commentId
          );
        }
      })
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        if (state.selectedTask?._id === action.payload.taskId) {
          state.selectedTask.attachments = action.payload.attachments;
        }
      })
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        if (state.selectedTask?._id === action.payload.taskId) {
          state.selectedTask.attachments = action.payload.attachments;
        }
      });
  },
});

export const {
  clearSelectedTask,
  clearTaskError,
  updateTaskStatusLocally,
} = taskSlice.actions;

export default taskSlice.reducer;