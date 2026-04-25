import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { X, Search, Loader2, UserPlus, CheckCircle } from "lucide-react";
import * as Yup from "yup";
import { useDebouncedCallback } from "use-debounce";
import {
    createProject,
    updateProject,
    addProjectMember,
    removeProjectMember,
} from "../../store/slices/projectSlice.js";
import {
    searchUserByEmail,
    clearSearchedUser,
} from "../../store/slices/userSlice.js";
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
    const { searchedUser, searching } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);

    const [selectedMembers, setSelectedMembers] = useState(
        project?.members || []
    );
    const [emailQuery, setEmailQuery] = useState("");
    const searchRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
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

    // cleanup on unmount
    useEffect(() => {
        return () => dispatch(clearSearchedUser());
    }, [dispatch]);

    // debounced email search — fires after 500ms of no typing
    const debouncedSearch = useDebouncedCallback((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email.trim())) {
            dispatch(searchUserByEmail(email.trim()));
        } else {
            dispatch(clearSearchedUser());
        }
    }, 500);

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmailQuery(value);
        debouncedSearch(value);
    };

    // check if user is already a member
    const isAlreadyMember = (userId) => {
        return selectedMembers.some((m) => (m._id || m) === userId);
    };

    //  Add Member 
    const handleAddMember = async () => {
        if (!searchedUser) return;

        if (isAlreadyMember(searchedUser._id)) {
            toast.error("User is already a member");
            return;
        }

        if (isEditing) {
            const result = await dispatch(
                addProjectMember({
                    projectId: project._id,
                    memberId: searchedUser._id,
                })
            );
            if (addProjectMember.fulfilled.match(result)) {
                setSelectedMembers(result.payload?.members || []);
                toast.success(`${searchedUser.name} added to project`);
                setEmailQuery("");
                dispatch(clearSearchedUser());
            } else {
                toast.error(result.payload || "Failed to add member");
            }
        } else {
            setSelectedMembers((prev) => [...prev, searchedUser]);
            toast.success(`${searchedUser.name} added`);
            setEmailQuery("");
            dispatch(clearSearchedUser());
        }
    };

    //  Remove Member 
    const handleRemoveMember = async (memberId) => {
        if (memberId === currentUser?.id) {
            toast.error("You cannot remove yourself");
            return;
        }

        if (isEditing) {
            const result = await dispatch(
                removeProjectMember({ projectId: project._id, memberId })
            );
            if (removeProjectMember.fulfilled.match(result)) {
                setSelectedMembers(result.payload.members || []);
                toast.success("Member removed");
            } else {
                toast.error(result.payload || "Failed to remove member");
            }
        } else {
            setSelectedMembers((prev) =>
                prev.filter((m) => (m._id || m) !== memberId)
            );
        }
    };

    const onSubmit = async (formData) => {
        const payload = {
            ...formData,
            ...(!isEditing && {
                members: selectedMembers.map((m) => m._id || m),
            }),
        };

        if (isEditing) {
            const result = await dispatch(
                updateProject({ id: project._id, updateData: payload })
            );
            if (updateProject.fulfilled.match(result)) {
                toast.success("Project updated successfully");
                onClose();
            } else {
                toast.error(result.payload || "Failed to update project");
            }
        } else {
            const result = await dispatch(createProject(payload));
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
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
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

                    {/*  Members  */}
                    <div className="form-group">
                        <label className="form-label">
                            Add Members ({selectedMembers.length})
                        </label>

                        {/* Email Search Row */}
                        <div className="member-search-row" ref={searchRef}>
                            <div className="member-search-input-wrapper">
                                <Search size={16} className="member-search-icon" />
                                <input
                                    type="email"
                                    className="member-search-input"
                                    placeholder="Enter member email..."
                                    value={emailQuery}
                                    onChange={handleEmailChange}
                                />
                                {searching && (
                                    <Loader2 size={14} className="member-search-loader" />
                                )}
                            </div>

                            {/* Add Button */}
                            <button
                                type="button"
                                className={`member-add-btn ${searchedUser && !isAlreadyMember(searchedUser._id)
                                        ? "member-add-btn-active"
                                        : "member-add-btn-disabled"
                                    }`}
                                onClick={handleAddMember}
                                disabled={!searchedUser || isAlreadyMember(searchedUser?._id)}
                                title="Add member"
                            >
                                <UserPlus size={16} />
                            </button>
                        </div>

                        {/* Search Result Preview */}
                        {emailQuery.length > 0 && !searching && (
                            <div className="member-search-result">
                                {searchedUser ? (
                                    <div
                                        className={`member-result-card ${isAlreadyMember(searchedUser._id)
                                                ? "member-result-card-added"
                                                : ""
                                            }`}
                                    >
                                        <div className="member-result-avatar">
                                            {searchedUser.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="member-result-info">
                                            <span className="member-result-name">
                                                {searchedUser.name}
                                            </span>
                                            <span className="member-result-email">
                                                {searchedUser.email}
                                            </span>
                                        </div>
                                        <div className="member-result-right">
                                            <span className="member-dropdown-role">
                                                {searchedUser.role}
                                            </span>
                                            {isAlreadyMember(searchedUser._id) && (
                                                <CheckCircle
                                                    size={16}
                                                    className="member-result-check"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="member-result-empty">
                                        No user found with this email
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Selected Members Chips */}
                        {selectedMembers.length > 0 && (
                            <div className="selected-members">
                                {selectedMembers.map((member) => {
                                    const id = member._id || member;
                                    const name = member.name || id;
                                    return (
                                        <div key={id} className="selected-member-chip">
                                            <div className="selected-member-avatar">
                                                {name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="selected-member-name">{name}</span>
                                            {id !== currentUser?.id && (
                                                <button
                                                    type="button"
                                                    className="selected-member-remove"
                                                    onClick={() => handleRemoveMember(id)}
                                                    title="Remove"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

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
                                    : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;