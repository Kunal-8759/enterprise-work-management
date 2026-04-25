import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { fetchProjects } from "../../store/slices/projectSlice.js";
import ProjectCard from "./ProjectCard.jsx";
import ProjectModal from "./ProjectModal.jsx";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import "./Projects.css";

const Projects = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects, loading } = useSelector((state) => state.projects);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    const canCreate = [ROLES.ADMIN, ROLES.MANAGER].includes(user?.role);

    if (loading) {
        return (
            <div className="projects-loader">
                <Loader2 size={32} className="projects-loader-icon" />
                <p>Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="projects-page">
            {/* Header  */}
            <div className="projects-header">
                <div className="projects-header-left">
                    <h2 className="projects-count">
                        {projects.length} {projects.length === 1 ? "Project" : "Projects"}
                    </h2>
                </div>
                {canCreate && (
                    <button
                        className="btn-create"
                        onClick={() => setModalOpen(true)}
                    >
                        <Plus size={18} />
                        New Project
                    </button>
                )}
            </div>

            {/*  Grid  */}
            {projects.length === 0 ? (
                <div className="projects-empty">
                    <p className="projects-empty-text">No projects found.</p>
                    {canCreate && (
                        <button
                            className="btn-create"
                            onClick={() => setModalOpen(true)}
                        >
                            <Plus size={18} />
                            Create your first project
                        </button>
                    )}
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onClick={() => navigate(`/projects/${project._id}`)}
                        />
                    ))}
                </div>
            )}

            {/*  Create Modal  */}
            {modalOpen && (
                <ProjectModal
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Projects;