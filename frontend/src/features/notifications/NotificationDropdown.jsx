import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Trash2, BellOff, Loader2 } from "lucide-react";
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../../store/slices/notificationSlice.js";
import "./NotificationDropdown.css";

const typeColorMap = {
    task_assigned: "notif-badge-teal",
    task_status_changed: "notif-badge-warning",
    comment_added: "notif-badge-info",
    member_added: "notif-badge-emerald",
};

const typeLabelMap = {
    task_assigned: "Assigned",
    task_status_changed: "Status",
    comment_added: "Comment",
    member_added: "Member",
};

const NotificationDropdown = ({ onClose , bellRef}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, loading } = useSelector(
        (state) => state.notifications
    );

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    // close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                bellRef?.current &&
                !bellRef.current.contains(e.target)  // ← don't close when clicking the bell
            ) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleNotificationClick = async (notification) => {
        // mark as read on click
        if (!notification.read) {
            await dispatch(markAsRead(notification._id));
        }

        // navigate to related resource
        if (notification.referenceModel === "Task") {
            navigate(`/tasks?taskId=${notification.reference}`);
        } else if (notification.referenceModel === "Project") {
            navigate(`/projects/${notification.reference}`);
        }

        onClose();
    };

    const handleMarkAllAsRead = (e) => {
        e.stopPropagation();
        dispatch(markAllAsRead());
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        dispatch(deleteNotification(id));
    };

    return (
        <div className="notif-dropdown" ref={dropdownRef}>
            {/*  Header  */}
            <div className="notif-header">
                <div className="notif-header-left">
                    <h3 className="notif-title">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="notif-count">{unreadCount} new</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        className="notif-mark-all"
                        onClick={handleMarkAllAsRead}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/*  Body  */}
            <div className="notif-body">
                {loading ? (
                    <div className="notif-loader">
                        <Loader2 size={24} className="notif-loader-icon" />
                        <p>Loading...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notif-empty">
                        <BellOff size={32} className="notif-empty-icon" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`notif-item ${!notification.read ? "notif-item-unread" : ""}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            {/* unread dot */}
                            <div className="notif-dot-wrapper">
                                {!notification.read && <span className="notif-dot" />}
                            </div>

                            {/* content */}
                            <div className="notif-content">
                                <div className="notif-content-top">
                                    <span
                                        className={`notif-badge ${typeColorMap[notification.type] || "notif-badge-default"}`}
                                    >
                                        {typeLabelMap[notification.type] || notification.type}
                                    </span>
                                    <span className="notif-time">
                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="notif-message">{notification.message}</p>
                                {notification.sender && (
                                    <p className="notif-sender">
                                        by {notification.sender.name}
                                    </p>
                                )}
                            </div>

                            {/* delete button */}
                            <button
                                className="notif-delete"
                                onClick={(e) => handleDelete(e, notification._id)}
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;