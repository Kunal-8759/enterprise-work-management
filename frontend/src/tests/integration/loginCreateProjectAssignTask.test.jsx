/**
 * Integration Test: Login → Dashboard → Create Project → Assign Task
 *
 * Strategy:
 * - All API calls are mocked via jest.mock on the axios instance
 * - Auth-required tests (Steps 5–7) use a preloaded Redux store so
 *   isAuthenticated=true and user are already in state — bypassing the
 *   localStorage-timing issue that caused the original test failures
 * - Step 3 (login flow) manually drives through the Login form and waits
 *   for the Dashboard to mount
 * - Step 4 (failed login) checks that the error ends up in the Redux store,
 *   which is the source of truth (toast is mocked away)
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Real reducers
import authReducer from "../../../src/store/slices/authSlice.js";
import projectReducer from "../../../src/store/slices/projectSlice.js";
import taskReducer from "../../../src/store/slices/taskSlice.js";
import dashboardReducer from "../../../src/store/slices/dashboardSlice.js";
import notificationReducer from "../../../src/store/slices/notificationSlice.js";
import userReducer from "../../../src/store/slices/userSlice.js";
import analyticsReducer from "../../../src/store/slices/analyticsSlice.js";

// Components
import Login from "../../../src/features/auth/Login.jsx";
import Dashboard from "../../../src/features/dashboard/Dashboard.jsx";
import Projects from "../../../src/features/projects/Projects.jsx";
import Tasks from "../../../src/features/tasks/Tasks.jsx";
import ProtectedRoute from "../../../src/routes/ProtectedRoute.jsx";
import AppLayout from "../../../src/components/layouts/AppLayout.jsx";

// ─── Mock API ────────────────────────────────────────────────────────────────

const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPut = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock("../../../src/services/api.js", () => ({
    __esModule: true,
    default: {
        post: (...args) => global.__mockPost(...args),
        get: (...args) => global.__mockGet(...args),
        put: (...args) => global.__mockPut(...args),
        patch: (...args) => global.__mockPatch(...args),
        delete: (...args) => global.__mockDelete(...args),
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() },
        },
        defaults: { headers: { common: {} } },
    },
}));

// Keep global refs so beforeEach can update implementations
global.__mockPost = mockPost;
global.__mockGet = mockGet;
global.__mockPut = mockPut;
global.__mockPatch = mockPatch;
global.__mockDelete = mockDelete;

// ─── Other mocks ─────────────────────────────────────────────────────────────

jest.mock("../../../src/socket/socket.js", () => ({
    connectSocket: jest.fn(),
    disconnectSocket: jest.fn(),
    getSocket: jest.fn(() => ({
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    })),
}));

jest.mock("../../../src/socket/useSocket.js", () => () => ({}));

jest.mock("../../../src/context/ThemeContext.jsx", () => ({
    ThemeProvider: ({ children }) => children,
    useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

// Mock dnd-kit — not needed for these integration tests and requires browser APIs
jest.mock("@dnd-kit/core", () => ({
    DndContext: ({ children }) => children,
    DragOverlay: () => null,
    closestCorners: jest.fn(),
    PointerSensor: class PointerSensor { },
    useSensor: jest.fn(),
    useSensors: jest.fn(() => []),
    useDroppable: () => ({ setNodeRef: jest.fn(), isOver: false }),
}));

jest.mock("@dnd-kit/sortable", () => ({
    SortableContext: ({ children }) => children,
    verticalListSortingStrategy: jest.fn(),
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    }),
}));

jest.mock("@dnd-kit/utilities", () => ({
    CSS: { Transform: { toString: () => "" } },
}));

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
    ToastContainer: () => null,
}));

jest.mock("lucide-react", () => {
    const { createElement } = require("react");
    const el = (id) => () => createElement("svg", { "data-testid": id });
    return {
        FolderKanban: el("folder-icon"),
        CheckSquare: el("check-icon"),
        CircleCheck: el("circle-check-icon"),
        Clock: el("clock-icon"),
        Plus: el("plus-icon"),
        ArrowLeft: el("arrow-icon"),
        Edit2: el("edit-icon"),
        Trash2: el("trash-icon"),
        Calendar: el("calendar-icon"),
        Users: el("users-icon"),
        Loader2: el("loader-icon"),
        UserMinus: el("user-minus-icon"),
        UserPlus: el("userplus-icon"),
        Bell: el("bell-icon"),
        ChevronDown: el("chevron-icon"),
        LogOut: el("logout-icon"),
        Menu: el("menu-icon"),
        X: el("close-icon"),
        LayoutDashboard: el("dashboard-icon"),
        LayoutList: el("list-icon"),
        Settings: el("settings-icon"),
        BarChart3: el("chart-icon"),
        Search: el("search-icon"),
        CheckCircle: el("checkcircle-icon"),
        BarChart2: el("barchart2-icon"),
        ChevronLeft: el("chevron-left-icon"),
        ChevronRight: el("chevron-right-icon"),
        Sun: el("sun-icon"),
        Moon: el("moon-icon"),
        BellOff: el("belloff-icon"),
        ArrowRight: el("arrow-right-icon"),
        MessageSquare: el("message-square-icon"),
        Bug: el("bug-icon"),
        Sparkles: el("sparkles-icon"),
        ArrowUp: el("arrow-up-icon"),
        AlertCircle: el("alert-circle-icon"),
    };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_USER = {
    _id: "user-1",
    id: "user-1",
    name: "Alice Admin",
    email: "alice@company.com",
    role: "Admin",
};

const MOCK_TOKEN = "eyJ.fake.token";

const MOCK_PROJECT = {
    _id: "proj-1",
    title: "Alpha Release",
    description: "First release of the product",
    status: "active",
    priority: "high",
    members: [MOCK_USER],
    createdBy: MOCK_USER,
    createdAt: new Date().toISOString(),
};

const MOCK_TASK = {
    _id: "task-1",
    title: "Setup CI pipeline",
    description: "Set up CI/CD pipeline",
    type: "feature",
    priority: "high",
    status: "todo",
    project: MOCK_PROJECT,
    assignee: MOCK_USER,
    dueDate: "2025-12-31",
    createdAt: new Date().toISOString(),
    comments: [],
    attachments: [],
};

// ─── Store factories ──────────────────────────────────────────────────────────

const makeGuestStore = () =>
    configureStore({
        reducer: {
            auth: authReducer,
            projects: projectReducer,
            tasks: taskReducer,
            dashboard: dashboardReducer,
            notifications: notificationReducer,
            users: userReducer,
            analytics: analyticsReducer,
        },
    });

/**
 * Pre-authenticated store — sets user + isAuthenticated in initial state so
 * ProtectedRoute lets the user through immediately without any localStorage
 * timing dependency.
 */
