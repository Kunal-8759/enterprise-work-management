import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAnalyticsOverview, exportAnalyticsCSV } from "../../services/analyticsService.js";

// Async Thunks
export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchOverview",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await fetchAnalyticsOverview(filters);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics data"
      );
    }
  }
);

export const exportAnalytics = createAsyncThunk(
  "analytics/exportCSV",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const blob = await exportAnalyticsCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `analytics-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export CSV"
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    data: {
      summary: {
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        overallCompletionRate: 0,
      },
      completionTrend: [],
      statusDistribution: { todo: 0, inProgress: 0, done: 0 },
      priorityDistribution: { low: 0, medium: 0, high: 0, urgent: 0 },
      projectStatusDistribution: { planning: 0, active: 0, onHold: 0, completed: 0 },
      projectMetrics: [],
      workload: [],
    },
    loading: false,
    exporting: false,
    error: null,
    dateRange: {
      startDate: "",
      endDate: "",
    },
  },
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(exportAnalytics.pending, (state) => {
        state.exporting = true;
      })
      .addCase(exportAnalytics.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportAnalytics.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
      });
  },
});

export const { setDateRange, clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;