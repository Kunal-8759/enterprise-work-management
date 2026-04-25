import { Calendar, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import "./ProjectCard.css";

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

const ProjectCard = ({ project, onClick }) => {
    const status = statusConfig[project.status] || statusConfig.planning;
    const priority = priorityConfig[project.priority] || priorityConfig.medium;

    return (
        <div className="project-card" onClick={onClick}>
            {/*  Top  */}
            <div className="project-card-top">
                <div className="project-card-badges">
                    <span className={`project-status-badge ${status.className}`}>
                        {status.label}
                    </span>
                    <span className={`project-priority-badge ${priority.className}`}>
                        {priority.label}
                    </span>
                </div>
                <ArrowRight size={16} className="project-card-arrow" />
            </div>

            {/*  Title + Description  */}
            <div className="project-card-body">
                <h3 className="project-card-title">{project.title}</h3>
                {project.description && (
                    <p className="project-card-desc">{project.description}</p>
                )}
            </div>

            {/*  Footer  */}
            <div className="project-card-footer">
                {/* Members */}
                <div className="project-card-members">
                    <Users size={14} className="project-card-footer-icon" />
                    <span>{project.members?.length || 0} members</span>
                </div>

                {/* Deadline */}
                {project.deadline && (
                    <div className="project-card-deadline">
                        <Calendar size={14} className="project-card-footer-icon" />
                        <span>{format(new Date(project.deadline), "MMM dd, yyyy")}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;