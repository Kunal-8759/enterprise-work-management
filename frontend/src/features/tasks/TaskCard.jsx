import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Bug, Sparkles, ArrowUp, AlertCircle } from "lucide-react";
import { format, isPast } from "date-fns";
import "./TaskCard.css";

export const typeConfig = {
  bug: {
    label: "Bug",
    icon: Bug,
    className: "task-type-bug",
  },
  feature: {
    label: "Feature",
    icon: Sparkles,
    className: "task-type-feature",
  },
  improvement: {
    label: "Improvement",
    icon: ArrowUp,
    className: "task-type-improvement",
  },
};

export const priorityConfig = {
  low: { label: "Low", className: "task-priority-low", icon: null },
  medium: { label: "Medium", className: "task-priority-medium", icon: null },
  high: { label: "High", className: "task-priority-high", icon: null },
  urgent: { label: "Urgent", className: "task-priority-urgent", icon: AlertCircle },
};

const TaskCard = ({ task, onTaskClick, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isSortableDragging || isDragging ? "task-card-dragging" : ""} ${isOverdue ? "task-card-overdue" : ""}`}
      {...attributes}
      {...listeners}
      onClick={() => onTaskClick && onTaskClick(task)}
    >
      {/* ── Type Badge ────────────────────────────────────────── */}
      <div className="task-card-top">
        <span className={`task-type-badge ${type.className}`}>
          <TypeIcon size={11} />
          {type.label}
        </span>
        <span
          className={`task-priority-badge ${priority.className} ${isUrgentOverdue ? "task-priority-pulse" : ""}`}
        >
          {PriorityIcon && <PriorityIcon size={11} />}
          {priority.label}
        </span>
      </div>

      {/* ── Title ─────────────────────────────────────────────── */}
      <p className="task-card-title">{task.title}</p>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="task-card-footer">
        <div className="task-card-footer-left">
          {task.dueDate && (
            <div className={`task-card-meta ${isOverdue ? "task-card-meta-overdue" : ""}`}>
              <Calendar size={12} />
              <span>{format(new Date(task.dueDate), "MMM dd")}</span>
            </div>
          )}
          {task.comments?.length > 0 && (
            <div className="task-card-meta">
              <MessageSquare size={12} />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
        {task.assignee && (
          <div
            className="task-card-assignee"
            title={task.assignee.name}
          >
            {task.assignee.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;