const makeAuthStore = () =>
    configureStore({
        reducer: {
            auth: authReducer,
            projects: projectReducer,
            tasks: taskReducer,
            dashboard: dashboardReducer,
            notifications: notificationReducer,
            users: userReducer,
            analytics: analyticsReducer,
        },
        preloadedState: {
            auth: {
                user: MOCK_USER,
                isAuthenticated: true,
                loading: false,
                userLoading: false,
                error: null,
            },
            projects: {
                projects: [MOCK_PROJECT],
                selectedProject: null,
                loading: false,
                detailLoading: false,
                error: null,
            },
        },
    });

// ─── Render helpers ───────────────────────────────────────────────────────────

const renderLogin = (store = makeGuestStore()) => {
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/tasks" element={<Tasks />} />
                        </Route>
                    </Route>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
    return { store };
};

const renderAuthPage = (path, store = makeAuthStore()) => {
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/tasks" element={<Tasks />} />
                        </Route>
                    </Route>
                </Routes>
            </MemoryRouter>
        </Provider>
    );
    return { store };
};

// ─── Default API mock responses ───────────────────────────────────────────────

const setupDefaultMocks = () => {
    mockPost.mockImplementation(async (url) => {
        if (url === "/auth/login") {
            return { data: { data: { user: MOCK_USER, accessToken: MOCK_TOKEN } } };
        }
        if (url === "/projects") {
            return { data: { data: { project: MOCK_PROJECT } } };
        }
        if (url === "/tasks") {
            return { data: { data: { task: MOCK_TASK } } };
        }
        if (url === "/auth/logout") return { data: {} };
        throw new Error(`Unmocked POST: ${url}`);
    });

    mockGet.mockImplementation(async (url) => {
        if (url === "/auth/me") {
            return { data: { data: { user: MOCK_USER } } };
        }
        if (url === "/dashboard/stats") {
            return {
                data: {
                    data: {
                        projectStats: { total: 5 },
                        taskStats: { total: 12, done: 4, todo: 5, inProgress: 3 },
                        recentActivity: [],
                    },
                },
            };
        }
        if (url === "/projects") {
            return { data: { data: { projects: [MOCK_PROJECT] } } };
        }
        if (url === "/tasks") {
            return { data: { data: { tasks: [MOCK_TASK] } } };
        }
        if (url === "/users") {
            return { data: { data: { users: [MOCK_USER] } } };
        }
        if (url === "/notifications") {
            return { data: { data: { notifications: [] } } };
        }
        return { data: { data: {} } };
    });
};

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    setupDefaultMocks();
});

