
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

import axiosInstance from "../../services/api.js";
import {
  fetchAnalyticsOverview,
  exportAnalyticsCSV,
} from "../../services/analyticsService.js";

beforeEach(() => jest.clearAllMocks());

//  fetchAnalyticsOverview 
describe("analyticsService — fetchAnalyticsOverview", () => {
  const mockData = {
    summary: { totalProjects: 4, totalTasks: 18, completedTasks: 9 },
    completionTrend: [],
    statusDistribution: { todo: 3, inProgress: 6, done: 9 },
  };

  it("calls GET /analytics/overview with no params by default", async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: mockData } });
    await fetchAnalyticsOverview();
    expect(axiosInstance.get).toHaveBeenCalledWith("/analytics/overview", { params: {} });
  });

  it("returns data.data from the response", async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: mockData } });
    const result = await fetchAnalyticsOverview();
    expect(result).toEqual(mockData);
  });

  it("passes params to the GET call", async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: mockData } });
    const params = { startDate: "2024-01-01", endDate: "2024-12-31" };
    await fetchAnalyticsOverview(params);
    expect(axiosInstance.get).toHaveBeenCalledWith("/analytics/overview", { params });
  });

  it("throws when the API call fails", async () => {
    axiosInstance.get.mockRejectedValue(new Error("Network error"));
    await expect(fetchAnalyticsOverview()).rejects.toThrow("Network error");
  });

  it("returns the summary with correct shape", async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: mockData } });
    const result = await fetchAnalyticsOverview();
    expect(result.summary).toHaveProperty("totalProjects");
    expect(result.summary).toHaveProperty("totalTasks");
    expect(result.summary).toHaveProperty("completedTasks");
  });

  it("can be called multiple times independently", async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: mockData } });
    await fetchAnalyticsOverview({ startDate: "2024-01-01" });
    await fetchAnalyticsOverview({ startDate: "2024-06-01" });
    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
  });
});

//  exportAnalyticsCSV 
describe("analyticsService — exportAnalyticsCSV", () => {
  const mockBlob = new Blob(["col1,col2\nval1,val2"], { type: "text/csv" });

  it("calls GET /analytics/export/csv with responseType blob", async () => {
    axiosInstance.get.mockResolvedValue({ data: mockBlob });
    await exportAnalyticsCSV();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/analytics/export/csv",
      expect.objectContaining({ responseType: "blob" })
    );
  });

  it("calls with no params by default", async () => {
    axiosInstance.get.mockResolvedValue({ data: mockBlob });
    await exportAnalyticsCSV();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/analytics/export/csv",
      expect.objectContaining({ params: {} })
    );
  });

  it("passes params to the GET call", async () => {
    axiosInstance.get.mockResolvedValue({ data: mockBlob });
    const params = { startDate: "2024-01-01", endDate: "2024-06-30" };
    await exportAnalyticsCSV(params);
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/analytics/export/csv",
      expect.objectContaining({ params })
    );
  });

  it("returns response.data (the blob)", async () => {
    axiosInstance.get.mockResolvedValue({ data: mockBlob });
    const result = await exportAnalyticsCSV();
    expect(result).toBe(mockBlob);
  });

  it("throws when the API call fails", async () => {
    axiosInstance.get.mockRejectedValue(new Error("Export failed"));
    await expect(exportAnalyticsCSV()).rejects.toThrow("Export failed");
  });
});