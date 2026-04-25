import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./Chart.css";

const ProjectStatusChart = ({ data }) => {
    const chartData = [
        { name: "Planning", value: data.planning, color: "var(--color-text-muted)" },
        { name: "Active", value: data.active, color: "var(--color-primary)" },
        { name: "On Hold", value: data.onHold, color: "var(--color-warning)" },
        { name: "Completed", value: data.completed, color: "var(--color-success)" },
    ].filter((item) => item.value > 0);

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                <p>No project status data available</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3 className="chart-title">Projects by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            borderRadius: "var(--radius-md)",
                        }}
                    />
                    <Legend wrapperStyle={{ color: "var(--color-text-secondary)" }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProjectStatusChart;