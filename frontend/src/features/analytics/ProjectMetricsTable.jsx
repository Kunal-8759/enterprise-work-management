import { useNavigate } from "react-router-dom";
import "./ProjectMetricsTable.css";

const ProjectMetricsTable = ({ data }) => {
    const navigate = useNavigate();

    console.log("Project Metrics Data:", data); // Debug log to check data structure

    const getHealthBadge = (health) => {
        switch (health) {
            case "good":
                return <span className="health-badge health-badge--good">🟢 Good</span>;
            case "at-risk":
                return <span className="health-badge health-badge--at-risk">🟡 At Risk</span>;
            case "critical":
                return <span className="health-badge health-badge--critical">🔴 Critical</span>;
            default:
                return <span className="health-badge">⚪ Unknown</span>;
        }
    };

    if (data.length === 0) {
        return (
            <div className="table-empty">
                <p>No project data available</p>
            </div>
        );
    }

    return (
        <div className="project-metrics">
            <h3 className="chart-title">Project Health</h3>
            <div className="table-wrapper">
                <table className="metrics-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Tasks</th>
                            <th>Completed</th>
                            <th>In Progress</th>
                            <th>Completion Rate</th>
                            <th>Overdue</th>
                            <th>Health</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((project) => (
                            <tr
                                key={project.projectId}
                                className="metrics-table-row"
                                onClick={() => navigate(`/projects/${project.projectId}`)}
                            >
                                <td className="project-name">{project.projectName}</td>
                                <td>{project.totalTasks}</td>
                                <td>{project.completedTasks}</td>
                                <td>{project.inProgressTasks}</td>
                                <td>
                                    <div className="progress-cell">
                                        <div className="progress-bar-bg">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${project.completionRate}%` }}
                                            />
                                        </div>
                                        <span className="progress-percent">{project.completionRate}%</span>
                                    </div>
                                </td>
                                <td className={project.overdueTasks > 0 ? "overdue-value" : ""}>
                                    {project.overdueTasks}
                                </td>
                                <td>{getHealthBadge(project.health)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectMetricsTable;