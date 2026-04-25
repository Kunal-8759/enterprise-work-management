import { format, isPast } from "date-fns";
import { Edit2, Trash2, AlertCircle } from "lucide-react";
import { typeConfig, priorityConfig } from "./TaskCard.jsx";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import "./TaskListView.css";

const TaskListView = ({ tasks, onTaskClick, onEditTask, onDeleteTask }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;

  const canEdit = (task) => {
    if (isAdmin || isManager) return true;
    return task.assignee?._id === user?.id;
  };

  if (tasks.length === 0) {
    return (
      <div className="list-empty">
        <p>No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="task-list-wrapper">
      <table className="task-list-table">
        <thead>
          <tr className="task-list-head">
            <th className="task-list-th">Title</th>
            <th className="task-list-th">Type</th>
            <th className="task-list-th">Priority</th>
            <th className="task-list-th">Status</th>
            <th className="task-list-th">Project</th>
            <th className="task-list-th">Assignee</th>
            <th className="task-list-th">Due Date</th>
            <th className="task-list-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const type = typeConfig[task.type] || typeConfig.feature;
            const priority = priorityConfig[task.priority] || priorityConfig.medium;
            const TypeIcon = type.icon;
            const PriorityIcon = priority.icon;
            const isOverdue =
              task.dueDate &&
              isPast(new Date(task.dueDate)) &&
              task.status !== "done";
            const isUrgentOverdue = task.priority === "urgent" && isOverdue;

            return (
              <tr
                key={task._id}
                className="task-list-row"
                onClick={() => onTaskClick(task)}
              >
                {/* Title */}
                <td className="task-list-td task-list-title">
                  {task.title}
                </td>

                {/* Type */}
                <td className="task-list-td">
                  <span className={`task-type-badge ${type.className}`}>
                    <TypeIcon size={11} />
                    {type.label}
                  </span>
                </td>

                {/* Priority */}
                <td className="task-list-td">
                  <span
                    className={`task-priority-badge ${priority.className} ${isUrgentOverdue ? "task-priority-pulse" : ""}`}
                  >
                    {PriorityIcon && <PriorityIcon size={11} />}
                    {priority.label}
                  </span>
                </td>

                {/* Status */}
                <td className="task-list-td">
                  <span className={`task-status-badge task-status-${task.status}`}>
                    {task.status === "in-progress"
                      ? "In Progress"
                      : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </td>

                {/* Project */}
                <td className="task-list-td task-list-secondary">
                  {task.project?.title || "—"}
                </td>

                {/* Assignee */}
                <td className="task-list-td">
                  {task.assignee ? (
                    <div className="task-list-assignee">
                      <div className="task-list-avatar">
                        {task.assignee.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="task-list-secondary">
                        {task.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="task-list-secondary">Unassigned</span>
                  )}
                </td>

                {/* Due Date */}
                <td className="task-list-td">
                  {task.dueDate ? (
                    <span
                      className={`task-list-date ${isOverdue ? "task-list-date-overdue" : ""}`}
                    >
                      {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </span>
                  ) : (
                    <span className="task-list-secondary">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="task-list-td">
                  <div
                    className="task-list-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canEdit(task) && (
                      <button
                        className="task-list-btn task-list-btn-edit"
                        onClick={() => onEditTask(task)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        className="task-list-btn task-list-btn-delete"
                        onClick={() => onDeleteTask(task._id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListView;