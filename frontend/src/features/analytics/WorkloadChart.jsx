import "./WorkloadChart.css";

const WorkloadChart = ({ data }) => {
    const maxTasks = Math.max(...data.map((w) => w.assignedTasks), 1);

    if (data.length === 0) {
        return (
            <div className="chart-empty">
                <p>No workload data available</p>
            </div>
        );
    }

    return (
        <div className="workload-container">
            <h3 className="chart-title">Team Workload Distribution</h3>
            <div className="workload-list">
                {data.map((member) => (
                    <div key={member.userId} className="workload-item">
                        <div className="workload-info">
                            <div className="workload-user">
                                <span className="workload-name">{member.userName}</span>
                                <span className="workload-role">{member.userRole}</span>
                            </div>
                            <div className="workload-stats">
                                <span className="workload-assigned">{member.assignedTasks} tasks</span>
                                <span className="workload-completed">{member.completedTasks} completed</span>
                            </div>
                        </div>
                        <div className="workload-bar-container">
                            <div
                                className="workload-bar"
                                style={{
                                    width: `${(member.assignedTasks / maxTasks) * 100}%`,
                                }}
                            >
                                <div
                                    className="workload-bar-completed"
                                    style={{
                                        width: `${(member.completedTasks / member.assignedTasks) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="workload-percent">{member.completionRate}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkloadChart;