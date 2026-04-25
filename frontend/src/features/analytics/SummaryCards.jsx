import { FolderKanban, CheckSquare, CircleCheck, Clock } from "lucide-react";
import "./SummaryCards.css";

const SummaryCards = ({ data }) => {
  const cards = [
    {
      label: "Total Projects",
      value: data.totalProjects,
      icon: FolderKanban,
      color: "primary",
    },
    {
      label: "Total Tasks",
      value: data.totalTasks,
      icon: CheckSquare,
      color: "accent",
    },
    {
      label: "Completed Tasks",
      value: data.completedTasks,
      icon: CircleCheck,
      color: "success",
    },
    {
      label: "Overdue Tasks",
      value: data.overdueTasks,
      icon: Clock,
      color: "danger",
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <div key={card.label} className={`summary-card summary-card--${card.color}`}>
          <div className="summary-card-header">
            <card.icon className="summary-card-icon" />
          </div>
          <div className="summary-card-body">
            <p className="summary-card-label">{card.label}</p>
            <p className="summary-card-value">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;