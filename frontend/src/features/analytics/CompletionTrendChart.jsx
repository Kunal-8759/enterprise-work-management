import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import "./Chart.css";

const CompletionTrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>No trend data available</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3 className="chart-title">Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-primary)",
                        }}
                    />
                    <Legend wrapperStyle={{ color: "var(--color-text-secondary)" }} />
                    <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="var(--color-success)"
                        strokeWidth={2}
                        name="Completed"
                        dot={{ r: 4, fill: "var(--color-success)" }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="created"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        name="Created"
                        dot={{ r: 4, fill: "var(--color-primary)" }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="inProgress"
                        stroke="var(--color-warning)"
                        strokeWidth={2}
                        name="In Progress"
                        dot={{ r: 4, fill: "var(--color-warning)" }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CompletionTrendChart;