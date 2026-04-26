import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../../src/routes/ProtectedRoute";
import RoleRoute from "../../../src/routes/RoleRoute";

// ─── Mock useAuth ─────────────────────────────────────────────────────────────
// We control authentication state via this mock across tests.
const mockUseAuth = jest.fn();
jest.mock("../../../src/hooks/useAuth.js", () => () => mockUseAuth());

// Helper to render a route tree inside MemoryRouter
const renderWithRouter = (ui, { initialEntries = ["/protected"] } = {}) =>
  render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);

// Dummy page components
const ProtectedPage = () => <div>Protected Content</div>;
const LoginPage    = () => <div>Login Page</div>;
const UnauthorizedPage = () => <div>Unauthorized Page</div>;

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

describe("ProtectedRoute", () => {
  it("renders Outlet (child route) when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: null });

    renderWithRouter(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<ProtectedPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("redirects to /login when user is NOT authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });

    renderWithRouter(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<ProtectedPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});

// ─── RoleRoute ────────────────────────────────────────────────────────────────

describe("RoleRoute", () => {
  const renderRoleRoute = (user, isAuthenticated, allowedRoles) =>
    renderWithRouter(
      <Routes>
        <Route
          element={<RoleRoute allowedRoles={allowedRoles} />}
        >
          <Route path="/protected" element={<ProtectedPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    );

  it("renders Outlet when user role is in allowedRoles", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "admin" },
    });
    renderRoleRoute({ role: "admin" }, true, ["admin", "manager"]);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /unauthorized when role is NOT in allowedRoles", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "employee" },
    });
    renderRoleRoute({ role: "employee" }, true, ["admin"]);
    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to /login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });
    renderRoleRoute(null, false, ["admin"]);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders nothing (null) while user object is loading (authenticated but no user yet)", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: null });
    const { container } = renderRoleRoute(null, true, ["admin"]);
    // RoleRoute returns null when isAuthenticated but user not yet resolved
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Unauthorized Page")).not.toBeInTheDocument();
  });

  it("allows manager role on manager-only routes", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "manager" },
    });
    renderRoleRoute({ role: "manager" }, true, ["admin", "manager"]);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});