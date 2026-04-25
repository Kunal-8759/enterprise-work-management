import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDispatch } from "react-redux";
import { updateTask, updateTaskStatusLocally } from "../../store/slices/taskSlice.js";
import { toast } from "react-toastify";
import KanbanColumn from "./KanbanColumn.jsx";
import TaskCard from "./TaskCard.jsx";
import "./KanbanBoard.css";

const COLUMNS = [
  { id: "todo" },
  { id: "in-progress" },
  { id: "done" },
];

const KanbanBoard = ({ tasks, onTaskClick }) => {
  const dispatch = useDispatch();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getTasksByStatus = (status) =>
    tasks.filter((t) => t.status === status);

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    const validStatuses = ["todo", "in-progress", "done"];

    // over.id could be a column id OR another task's _id
    // if it's a task, find which column (status) that task belongs to
    let newStatus = over.id;

    if (!validStatuses.includes(newStatus)) {
      // over.id is a task _id — find that task's status
      const overTask = tasks.find((t) => t._id === over.id);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // optimistic update
    dispatch(updateTaskStatusLocally({ taskId, status: newStatus }));

    const result = await dispatch(
      updateTask({ id: taskId, updateData: { status: newStatus } })
    );

    if (updateTask.rejected.match(result)) {
      dispatch(updateTaskStatusLocally({ taskId, status: task.status }));
      toast.error(result.payload || "Failed to update task status");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={getTasksByStatus(col.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="kanban-drag-overlay">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;