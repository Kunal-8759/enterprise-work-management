import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Edit2,
  Trash2,
  Paperclip,
  MessageSquare,
  Send,
  Calendar,
  User,
  FolderKanban,
  Loader2,
  Download,
  Trash,
  FileText,
  Image,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "react-toastify";
import {
  fetchTaskById,
  addComment,
  deleteComment,
  uploadAttachment,
  deleteAttachment,
  clearSelectedTask,
} from "../../store/slices/taskSlice.js";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import { typeConfig, priorityConfig } from "./TaskCard.jsx";
import "./TaskDetailModal.css";

const TaskDetailModal = ({ task, onClose, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { selectedTask, detailLoading } = useSelector((state) => state.tasks);

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const commentsEndRef = useRef(null);

  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canDelete = isAdmin;
  const canEdit = isAdmin || isManager ||
    selectedTask?.assignee?._id === user?.id;

  const type = typeConfig[selectedTask?.type] || typeConfig.feature;
  const priority = priorityConfig[selectedTask?.priority] || priorityConfig.medium;
  const TypeIcon = type.icon;
  const PriorityIcon = priority.icon;

  const isOverdue =
    selectedTask?.dueDate &&
    isPast(new Date(selectedTask.dueDate)) &&
    selectedTask?.status !== "done";

  const isUrgentOverdue = selectedTask?.priority === "urgent" && isOverdue;

  useEffect(() => {
    dispatch(fetchTaskById(task._id));
    return () => dispatch(clearSelectedTask());
  }, [dispatch, task._id]);

  // close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // scroll to bottom of comments when new comment added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTask?.comments?.length]);

  // ── Comment Handlers ───────────────────────────────────────────
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    const result = await dispatch(
      addComment({ taskId: task._id, text: commentText.trim() })
    );
    if (addComment.fulfilled.match(result)) {
      setCommentText("");
    } else {
      toast.error(result.payload || "Failed to add comment");
    }
    setSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    const result = await dispatch(
      deleteComment({ taskId: task._id, commentId })
    );
    if (deleteComment.rejected.match(result)) {
      toast.error(result.payload || "Failed to delete comment");
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // ── Attachment Handlers ────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const result = await dispatch(
      uploadAttachment({ taskId: task._id, file })
    );
    if (uploadAttachment.fulfilled.match(result)) {
      toast.success("File uploaded successfully");
    } else {
      toast.error(result.payload || "Failed to upload file");
    }
    setUploadingFile(false);
    e.target.value = "";
  };

  const handleDeleteAttachment = async (attachmentId) => {
    const result = await dispatch(
      deleteAttachment({ taskId: task._id, attachmentId })
    );
    if (deleteAttachment.fulfilled.match(result)) {
      toast.success("Attachment deleted");
    } else {
      toast.error(result.payload || "Failed to delete attachment");
    }
  };

  const isImageFile = (fileName) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const getFileIcon = (fileName) => {
    if (isImageFile(fileName)) return Image;
    return FileText;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="detail-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="detail-modal-header">
          <div className="detail-modal-header-left">
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
          <div className="detail-modal-header-right">
            {canEdit && (
              <button
                className="detail-modal-action-btn"
                onClick={() => onEdit(selectedTask)}
                title="Edit task"
              >
                <Edit2 size={16} />
              </button>
            )}
            {canDelete && (
              <button
                className="detail-modal-action-btn detail-modal-delete-btn"
                onClick={() => {
                  onDelete(task._id);
                  onClose();
                }}
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {detailLoading || !selectedTask ? (
          <div className="detail-modal-loader">
            <Loader2 size={28} className="detail-modal-loader-icon" />
            <p>Loading task details...</p>
          </div>
        ) : (
          <div className="detail-modal-body">
            {/* ── Left Panel ──────────────────────────────────── */}
            <div className="detail-modal-left">
              {/* Title */}
              <h2 className="detail-modal-title">{selectedTask.title}</h2>

              {/* Description */}
              {selectedTask.description && (
                <p className="detail-modal-desc">{selectedTask.description}</p>
              )}

              {/* Meta Info */}
              <div className="detail-modal-meta-grid">
                {/* Status */}
                <div className="detail-modal-meta-item">
                  <span className="detail-modal-meta-label">Status</span>
                  <span className={`task-status-badge task-status-${selectedTask.status}`}>
                    {selectedTask.status === "in-progress"
                      ? "In Progress"
                      : selectedTask.status.charAt(0).toUpperCase() +
                        selectedTask.status.slice(1)}
                  </span>
                </div>

                {/* Project */}
                <div className="detail-modal-meta-item">
                  <span className="detail-modal-meta-label">
                    <FolderKanban size={13} /> Project
                  </span>
                  <span className="detail-modal-meta-value">
                    {selectedTask.project?.title || "—"}
                  </span>
                </div>

                {/* Assignee */}
                <div className="detail-modal-meta-item">
                  <span className="detail-modal-meta-label">
                    <User size={13} /> Assignee
                  </span>
                  {selectedTask.assignee ? (
                    <div className="detail-modal-assignee">
                      <div className="detail-modal-avatar">
                        {selectedTask.assignee.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="detail-modal-meta-value">
                        {selectedTask.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="detail-modal-meta-muted">Unassigned</span>
                  )}
                </div>

                {/* Created By */}
                <div className="detail-modal-meta-item">
                  <span className="detail-modal-meta-label">
                    <User size={13} /> Created By
                  </span>
                  <div className="detail-modal-assignee">
                    <div className="detail-modal-avatar">
                      {selectedTask.createdBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="detail-modal-meta-value">
                      {selectedTask.createdBy?.name}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="detail-modal-meta-item">
                  <span className="detail-modal-meta-label">
                    <Calendar size={13} /> Due Date
                  </span>
                  {selectedTask.dueDate ? (
                    <span
                      className={`detail-modal-meta-value ${isOverdue ? "detail-modal-overdue" : ""}`}
                    >
                      {format(new Date(selectedTask.dueDate), "MMM dd, yyyy")}
                      {isOverdue && " (Overdue)"}
                    </span>
                  ) : (
                    <span className="detail-modal-meta-muted">No due date</span>
                  )}
                </div>

                {/* Created At */}
                <div className="detail-modal-meta-item">
                  <span className="detail-modal-meta-label">
                    <Calendar size={13} /> Created
                  </span>
                  <span className="detail-modal-meta-value">
                    {format(new Date(selectedTask.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>

              {/* ── Attachments ─────────────────────────────────── */}
              <div className="detail-modal-section">
                <div className="detail-modal-section-header">
                  <h3 className="detail-modal-section-title">
                    <Paperclip size={16} />
                    Attachments ({selectedTask.attachments?.length || 0})
                  </h3>
                  <button
                    className="detail-modal-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    title="Upload file"
                  >
                    {uploadingFile ? (
                      <Loader2 size={14} className="detail-modal-loader-icon" />
                    ) : (
                      <Paperclip size={14} />
                    )}
                    {uploadingFile ? "Uploading..." : "Upload"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                {selectedTask.attachments?.length === 0 ? (
                  <p className="detail-modal-empty-text">No attachments yet</p>
                ) : (
                  <div className="detail-modal-attachments">
                    {selectedTask.attachments?.map((att) => {
                      const FileIcon = getFileIcon(att.fileName);
                      const isImg = isImageFile(att.fileName);
                      return (
                        <div key={att._id} className="attachment-item">
                          {isImg ? (
                            <div className="attachment-preview">
                              <img
                                src={att.filePath}
                                alt={att.fileName}
                                className="attachment-img"
                              />
                            </div>
                          ) : (
                            <div className="attachment-icon-wrapper">
                              <FileIcon size={20} />
                            </div>
                          )}
                          <div className="attachment-info">
                            <span className="attachment-name">
                              {att.fileName}
                            </span>
                            <span className="attachment-date">
                              {format(new Date(att.uploadedAt), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="attachment-actions">
                            <a
                              href={att.filePath}
                              target="_blank"
                              rel="noreferrer"
                              className="attachment-btn"
                              title="View/Download"
                            >
                              <Download size={14} />
                            </a>
                            <button
                              className="attachment-btn attachment-btn-delete"
                              onClick={() => handleDeleteAttachment(att._id)}
                              title="Delete"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel — Comments ───────────────────────── */}
            <div className="detail-modal-right">
              <div className="detail-modal-section-header">
                <h3 className="detail-modal-section-title">
                  <MessageSquare size={16} />
                  Comments ({selectedTask.comments?.length || 0})
                </h3>
              </div>

              {/* Comments List */}
              <div className="detail-modal-comments">
                {selectedTask.comments?.length === 0 ? (
                  <p className="detail-modal-empty-text">
                    No comments yet. Be the first to comment.
                  </p>
                ) : (
                  selectedTask.comments?.map((comment) => {
                    const isOwner =
                      comment.commentedBy?._id === user?.id ||
                      comment.commentedBy === user?.id;
                    return (
                      <div key={comment._id} className="comment-item">
                        <div className="comment-avatar">
                          {comment.commentedBy?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">
                              {comment.commentedBy?.name}
                            </span>
                            <span className="comment-time">
                              {format(
                                new Date(comment.createdAt),
                                "MMM dd, HH:mm"
                              )}
                            </span>
                            {isOwner && (
                              <button
                                className="comment-delete"
                                onClick={() => handleDeleteComment(comment._id)}
                                title="Delete comment"
                              >
                                <Trash size={12} />
                              </button>
                            )}
                          </div>
                          <p className="comment-text">{comment.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Comment Input */}
              <div className="comment-input-wrapper">
                <div className="comment-input-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="comment-input-box">
                  <textarea
                    className="comment-textarea"
                    placeholder="Write a comment... (Enter to send)"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    rows={2}
                  />
                  <button
                    className="comment-send-btn"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || submittingComment}
                    title="Send comment"
                  >
                    {submittingComment ? (
                      <Loader2 size={16} className="detail-modal-loader-icon" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;