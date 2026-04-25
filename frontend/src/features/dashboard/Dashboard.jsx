import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FolderKanban,
  CheckSquare,
  CircleCheck,
  Clock,
  Loader2,
} from "lucide-react";
import "./Dashboard.css";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice.js";
import MetricCard from "./MetricCard.jsx";
import ActivityFeed from "./ActivityFeed.jsx";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { projectStats, taskStats, recentActivity, loading } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const metrics = [
    {
      label: "Total Projects",
      value: projectStats?.total ?? 0,
      icon: FolderKanban,
      color: "emerald",
    },
    {
      label: "Total Tasks",
      value: taskStats?.total ?? 0,
      icon: CheckSquare,
      color: "teal",
    },
    {
      label: "Completed Tasks",
      value: taskStats?.done ?? 0,
      icon: CircleCheck,
      color: "success",
    },
    {
      label: "Pending Tasks",
      value: (taskStats?.todo ?? 0) + (taskStats?.inProgress ?? 0),
      icon: Clock,
      color: "warning",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loader">
        <Loader2 size={32} className="dashboard-loader-icon" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/*  Metrics  */}
      <section className="dashboard-metrics">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {/*  Activity Feed  */}
      <section className="dashboard-activity">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Recent Activity</h2>
        </div>
        <ActivityFeed activities={recentActivity} />
      </section>
    </div>
  );
};

export default Dashboard;