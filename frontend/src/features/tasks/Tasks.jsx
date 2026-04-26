import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Loader2, LayoutList, LayoutDashboard } from "lucide-react";
import {
  fetchTasks,
  fetchTaskById,
  deleteTask,
  clearSelectedTask,
} from "../../store/slices/taskSlice.js";
import { fetchProjects } from "../../store/slices/projectSlice.js";
import KanbanBoard from "./KanbanBoard.jsx";
import TaskListView from "./TaskListView.jsx";
import TaskModal from "./TaskModal.jsx";
import TaskDetailModal from "./TaskDetailModal.jsx";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import { toast } from "react-toastify";
import "./Tasks.css";

const VIEW_KEY = "tasks_view_preference";

const Tasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { tasks, loading, selectedTask, detailLoading } = useSelector(
    (state) => state.tasks
  );
  const { projects } = useSelector((state) => state.projects);

  const [view, setView] = useState(
    () => localStorage.getItem(VIEW_KEY) || "kanban"
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  // Filters
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Only Admin and Manager can create tasks
  const canCreateTask = [ROLES.ADMIN, ROLES.MANAGER].includes(user?.role);

  // Read taskId from query param
  const taskIdFromUrl = searchParams.get("taskId");

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  }, [dispatch]);

  // Auto open modal if taskId in URL
  useEffect(() => {
    if (taskIdFromUrl) {
      dispatch(fetchTaskById(taskIdFromUrl));
    } else {
      dispatch(clearSelectedTask());
      setDetailTask(null);
    }
  }, [taskIdFromUrl, dispatch]);


  // Once task is fetched, check access and open modal
  useEffect(() => {
    if (!detailLoading && selectedTask && taskIdFromUrl) {
      if (user.role === ROLES.EMPLOYEE) {
        const isAssignee = selectedTask?.assignee?._id === user?._id;
        const isCreator = selectedTask?.createdBy?._id === user?._id;
        if (!isAssignee && !isCreator) {
          navigate("/unauthorized");
          return;
        }
      }
      setDetailTask(selectedTask);
    }
  }, [detailLoading, selectedTask, taskIdFromUrl, user, navigate]);

  const handleViewToggle = (newView) => {
    setView(newView);
    localStorage.setItem(VIEW_KEY, newView);
  };

  const handleTaskClick = (task) => {
    setDetailTask(task);
  };

  const handleDetailClose = () => {
    setDetailTask(null);
    dispatch(clearSelectedTask());
    if (taskIdFromUrl) {
      navigate("/tasks", { replace: true });
    }
  };

  const handleEditTask = (task) => {
    setDetailTask(null);
    setEditTask(task);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const result = await dispatch(deleteTask(taskId));
    if (deleteTask.fulfilled.match(result)) {
      toast.success("Task deleted successfully");
      setDetailTask(null);
      if (taskIdFromUrl) navigate("/tasks", { replace: true });
    } else {
      toast.error(result.payload || "Failed to delete task");
    }
  };

  // Frontend filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesProject = filterProject
        ? (task.project?._id || task.project) === filterProject
        : true;
      const matchesStatus = filterStatus
        ? task.status === filterStatus
        : true;
      const matchesSearch = searchQuery
        ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [tasks, filterProject, filterStatus, searchQuery]);

  if (loading) {
    return (
      <div className="tasks-loader">
        <Loader2 size={32} className="tasks-loader-icon" />
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <p className="tasks-count">
          {filteredTasks.length}{" "}
          {filteredTasks.length === 1 ? "Task" : "Tasks"}
        </p>
        <div className="tasks-header-right">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${view === "kanban" ? "view-toggle-active" : ""}`}
              onClick={() => handleViewToggle("kanban")}
              title="Kanban View"
            >
              <LayoutDashboard size={16} />
            </button>
            <button
              className={`view-toggle-btn ${view === "list" ? "view-toggle-active" : ""}`}
              onClick={() => handleViewToggle("list")}
              title="List View"
            >
              <LayoutList size={16} />
            </button>
          </div>

          {/* Only Admin and Manager can create tasks */}
          {canCreateTask && (
            <button
              className="btn-create"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="tasks-filters">
        <input
          type="text"
          className="input-field tasks-search"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="input-field tasks-filter-select"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          className="input-field tasks-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {(filterProject || filterStatus || searchQuery) && (
          <button
            className="tasks-clear-filters"
            onClick={() => {
              setFilterProject("");
              setFilterStatus("");
              setSearchQuery("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* View */}
      {view === "kanban" ? (
        <KanbanBoard tasks={filteredTasks} onTaskClick={handleTaskClick} />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onEditTask={setEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Modals */}
      {createModalOpen && (
        <TaskModal onClose={() => setCreateModalOpen(false)} />
      )}
      {editTask && (
        <TaskModal task={editTask} onClose={() => setEditTask(null)} />
      )}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={handleDetailClose}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default Tasks;