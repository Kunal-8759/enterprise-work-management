import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import "./Chart.css";

const PriorityDistributionChart = ({ data }) => {
    const chartData = [
        { name: "Low", value: data.low, fill: "var(--color-success)" },
        { name: "Medium", value: data.medium, fill: "var(--color-warning)" },
        { name: "High", value: data.high, fill: "var(--color-danger)" },
        { name: "Urgent", value: data.urgent, fill: "var(--color-danger)" },
    ];

    const hasData = chartData.some((item) => item.value > 0);

    if (!hasData) {
        return (
            <div className="chart-empty">
                <p>No priority data available</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3 className="chart-title">Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            borderRadius: "var(--radius-md)",
                        }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriorityDistributionChart;