import { formatDistanceToNow } from "date-fns";
import "./ActivityFeed.css";

const activityTypeMap = {
  task_assigned: { label: "Task Assigned", color: "activity-teal" },
  task_status_changed: { label: "Status Changed", color: "activity-warning" },
  comment_added: { label: "Comment Added", color: "activity-info" },
  member_added: { label: "Member Added", color: "activity-emerald" },
};

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="activity-empty">
        <p>No recent activity yet.</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity) => {
        const typeInfo = activityTypeMap[activity.type] || {
          label: activity.type,
          color: "activity-default",
        };

        return (
          <div key={activity._id} className="activity-item">
            {/* ── Avatar ─────────────────────────────────────────── */}
            <div className="activity-avatar">
              {activity.sender?.name?.charAt(0).toUpperCase()}
            </div>

            {/* ── Content ────────────────────────────────────────── */}
            <div className="activity-content">
              <p className="activity-message">{activity.message}</p>
              <div className="activity-meta">
                <span className={`activity-badge ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                <span className="activity-time">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;