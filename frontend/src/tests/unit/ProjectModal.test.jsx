//  All mocks 
jest.mock("../../services/api.js", () => ({
  __esModule: true,
  default: {
    get: jest.fn(), post: jest.fn(), put: jest.fn(),
    patch: jest.fn(), delete: jest.fn(),
    interceptors: {
      request:  { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

jest.mock("../../socket/socket.js", () => ({
  connectSocket:    jest.fn(),
  disconnectSocket: jest.fn(),
  getSocket: jest.fn(() => ({ on: jest.fn(), off: jest.fn(), emit: jest.fn() })),
}));

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Icons as plain spans — never nested buttons
jest.mock("lucide-react", () => ({
  X:           () => <span data-testid="icon-x" />,
  Search:      () => <span data-testid="icon-search" />,
  Loader2:     () => <span data-testid="icon-loader" />,
  UserPlus:    () => <span data-testid="icon-userplus" />,
  CheckCircle: () => <span data-testid="icon-check" />,
}));

// Call the callback immediately — no timer needed
jest.mock("use-debounce", () => ({
  useDebouncedCallback: (fn) => fn,
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "../../store/slices/projectSlice.js";
import userReducer    from "../../store/slices/userSlice.js";
import authReducer    from "../../store/slices/authSlice.js";
import ProjectModal   from "../../features/projects/ProjectModal.jsx";
import { toast }      from "react-toastify";
import axiosInstance  from "../../services/api.js";

//  Fixtures 

const MOCK_USER = {
  _id: "u1", id: "u1", name: "Alice",
  email: "alice@test.com", role: "admin",
};
const MOCK_SEARCHED = {
  _id: "u2", name: "Bob",
  email: "bob@test.com", role: "employee",
};
const MOCK_PROJECT = {
  _id: "p1", title: "Alpha", description: "Desc",
  status: "active", priority: "high",
  members: [MOCK_USER], deadline: "",
};

//  Store factory 

const makeStore = () =>
  configureStore({
    reducer: { projects: projectReducer, users: userReducer, auth: authReducer },
    preloadedState: {
      auth: {
        user: MOCK_USER, isAuthenticated: true,
        loading: false, error: null, userLoading: false,
      },
      projects: {
        projects: [], selectedProject: null,
        loading: false, detailLoading: false, error: null,
      },
      users: {
        searchedUser: null, searching: false,
        users: [], loading: false, error: null,
      },
    },
  });

//  Default API mocks reset before every test 

beforeEach(() => {
  jest.clearAllMocks();

  // GET /users/search — returns the searched user
  // GET /projects/:id — returns updated project (for updateProject re-fetch)
  axiosInstance.get.mockImplementation(async (url) => {
    if (url === "/users/search") {
      return { data: { data: { user: MOCK_SEARCHED } } };
    }
    if (url.startsWith("/projects/")) {
      return { data: { data: { project: MOCK_PROJECT } } };
    }
    return { data: { data: {} } };
  });
});

//  Render helper 

const renderModal = (props = {}) => {
  const onClose = props.onClose || jest.fn();
  const store   = makeStore();
  const user    = userEvent.setup();
  render(
    <Provider store={store}>
      <ProjectModal onClose={onClose} project={props.project || null} />
    </Provider>
  );
  return { onClose, store, user };
};

// ─── Helper: type a valid email so search fires and result card appears ───────
// The component shows the card only when emailQuery.length > 0 && !searching.
// Because useDebouncedCallback is mocked to fire immediately and
// axiosInstance.get /users/search returns MOCK_SEARCHED, the Redux store
// will be updated with searchedUser=MOCK_SEARCHED after the type.
const typeAndSearch = async (user, email) => {
  const emailInput = screen.getByPlaceholderText(/enter member email/i);
  await user.type(emailInput, email);
  // Wait for the async thunk to resolve and store to update
  await waitFor(() => {
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/users/search", expect.anything()
    );
  });
};

//  Renders 

describe("ProjectModal — renders", () => {
  it("shows 'New Project' title in create mode", () => {
    renderModal();
    expect(screen.getByText("New Project")).toBeInTheDocument();
  });

  it("shows 'Edit Project' title in edit mode", () => {
    renderModal({ project: MOCK_PROJECT });
    expect(screen.getByText("Edit Project")).toBeInTheDocument();
  });

  it("renders title and description inputs", () => {
    renderModal();
    expect(screen.getByPlaceholderText("Project title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Project description")).toBeInTheDocument();
  });

  it("renders Status select with all four options", () => {
    renderModal();
    expect(screen.getByRole("option", { name: "Planning" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "On Hold" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Completed" })).toBeInTheDocument();
  });

  it("renders Priority select with all three options", () => {
    renderModal();
    expect(screen.getByRole("option", { name: "Low" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Medium" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "High" })).toBeInTheDocument();
  });

  it("shows 'Create Project' submit button in create mode", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /create project/i })).toBeInTheDocument();
  });

  it("shows 'Save Changes' submit button in edit mode", () => {
    renderModal({ project: MOCK_PROJECT });
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("shows Cancel button", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("pre-fills title field in edit mode", () => {
    renderModal({ project: MOCK_PROJECT });
    expect(screen.getByPlaceholderText("Project title")).toHaveValue("Alpha");
  });

  it("pre-fills description in edit mode", () => {
    renderModal({ project: MOCK_PROJECT });
    expect(screen.getByPlaceholderText("Project description")).toHaveValue("Desc");
  });

  it("renders the member email search input", () => {
    renderModal();
    expect(screen.getByPlaceholderText(/enter member email/i)).toBeInTheDocument();
  });

  it("shows searching spinner when searching=true in store", async () => {
    // Simulate in-flight search: make the GET hang so searching stays true
    axiosInstance.get.mockImplementation(() => new Promise(() => {}));
    const { user } = renderModal();
    // Type a valid email to trigger the search thunk
    await user.type(
      screen.getByPlaceholderText(/enter member email/i),
      "bob@test.com"
    );
    expect(screen.getByTestId("icon-loader")).toBeInTheDocument();
  });
});

//  Validation 

describe("ProjectModal — validation", () => {
  it("shows error when title is empty on submit", async () => {
    const { user } = renderModal();
    await user.click(screen.getByRole("button", { name: /create project/i }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
  });

  it("clears title error once title is provided", async () => {
    const { user } = renderModal();
    await user.click(screen.getByRole("button", { name: /create project/i }));
    await screen.findByText("Title is required");
    await user.type(screen.getByPlaceholderText("Project title"), "New");
    await waitFor(() => {
      expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    });
  });
});

//  Close behaviour 

describe("ProjectModal — close behaviour", () => {
  it("calls onClose when Cancel is clicked", async () => {
    const { onClose, user } = renderModal();
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const { onClose } = renderModal();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when overlay backdrop is clicked", () => {
    const { onClose } = renderModal();
    fireEvent.click(document.querySelector(".modal-overlay"));
    expect(onClose).toHaveBeenCalled();
  });

  it("does NOT call onClose when clicking inside modal container", () => {
    const { onClose } = renderModal();
    fireEvent.click(document.querySelector(".modal-container"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

//  Create mode 

describe("ProjectModal — create mode", () => {
  it("dispatches createProject and calls onClose on success", async () => {
    axiosInstance.post.mockResolvedValue({
      data: { data: { project: { _id: "p-new", title: "New Project" } } },
    });
    const { onClose, user } = renderModal();
    await user.type(screen.getByPlaceholderText("Project title"), "New Project");
    await user.click(screen.getByRole("button", { name: /create project/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Project created successfully");
  });

  it("shows toast error when createProject fails", async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: "Server error" } },
    });
    const { user } = renderModal();
    await user.type(screen.getByPlaceholderText("Project title"), "Bad");
    await user.click(screen.getByRole("button", { name: /create project/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});

//  Edit mode 

describe("ProjectModal — edit mode", () => {
  it("dispatches updateProject (PUT then GET) and calls onClose on success", async () => {
    // updateProject does: PUT /projects/:id  then  GET /projects/:id
    axiosInstance.put.mockResolvedValue({});
    axiosInstance.get.mockImplementation(async (url) => {
      if (url.startsWith("/projects/")) {
        return { data: { data: { project: { ...MOCK_PROJECT, title: "Updated" } } } };
      }
      return { data: { data: {} } };
    });

    const { onClose, user } = renderModal({ project: MOCK_PROJECT });
    const titleInput = screen.getByPlaceholderText("Project title");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Project updated successfully");
  });

  it("shows toast error when updateProject fails", async () => {
    axiosInstance.put.mockRejectedValue({
      response: { data: { message: "Update failed" } },
    });
    const { user } = renderModal({ project: MOCK_PROJECT });
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});

//  Member search 

describe("ProjectModal — member search", () => {
  it("shows 'No user found' when API returns no user for the email", async () => {
    // Override: /users/search returns nothing
    axiosInstance.get.mockImplementation(async (url) => {
      if (url === "/users/search") {
        return { data: { data: { user: null } } };
      }
      return { data: { data: {} } };
    });
    const { user } = renderModal();
    await typeAndSearch(user, "ghost@test.com");
    expect(await screen.findByText(/no user found with this email/i)).toBeInTheDocument();
  });

  it("shows found user name after valid email is typed", async () => {
    const { user } = renderModal();
    await typeAndSearch(user, "bob@test.com");
    // name is in .member-result-name span
    expect(await screen.findByText("Bob")).toBeInTheDocument();
  });

  it("shows found user email in result card", async () => {
    const { user } = renderModal();
    await typeAndSearch(user, "bob@test.com");
    expect(await screen.findByText("bob@test.com")).toBeInTheDocument();
  });

  it("shows found user role in result card", async () => {
    const { user } = renderModal();
    await typeAndSearch(user, "bob@test.com");
    expect(await screen.findByText("employee")).toBeInTheDocument();
  });

  it("add button is enabled when a new user is found", async () => {
    const { user } = renderModal();
    await typeAndSearch(user, "bob@test.com");
    const addBtn = await screen.findByTitle("Add member");
    expect(addBtn).not.toBeDisabled();
  });

  it("add button is disabled when no user found", async () => {
    axiosInstance.get.mockImplementation(async (url) => {
      if (url === "/users/search") return { data: { data: { user: null } } };
      return { data: { data: {} } };
    });
    const { user } = renderModal();
    await typeAndSearch(user, "ghost@test.com");
    await screen.findByText(/no user found/i);
    expect(screen.getByTitle("Add member")).toBeDisabled();
  });

  it("add button is disabled when found user is already a member", async () => {
    // Override search to return MOCK_USER who is already in MOCK_PROJECT.members
    axiosInstance.get.mockImplementation(async (url) => {
      if (url === "/users/search") return { data: { data: { user: MOCK_USER } } };
      return { data: { data: {} } };
    });
    const { user } = renderModal({ project: MOCK_PROJECT });
    await typeAndSearch(user, "alice@test.com");
    const addBtn = await screen.findByTitle("Add member");
    expect(addBtn).toBeDisabled();
  });

  it("clicking Add in create mode adds member chip and shows success toast", async () => {
    const { user } = renderModal();
    await typeAndSearch(user, "bob@test.com");
    const addBtn = await screen.findByTitle("Add member");
    await user.click(addBtn);
    expect(toast.success).toHaveBeenCalledWith("Bob added");
  });

  it("member chip appears in the list after adding", async () => {
    const { user } = renderModal();
    await typeAndSearch(user, "bob@test.com");
    const addBtn = await screen.findByTitle("Add member");
    await user.click(addBtn);
    // The chip shows inside .selected-members
    await waitFor(() => {
      expect(document.querySelector(".selected-member-chip")).toBeInTheDocument();
    });
  });
});