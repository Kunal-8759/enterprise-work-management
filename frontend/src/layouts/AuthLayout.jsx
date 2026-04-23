const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">EW</div>
          <h1 className="auth-brand-title">Enterprise WMS</h1>
          <p className="auth-brand-subtitle">
            Manage your teams, projects, and tasks — all in one place.
          </p>
        </div>
        <div className="auth-features">
          <div className="auth-feature-item">
            <span className="auth-feature-dot" />
            Role-based access control
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-dot" />
            Real-time collaboration
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-dot" />
            Kanban task management
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-dot" />
            Analytics and reporting
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;