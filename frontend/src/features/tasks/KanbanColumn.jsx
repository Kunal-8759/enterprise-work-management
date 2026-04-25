import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard.jsx";
import "./KanbanColumn.css";

const columnConfig = {
  "todo": { label: "Todo", dotClass: "col-dot-todo" },
  "in-progress": { label: "In Progress", dotClass: "col-dot-inprogress" },
  "done": { label: "Done", dotClass: "col-dot-done" },
};

const KanbanColumn = ({ column, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const config = columnConfig[column.id];

  return (
    <div className={`kanban-column ${isOver ? "kanban-column-over" : ""}`}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="kanban-column-header">
        <div className="kanban-column-header-left">
          <span className={`kanban-col-dot ${config.dotClass}`} />
          <h3 className="kanban-column-title">{config.label}</h3>
        </div>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>

      {/* ── Drop Zone ─────────────────────────────────────────── */}
      <div
        ref={setNodeRef}
        className={`kanban-column-body ${tasks.length === 0 ? "kanban-column-empty" : ""}`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <p className="kanban-empty-text">Drop tasks here</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onTaskClick={onTaskClick}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;