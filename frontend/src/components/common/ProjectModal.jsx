import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import * as Yup from "yup";
import {
    createProject,
    updateProject,
} from "../../store/slices/projectSlice.js";
import "./ProjectModal.css";

const projectSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string(),
    status: Yup.string().required("Status is required"),
    priority: Yup.string().required("Priority is required"),
    deadline: Yup.string(),
});

const ProjectModal = ({ onClose, project = null }) => {
    const dispatch = useDispatch();
    const isEditing = !!project;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(projectSchema),
        defaultValues: {
            title: project?.title || "",
            description: project?.description || "",
            status: project?.status || "planning",
            priority: project?.priority || "medium",
            deadline: project?.deadline
                ? new Date(project.deadline).toISOString().split("T")[0]
                : "",
        },
    });

    // close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const onSubmit = async (formData) => {
        if (isEditing) {
            const result = await dispatch(
                updateProject({ id: project._id, updateData: formData })
            );
            if (updateProject.fulfilled.match(result)) {
                toast.success("Project updated successfully");
                onClose();
            } else {
                toast.error(result.payload || "Failed to update project");
            }
        } else {
            const result = await dispatch(createProject(formData));
            if (createProject.fulfilled.match(result)) {
                toast.success("Project created successfully");
                onClose();
            } else {
                toast.error(result.payload || "Failed to create project");
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/*  Header  */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing ? "Edit Project" : "New Project"}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/*  Form  */}
                <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            type="text"
                            className={`input-field ${errors.title ? "input-field-error" : ""}`}
                            placeholder="Project title"
                            {...register("title")}
                        />
                        {errors.title && (
                            <span className="input-error">{errors.title.message}</span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="input-field input-textarea"
                            placeholder="Project description"
                            rows={3}
                            {...register("description")}
                        />
                    </div>

                    {/* Status + Priority */}
                    <div className="modal-form-row">
                        <div className="form-group">
                            <label className="form-label">Status *</label>
                            <select
                                className={`input-field ${errors.status ? "input-field-error" : ""}`}
                                {...register("status")}
                            >
                                <option value="planning">Planning</option>
                                <option value="active">Active</option>
                                <option value="on-hold">On Hold</option>
                                <option value="completed">Completed</option>
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
                            </select>
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input
                            type="date"
                            className="input-field"
                            {...register("deadline")}
                        />
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
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
                                    : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;