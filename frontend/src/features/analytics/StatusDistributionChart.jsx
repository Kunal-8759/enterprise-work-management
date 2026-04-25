import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./Chart.css";

const StatusDistributionChart = ({ data }) => {
    const chartData = [
        { name: "Todo", value: data.todo, color: "var(--color-text-muted)" },
        { name: "In Progress", value: data.inProgress, color: "var(--color-primary)" },
        { name: "Done", value: data.done, color: "var(--color-success)" },
    ].filter((item) => item.value > 0);

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                <p>No status data available</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3 className="chart-title">Tasks by Status</h3>
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

export default StatusDistributionChart;