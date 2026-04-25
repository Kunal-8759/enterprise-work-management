import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    Edit2,
    Trash2,
    Calendar,
    Users,
    Loader2,
    UserPlus,
    UserMinus,
    CheckSquare,
    Plus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
    fetchProjectById,
    deleteProject,
    clearSelectedProject,
    removeProjectMember,
} from "../../store/slices/projectSlice.js";
import ProjectModal from "./ProjectModal.jsx";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import "./ProjectDetail.css";
import KanbanBoard from "../tasks/KanbanBoard.jsx";
import TaskModal from "../tasks/taskModal.jsx";
import { fetchTasks } from "../../store/slices/taskSlice.js";

const statusConfig = {
    planning: { label: "Planning", className: "status-planning" },
    active: { label: "Active", className: "status-active" },
    "on-hold": { label: "On Hold", className: "status-onhold" },
    completed: { label: "Completed", className: "status-completed" },
};

const priorityConfig = {
    low: { label: "Low", className: "priority-low" },
    medium: { label: "Medium", className: "priority-medium" },
    high: { label: "High", className: "priority-high" },
};

const ProjectDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedProject: project, detailLoading } = useSelector(
        (state) => state.projects
    );
    const [editModalOpen, setEditModalOpen] = useState(false);

    const { tasks } = useSelector((state) => state.tasks);
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [editTask, setEditTask] = useState(null);

    const projectTasks = tasks.filter((t) => (t.project?._id || t.project) === id);

    useEffect(() => {
        dispatch(fetchTasks({ project: id }));
    }, [dispatch, id]);

    useEffect(() => {
        dispatch(fetchProjectById(id));
        return () => dispatch(clearSelectedProject());
    }, [dispatch, id]);

    const canManage =
        user?.role === ROLES.ADMIN ||
        project?.createdBy?._id === user?.id;

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        const result = await dispatch(deleteProject(id));
        if (deleteProject.fulfilled.match(result)) {
            toast.success("Project deleted successfully");
            navigate("/projects");
        } else {
            toast.error(result.payload || "Failed to delete project");
        }
    };

    const handleRemoveMember = async (memberId) => {
        const result = await dispatch(
            removeProjectMember({ projectId: id, memberId })
        );
        if (removeProjectMember.fulfilled.match(result)) {
            toast.success("Member removed successfully");
        } else {
            toast.error(result.payload || "Failed to remove member");
        }
    };

    if (detailLoading) {
        return (
            <div className="detail-loader">
                <Loader2 size={32} className="detail-loader-icon" />
                <p>Loading project...</p>
            </div>
        );
    }

    if (!project){
        navigate("/unauthorized");
        return;
    }

    const status = statusConfig[project.status] || statusConfig.planning;
    const priority = priorityConfig[project.priority] || priorityConfig.medium;

    return (
        <div className="project-detail">
            {/*  Back  */}
            <button className="detail-back" onClick={() => navigate("/projects")}>
                <ArrowLeft size={16} />
                Back to Projects
            </button>

            {/*  Header  */}
            <div className="detail-header">
                <div className="detail-header-left">
                    <div className="detail-badges">
                        <span className={`project-status-badge ${status.className}`}>
                            {status.label}
                        </span>
                        <span className={`project-priority-badge ${priority.className}`}>
                            {priority.label}
                        </span>
                    </div>
                    <h1 className="detail-title">{project.title}</h1>
                    {project.description && (
                        <p className="detail-desc">{project.description}</p>
                    )}
                </div>

                {canManage && (
                    <div className="detail-actions">
                        <button
                            className="detail-btn-edit"
                            onClick={() => setEditModalOpen(true)}
                        >
                            <Edit2 size={16} />
                            Edit
                        </button>
                        <button className="detail-btn-delete" onClick={handleDelete}>
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/*  Info Cards  */}
            <div className="detail-info-grid">
                <div className="detail-info-card">
                    <span className="detail-info-label">Created By</span>
                    <span className="detail-info-value">
                        {project.createdBy?.name}
                    </span>
                </div>
                {project.deadline && (
                    <div className="detail-info-card">
                        <span className="detail-info-label">Deadline</span>
                        <div className="detail-info-value detail-info-icon-row">
                            <Calendar size={14} />
                            {format(new Date(project.deadline), "MMM dd, yyyy")}
                        </div>
                    </div>
                )}
                <div className="detail-info-card">
                    <span className="detail-info-label">Created</span>
                    <span className="detail-info-value">
                        {format(new Date(project.createdAt), "MMM dd, yyyy")}
                    </span>
                </div>
            </div>

            {/*  Members  */}
            <div className="detail-section">
                <div className="detail-section-header">
                    <h2 className="detail-section-title">
                        <Users size={18} />
                        Members ({project.members?.length || 0})
                    </h2>
                </div>
                <div className="detail-members-list">
                    {project.members?.map((member) => (
                        <div key={member._id} className="detail-member-item">
                            <div className="detail-member-avatar">
                                {member.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="detail-member-info">
                                <span className="detail-member-name">{member.name}</span>
                                <span className="detail-member-role">{member.role}</span>
                            </div>
                            {canManage &&
                                member._id !== project.createdBy?._id && (
                                    <button
                                        className="detail-member-remove"
                                        onClick={() => handleRemoveMember(member._id)}
                                        title="Remove member"
                                    >
                                        <UserMinus size={14} />
                                    </button>
                                )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tasks Kanban ──────────────────────────────────────────── */}
            {/* <div className="detail-section">
                <div className="detail-section-header">
                    <h2 className="detail-section-title">
                        <CheckSquare size={18} />
                        Tasks ({projectTasks.length})
                    </h2>
                    <button
                        className="btn-create"
                        onClick={() => setCreateTaskOpen(true)}
                    >
                        <Plus size={16} />
                        New Task
                    </button>
                </div>
                <KanbanBoard
                    tasks={projectTasks}
                    onTaskClick={() => { }}
                    onEditTask={setEditTask}
                />
            </div> */}

            {createTaskOpen && (
                <TaskModal
                    defaultProjectId={id}
                    onClose={() => setCreateTaskOpen(false)}
                />
            )}

            {editTask && (
                <TaskModal
                    task={editTask}
                    onClose={() => setEditTask(null)}
                />
            )}

            {/*  Edit Modal  */}
            {editModalOpen && (
                <ProjectModal
                    project={project}
                    onClose={() => setEditModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProjectDetail;