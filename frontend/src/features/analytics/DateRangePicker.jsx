import { useState } from "react";
import "./DateRangePicker.css";

const DateRangePicker = ({ onApply, onClear, initialStartDate = "", initialEndDate = "" }) => {
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [preset, setPreset] = useState("");

    const presets = [
        { label: "This Week", getValue: () => getThisWeek() },
        { label: "This Month", getValue: () => getThisMonth() },
        { label: "Last 3 Months", getValue: () => getLast3Months() },
        { label: "Last 6 Months", getValue: () => getLast6Months() },
        { label: "This Year", getValue: () => getThisYear() },
    ];

    const getThisWeek = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));
        return { startDate: formatDate(start), endDate: formatDate(end) };
    };

    const getThisMonth = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: formatDate(start), endDate: formatDate(end) };
    };

    const getLast3Months = () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 3, 1);
        return { startDate: formatDate(start), endDate: formatDate(end) };
    };

    const getLast6Months = () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 6, 1);
        return { startDate: formatDate(start), endDate: formatDate(end) };
    };

    const getThisYear = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return { startDate: formatDate(start), endDate: formatDate(end) };
    };

    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    const handlePresetClick = (presetItem) => {
        const { startDate: start, endDate: end } = presetItem.getValue();
        setStartDate(start);
        setEndDate(end);
        setPreset(presetItem.label);
        onApply({ startDate: start, endDate: end });
    };

    const handleApply = () => {
        onApply({ startDate, endDate });
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        setPreset("");
        onClear();
    };

    return (
        <div className="date-range-picker">
            <div className="date-inputs">
                <div className="date-input-group">
                    <label className="date-label">From</label>
                    <input
                        type="date"
                        className="date-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="date-input-group">
                    <label className="date-label">To</label>
                    <input
                        type="date"
                        className="date-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="preset-buttons">
                {presets.map((p) => (
                    <button
                        key={p.label}
                        className={`preset-btn ${preset === p.label ? "preset-btn-active" : ""}`}
                        onClick={() => handlePresetClick(p)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="date-actions">
                <button className="date-btn date-btn-clear" onClick={handleClear}>
                    Clear
                </button>
                <button className="date-btn date-btn-apply" onClick={handleApply}>
                    Apply
                </button>
            </div>
        </div>
    );
};

export default DateRangePicker;