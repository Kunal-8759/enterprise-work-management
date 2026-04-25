import { useNavigate } from "react-router-dom";
import "./Unauthorized.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-wrapper">
      <div className="unauthorized-card">
        <span className="unauthorized-code">403</span>
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-message">
          You do not have permission to view this page.
        </p>
        <button
          className="unauthorized-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;