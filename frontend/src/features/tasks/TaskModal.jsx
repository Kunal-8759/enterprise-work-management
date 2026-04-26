import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import * as Yup from "yup";
import { createTask, updateTask } from "../../store/slices/taskSlice.js";
import { fetchProjects } from "../../store/slices/projectSlice.js";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import "./TaskModal.css";

const taskSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  type: Yup.string().required("Type is required"),
  priority: Yup.string().required("Priority is required"),
  status: Yup.string().required("Status is required"),
  project: Yup.string().required("Project is required"),
  dueDate: Yup.string().required("Due date is required"),
});

const TaskModal = ({ onClose, task = null, defaultProjectId = null }) => {
  const dispatch = useDispatch();
  const isEditing = !!task;
  const { user } = useAuth();
  const { projects } = useSelector((state) => state.projects);

  const canAssign = [ROLES.ADMIN, ROLES.MANAGER].includes(user?.role);

  // assignee is stored as full member object or null
  const [assigneeId, setAssigneeId] = useState(
    task?.assignee?._id || task?.assignee || ""
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      type: task?.type || "feature",
      priority: task?.priority || "medium",
      status: task?.status || "todo",
      project: task?.project?._id || task?.project || defaultProjectId || "",
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  const selectedProjectId = watch("project");

  useEffect(() => {
    if (projects.length === 0) dispatch(fetchProjects());
  }, [dispatch, projects.length]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // When project changes, reset assignee if they are no longer a member
  useEffect(() => {
    if (!selectedProjectId) {
      setAssigneeId("");
      return;
    }
    const project = projects.find((p) => p._id === selectedProjectId);
    if (!project) return;
    const stillMember = project.members?.some(
      (m) => (m._id || m) === assigneeId
    );
    if (!stillMember) setAssigneeId("");
  }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Members of the currently selected project
  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const projectMembers = selectedProject?.members || [];

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      ...(assigneeId && { assignee: assigneeId }),
    };

    if (isEditing) {
      const result = await dispatch(
        updateTask({ id: task._id, updateData: payload })
      );
      if (updateTask.fulfilled.match(result)) {
        toast.success("Task updated successfully");
        onClose();
      } else {
        toast.error(result.payload || "Failed to update task");
      }
    } else {
      const result = await dispatch(createTask(payload));
      if (createTask.fulfilled.match(result)) {
        toast.success("Task created successfully");
        onClose();
      } else {
        toast.error(result.payload || "Failed to create task");
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? "Edit Task" : "New Task"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className={`input-field ${errors.title ? "input-field-error" : ""}`}
              placeholder="Task title"
              {...register("title")}
            />
            {errors.title && (
              <span className="input-error">{errors.title.message}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className={`input-field task-textarea ${errors.description ? "input-field-error" : ""}`}
              placeholder="Task description"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <span className="input-error">{errors.description.message}</span>
            )}
          </div>

          {/* Project */}
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select
              className={`input-field ${errors.project ? "input-field-error" : ""}`}
              {...register("project")}
              disabled={isEditing} // project cannot be changed after creation
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            {errors.project && (
              <span className="input-error">{errors.project.message}</span>
            )}
            {isEditing && (
              <span className="input-hint">
                Project cannot be changed after creation
              </span>
            )}
          </div>

          {/* Type + Priority */}
          <div className="modal-form-row">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className={`input-field ${errors.type ? "input-field-error" : ""}`}
                {...register("type")}
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
                <option value="improvement">Improvement</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select
                className={`input-field ${errors.priority ? "input-field-error" : ""}`}
                {...register("priority")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Status + Due Date */}
          <div className="modal-form-row">
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className={`input-field ${errors.status ? "input-field-error" : ""}`}
                {...register("status")}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className={`input-field ${errors.dueDate ? "input-field-error" : ""}`}
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <span className="input-error">{errors.dueDate.message}</span>
              )}
            </div>
          </div>

          {/* Assignee — Admin and Manager only, chosen from project members */}
          {canAssign && (
            <div className="form-group">
              <label className="form-label">Assignee</label>
              {!selectedProjectId ? (
                <p className="task-assignee-hint">
                  Select a project first to assign a member
                </p>
              ) : projectMembers.length === 0 ? (
                <p className="task-assignee-hint">
                  This project has no members yet
                </p>
              ) : (
                <select
                  className="input-field"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {projectMembers.map((member) => {
                    const id = member._id || member;
                    const name = member.name || id;
                    const role = member.role ? ` (${member.role})` : "";
                    return (
                      <option key={id} value={id}>
                        {name}{role}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save Changes"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;