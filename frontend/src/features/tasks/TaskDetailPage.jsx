import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteTask } from "../../store/slices/taskSlice.js";
import TaskDetailModal from "./TaskDetailModal.jsx";
import TaskModal from "./TaskModal.jsx";
import { toast } from "react-toastify";

const TaskDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editTask, setEditTask] = useState(null);

  const handleClose = () => navigate("/tasks");

  const handleEdit = (task) => setEditTask(task);

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const result = await dispatch(deleteTask(taskId));
    if (deleteTask.fulfilled.match(result)) {
      toast.success("Task deleted successfully");
      navigate("/tasks");
    } else {
      toast.error(result.payload || "Failed to delete task");
    }
  };

  return (
    <>
      <TaskDetailModal
        task={{ _id: id }}
        onClose={handleClose}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {editTask && (
        <TaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </>
  );
};

export default TaskDetailPage;