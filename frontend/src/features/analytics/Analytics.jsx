import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Loader2, Download } from "lucide-react";
import { fetchAnalytics, exportAnalytics, setDateRange } from "../../store/slices/analyticsSlice.js";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import SummaryCards from "./SummaryCards.jsx";
import CompletionTrendChart from "./CompletionTrendChart.jsx";
import StatusDistributionChart from "./StatusDistributionChart.jsx";
import PriorityDistributionChart from "./PriorityDistributionChart.jsx";
import ProjectStatusChart from "./ProjectStatusChart.jsx";
import ProjectMetricsTable from "./ProjectMetricsTable.jsx";
import WorkloadChart from "./WorkloadChart.jsx";
import DateRangePicker from "./DateRangePicker.jsx";
import "./Analytics.css";

const Analytics = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { data, loading, exporting, dateRange } = useSelector((state) => state.analytics);
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  // Role-based access - Only Admin and Manager can view analytics
  if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.MANAGER) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    dispatch(fetchAnalytics(localDateRange));
  }, [dispatch, localDateRange]);

  const handleDateApply = ({ startDate, endDate }) => {
    const newRange = { startDate, endDate };
    setLocalDateRange(newRange);
    dispatch(setDateRange(newRange));
  };

  const handleDateClear = () => {
    const emptyRange = { startDate: "", endDate: "" };
    setLocalDateRange(emptyRange);
    dispatch(setDateRange(emptyRange));
  };

  const handleExportCSV = () => {
    dispatch(exportAnalytics(localDateRange));
  };

  if (loading) {
    return (
      <div className="analytics-loader">
        <Loader2 size={32} className="analytics-loader-icon" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Analytics Dashboard</h1>
          <p className="analytics-subtitle">Track your team's performance and project metrics</p>
        </div>
        <button className="export-btn" onClick={handleExportCSV} disabled={exporting}>
          <Download size={16} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="analytics-filters">
        <DateRangePicker
          onApply={handleDateApply}
          onClear={handleDateClear}
          initialStartDate={localDateRange.startDate}
          initialEndDate={localDateRange.endDate}
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards data={data.summary} />

      {/* Charts Grid */}
      <div className="analytics-grid">
        {/* Full Width - Completion Trend */}
        <div className="analytics-grid-full">
          <CompletionTrendChart data={data.completionTrend} />
        </div>

        {/* Status Distribution */}
        <StatusDistributionChart data={data.statusDistribution} />

        {/* Priority Distribution */}
        <PriorityDistributionChart data={data.priorityDistribution} />

        {/* Projects by Status */}
        <ProjectStatusChart data={data.projectStatusDistribution} />

        {/* Full Width - Project Metrics Table */}
        <div className="analytics-grid-full">
          <ProjectMetricsTable data={data.projectMetrics} />
        </div>

        {/* Full Width - Workload Chart */}
        <div className="analytics-grid-full">
          <WorkloadChart data={data.workload} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;