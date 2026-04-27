// No React, no DOM — pure Redux reducer logic.
// analyticsService is mocked so import.meta.env never loads.

jest.mock("../../services/analyticsService.js", () => ({
  fetchAnalyticsOverview: jest.fn(),
  exportAnalyticsCSV: jest.fn(),
}));

// api.js is imported transitively — mock it too
jest.mock("../../services/api.js", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    interceptors: {
      request:  { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

import analyticsReducer, {
  setDateRange,
  clearAnalyticsError,
  fetchAnalytics,
  exportAnalytics,
} from "../../store/slices/analyticsSlice.js";

//  helpers 
const pending   = (thunk)          => ({ type: thunk.pending.type });
const fulfilled = (thunk, payload) => ({ type: thunk.fulfilled.type, payload });
const rejected  = (thunk, payload) => ({ type: thunk.rejected.type, payload });

const initialState = {
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
  dateRange: { startDate: "", endDate: "" },
};

//  Initial state 
describe("analyticsSlice — initial state", () => {
  it("returns the correct initial state", () => {
    const state = analyticsReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });

  it("summary starts with all zeros", () => {
    const state = analyticsReducer(undefined, { type: "@@INIT" });
    expect(state.data.summary.totalProjects).toBe(0);
    expect(state.data.summary.totalTasks).toBe(0);
    expect(state.data.summary.completedTasks).toBe(0);
    expect(state.data.summary.overdueTasks).toBe(0);
    expect(state.data.summary.overallCompletionRate).toBe(0);
  });

  it("distributions start with all zeros", () => {
    const state = analyticsReducer(undefined, { type: "@@INIT" });
    expect(state.data.statusDistribution).toEqual({ todo: 0, inProgress: 0, done: 0 });
    expect(state.data.priorityDistribution).toEqual({ low: 0, medium: 0, high: 0, urgent: 0 });
  });

  it("loading and exporting start as false", () => {
    const state = analyticsReducer(undefined, { type: "@@INIT" });
    expect(state.loading).toBe(false);
    expect(state.exporting).toBe(false);
  });

  it("dateRange starts as empty strings", () => {
    const state = analyticsReducer(undefined, { type: "@@INIT" });
    expect(state.dateRange).toEqual({ startDate: "", endDate: "" });
  });
});

//  setDateRange 
describe("analyticsSlice — setDateRange", () => {
  it("sets startDate and endDate correctly", () => {
    const state = analyticsReducer(
      initialState,
      setDateRange({ startDate: "2024-01-01", endDate: "2024-12-31" })
    );
    expect(state.dateRange.startDate).toBe("2024-01-01");
    expect(state.dateRange.endDate).toBe("2024-12-31");
  });

  it("replaces an existing dateRange fully", () => {
    const withRange = {
      ...initialState,
      dateRange: { startDate: "2023-01-01", endDate: "2023-06-30" },
    };
    const state = analyticsReducer(
      withRange,
      setDateRange({ startDate: "2024-07-01", endDate: "2024-12-31" })
    );
    expect(state.dateRange.startDate).toBe("2024-07-01");
    expect(state.dateRange.endDate).toBe("2024-12-31");
  });

  it("can be set to empty strings to clear the range", () => {
    const withRange = {
      ...initialState,
      dateRange: { startDate: "2024-01-01", endDate: "2024-12-31" },
    };
    const state = analyticsReducer(
      withRange,
      setDateRange({ startDate: "", endDate: "" })
    );
    expect(state.dateRange).toEqual({ startDate: "", endDate: "" });
  });
});

//  clearAnalyticsError 
describe("analyticsSlice — clearAnalyticsError", () => {
  it("sets error to null", () => {
    const state = analyticsReducer(
      { ...initialState, error: "Something went wrong" },
      clearAnalyticsError()
    );
    expect(state.error).toBeNull();
  });

  it("does not affect other state fields", () => {
    const state = analyticsReducer(
      { ...initialState, loading: true, error: "error" },
      clearAnalyticsError()
    );
    expect(state.loading).toBe(true);
  });
});

//  fetchAnalytics 
describe("analyticsSlice — fetchAnalytics", () => {
  it("pending: sets loading=true and clears error", () => {
    const state = analyticsReducer(
      { ...initialState, error: "old error" },
      pending(fetchAnalytics)
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fulfilled: replaces data with the payload and sets loading=false", () => {
    const payload = {
      summary: {
        totalProjects: 5,
        totalTasks: 20,
        completedTasks: 10,
        overdueTasks: 2,
        overallCompletionRate: 50,
      },
      completionTrend: [{ date: "2024-01-01", count: 3 }],
      statusDistribution: { todo: 5, inProgress: 8, done: 7 },
      priorityDistribution: { low: 4, medium: 8, high: 5, urgent: 3 },
      projectStatusDistribution: { planning: 1, active: 3, onHold: 0, completed: 1 },
      projectMetrics: [{ projectId: "p1", completionRate: 60 }],
      workload: [{ userId: "u1", taskCount: 5 }],
    };
    const state = analyticsReducer(
      { ...initialState, loading: true },
      fulfilled(fetchAnalytics, payload)
    );
    expect(state.loading).toBe(false);
    expect(state.data.summary.totalProjects).toBe(5);
    expect(state.data.summary.completedTasks).toBe(10);
    expect(state.data.statusDistribution.done).toBe(7);
    expect(state.data.completionTrend).toHaveLength(1);
    expect(state.data.projectMetrics).toHaveLength(1);
    expect(state.data.workload).toHaveLength(1);
  });

  it("rejected: stores error and sets loading=false", () => {
    const state = analyticsReducer(
      { ...initialState, loading: true },
      rejected(fetchAnalytics, "Failed to fetch analytics data")
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch analytics data");
  });

  it("rejected: does not wipe existing data", () => {
    const existingData = { ...initialState.data, summary: { totalProjects: 3 } };
    const state = analyticsReducer(
      { ...initialState, data: existingData, loading: true },
      rejected(fetchAnalytics, "Network error")
    );
    expect(state.data.summary.totalProjects).toBe(3);
  });
});

//  exportAnalytics 
describe("analyticsSlice — exportAnalytics", () => {
  it("pending: sets exporting=true", () => {
    const state = analyticsReducer(initialState, pending(exportAnalytics));
    expect(state.exporting).toBe(true);
  });

  it("pending: does not change loading", () => {
    const state = analyticsReducer(initialState, pending(exportAnalytics));
    expect(state.loading).toBe(false);
  });

  it("fulfilled: sets exporting=false", () => {
    const state = analyticsReducer(
      { ...initialState, exporting: true },
      fulfilled(exportAnalytics, true)
    );
    expect(state.exporting).toBe(false);
  });

  it("fulfilled: does not affect error", () => {
    const state = analyticsReducer(
      { ...initialState, exporting: true, error: null },
      fulfilled(exportAnalytics, true)
    );
    expect(state.error).toBeNull();
  });

  it("rejected: sets exporting=false and stores error", () => {
    const state = analyticsReducer(
      { ...initialState, exporting: true },
      rejected(exportAnalytics, "Failed to export CSV")
    );
    expect(state.exporting).toBe(false);
    expect(state.error).toBe("Failed to export CSV");
  });
});