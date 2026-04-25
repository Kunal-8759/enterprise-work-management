import "./MetricCard.css";

const colorMap = {
  emerald: "metric-card-emerald",
  teal: "metric-card-teal",
  success: "metric-card-success",
  warning: "metric-card-warning",
};

const MetricCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="metric-card">
      <div className={`metric-card-icon-wrapper ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <div className="metric-card-info">
        <span className="metric-card-value">{value}</span>
        <span className="metric-card-label">{label}</span>
      </div>
    </div>
  );
};

export default MetricCard;