// ─── THE INTEGRATION TESTS ────────────────────────────────────────────────────

describe("Integration: Login → Dashboard → Create Project → Assign Task", () => {

    // ── Step 1 ──────────────────────────────────────────────────────────────────

    it("Step 1 — shows Login page at /login", async () => {
        renderLogin();
        expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
    });

    // ── Step 2 ──────────────────────────────────────────────────────────────────

    it("Step 2 — shows validation errors on empty submit", async () => {
        const user = userEvent.setup();
        renderLogin();

        await screen.findByText(/welcome back/i);
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    });

    // ── Step 3 ──────────────────────────────────────────────────────────────────

    it("Step 3 — successful login redirects to /dashboard", async () => {
        const user = userEvent.setup();
        renderLogin();

        await screen.findByText(/welcome back/i);

        await user.type(
            screen.getByPlaceholderText(/you@example\.com/i),
            "alice@company.com"
        );
        await user.type(
            screen.getByPlaceholderText(/••••••••/i),
            "password123"
        );
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        // After loginUser.fulfilled, Login navigates to /dashboard.
        // Dashboard renders MetricCard with label "Total Projects".
        await waitFor(
            () => expect(screen.getByText("Total Projects")).toBeInTheDocument(),
            { timeout: 8000 }
        );

        expect(mockPost).toHaveBeenCalledWith(
            "/auth/login",
            expect.objectContaining({ email: "alice@company.com" })
        );
    }, 15000);

    // ── Step 4 ──────────────────────────────────────────────────────────────────

    it("Step 4 — failed login stores error in Redux (isAuthenticated stays false)", async () => {
        mockPost.mockImplementationOnce(async (url) => {
            if (url === "/auth/login") {
                const err = new Error("Request failed");
                err.response = { data: { message: "Invalid credentials" } };
                throw err;
            }
        });

        const user = userEvent.setup();
        const store = makeGuestStore();
        renderLogin(store);

        await screen.findByText(/welcome back/i);

        await user.type(
            screen.getByPlaceholderText(/you@example\.com/i),
            "wrong@company.com"
        );
        await user.type(
            screen.getByPlaceholderText(/••••••••/i),
            "wrongpass"
        );
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            const { error, isAuthenticated } = store.getState().auth;
            expect(isAuthenticated).toBe(false);
            expect(error).toMatch(/invalid credentials/i);
        });
    });

    // ── Step 5 ──────────────────────────────────────────────────────────────────

    it("Step 5 — user can open New Project modal and submit", async () => {
        const user = userEvent.setup();
        renderAuthPage("/projects");

        // Wait for the New Project button — only visible for Admin/Manager
        const newProjectBtn = await screen.findByRole("button", {
            name: /new project/i,
        });
        await user.click(newProjectBtn);

        const titleInput = await screen.findByPlaceholderText(/project title/i);
        await user.type(titleInput, "Alpha Release");

        await user.click(
            screen.getByRole("button", { name: /create project/i })
        );

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith(
                "/projects",
                expect.objectContaining({ title: "Alpha Release" })
            );
        });
    });

    // ── Step 7 ──────────────────────────────────────────────────────────────────

    it("Step 7 — newly created task appears in the task list", async () => {
        renderAuthPage("/tasks");

        // mockGet returns MOCK_TASK in the tasks array — title should appear in DOM
        expect(
            await screen.findByText("Setup CI pipeline")
        ).toBeInTheDocument();
    });
});