import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Search, Shield, UserCheck, UserX } from "lucide-react";
import { toast } from "react-toastify";
import {
    fetchAllUsers,
    updateUserRole,
    updateUserStatus,
} from "../../store/slices/userSlice.js";
import { ROLES } from "../../utils/constants.js";
import "./Users.css";

const roleConfig = {
    Admin: { className: "role-admin" },
    Manager: { className: "role-manager" },
    Employee: { className: "role-employee" },
};

const statusConfig = {
    Active: { className: "status-active-badge" },
    Inactive: { className: "status-inactive-badge" },
};

const Users = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.users);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const handleRoleChange = async (userId, role) => {
        setUpdatingId(userId);
        const result = await dispatch(updateUserRole({ userId, role }));
        if (updateUserRole.fulfilled.match(result)) {
            toast.success("Role updated successfully");
        } else {
            toast.error(result.payload || "Failed to update role");
        }
        setUpdatingId(null);
    };

    const handleStatusToggle = async (user) => {
        const newStatus = user.status === "Active" ? "Inactive" : "Active";
        setUpdatingId(user._id);
        const result = await dispatch(updateUserStatus({ userId: user._id, status: newStatus }));
        if (updateUserStatus.fulfilled.match(result)) {
            toast.success(result.payload?.message || "Status updated");
        } else {
            toast.error(result.payload || "Failed to update status");
        }
        setUpdatingId(null);
    };

    const filtered = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        const matchesStatus = statusFilter === "All" || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) {
        return (
            <div className="users-loader">
                <Loader2 size={32} className="users-loader-icon" />
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="users-page">
            {/* Header */}
            <div className="users-header">
                <h2 className="users-count">
                    {users.length} {users.length === 1 ? "User" : "Users"}
                </h2>
            </div>

            {/* Filters */}
            <div className="users-filters">
                <div className="users-search-wrapper">
                    <Search size={16} className="users-search-icon" />
                    <input
                        className="users-search-input"
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="users-filter-group">
                    <select
                        className="users-filter-select"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="All">All Roles</option>
                        {Object.values(ROLES).map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    <select
                        className="users-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="users-empty">
                    <p className="users-empty-text">No users found.</p>
                </div>
            ) : (
                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Active</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => (
                                <tr key={u._id} className={updatingId === u._id ? "row-updating" : ""}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{u.name}</span>
                                                <span className="user-email">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${roleConfig[u.role]?.className}`}>
                                            <Shield size={11} />
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${statusConfig[u.status]?.className}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="cell-muted">
                                        {u.lastActivity
                                            ? new Date(u.lastActivity).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })
                                            : "—"}
                                    </td>
                                    <td className="cell-muted">
                                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </td>
                                    <td>
                                        <div className="user-actions">
                                            <select
                                                className="role-select"
                                                value={u.role}
                                                disabled={updatingId === u._id}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            >
                                                {Object.values(ROLES).map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            <button
                                                className={`status-toggle-btn ${u.status === "Active"
                                                        ? "status-toggle-deactivate"
                                                        : "status-toggle-activate"
                                                    }`}
                                                disabled={updatingId === u._id}
                                                onClick={() => handleStatusToggle(u)}
                                            >
                                                {u.status === "Active"
                                                    ? <><UserX size={14} /> Deactivate</>
                                                    : <><UserCheck size={14} /> Activate</>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Users;