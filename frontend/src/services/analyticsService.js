import axiosInstance from "./api.js";

export const fetchAnalyticsOverview = async (params = {}) => {
  const { data } = await axiosInstance.get("/analytics/overview", { params });
  return data.data;
};

export const exportAnalyticsCSV = async (params = {}) => {
  const response = await axiosInstance.get("/analytics/export/csv", {
    params,
    responseType: "blob",
  });
  return response.data;
};