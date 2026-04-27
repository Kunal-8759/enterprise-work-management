import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import notificationReducer from "../../store/slices/notificationSlice.js";
import NotificationDropdown from "../../features/notifications/NotificationDropdown.jsx";

jest.mock("../../services/api.js", () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request:  { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

jest.mock("lucide-react", () => ({
  Trash2:  () => <span data-testid="trash-icon" />,
  BellOff: () => <svg data-testid="bell-off-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}));

jest.mock("date-fns", () => ({
  formatDistanceToNow: () => "2 minutes ago",
}));

import axiosInstance from "../../services/api.js";

const makeNotification = (overrides = {}) => ({
  _id: "n1",
  message: "You were assigned a task",
  type: "task_assigned",
  read: false,
  createdAt: new Date().toISOString(),
  sender: { name: "Bob" },
  referenceModel: "Task",
  reference: "task-123",
  ...overrides,
});

const makeStore = (notifications = [], unreadCount = 0, loading = false) => {
  axiosInstance.get.mockResolvedValue({
    data: { data: { notifications, unreadCount } },
  });
  return configureStore({
    reducer: { notifications: notificationReducer },
    preloadedState: {
      notifications: { notifications, unreadCount, loading, error: null },
    },
  });
};

const renderDropdown = ({ notifications = [], unreadCount = 0, loading = false, onClose, bellRef } = {}) => {
  const mockOnClose = onClose || jest.fn();
  const mockBellRef = bellRef || { current: null };
  const store = makeStore(notifications, unreadCount, loading);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <NotificationDropdown onClose={mockOnClose} bellRef={mockBellRef} />
      </MemoryRouter>
    </Provider>
  );
  return { store, onClose: mockOnClose };
};

beforeEach(() => { jest.clearAllMocks(); });

describe("NotificationDropdown — renders correctly", () => {
  it("renders the Notifications heading", async () => {
    renderDropdown();
    expect(await screen.findByText("Notifications")).toBeInTheDocument();
  });

  it("shows 'No notifications yet' when the list is empty", async () => {
    renderDropdown({ notifications: [] });
    expect(await screen.findByText(/no notifications yet/i)).toBeInTheDocument();
  });

  it("shows the BellOff icon when there are no notifications", async () => {
    renderDropdown({ notifications: [] });
    expect(await screen.findByTestId("bell-off-icon")).toBeInTheDocument();
  });

  it("shows loading spinner while fetching", async () => {
    renderDropdown({ loading: true });
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });
});

describe("NotificationDropdown — with notifications", () => {
  it("renders the notification message", async () => {
    renderDropdown({ notifications: [makeNotification({ message: "Alice assigned you a task" })] });
    expect(await screen.findByText("Alice assigned you a task")).toBeInTheDocument();
  });

  it("renders the sender name", async () => {
    renderDropdown({ notifications: [makeNotification({ sender: { name: "Charlie" } })] });
    expect(await screen.findByText((content) => content.includes("Charlie"))).toBeInTheDocument();
  });

  it("renders the formatted time", async () => {
    renderDropdown({ notifications: [makeNotification()] });
    expect(await screen.findByText("2 minutes ago")).toBeInTheDocument();
  });

  it("renders correct badge for task_assigned", async () => {
    renderDropdown({ notifications: [makeNotification({ type: "task_assigned" })] });
    expect(await screen.findByText("Assigned")).toBeInTheDocument();
  });

  it("renders correct badge for comment_added", async () => {
    renderDropdown({ notifications: [makeNotification({ type: "comment_added" })] });
    expect(await screen.findByText("Comment")).toBeInTheDocument();
  });

  it("renders correct badge for member_added", async () => {
    renderDropdown({ notifications: [makeNotification({ type: "member_added" })] });
    expect(await screen.findByText("Member")).toBeInTheDocument();
  });

  it("renders correct badge for task_status_changed", async () => {
    renderDropdown({ notifications: [makeNotification({ type: "task_status_changed" })] });
    expect(await screen.findByText("Status")).toBeInTheDocument();
  });

  it("renders multiple notifications", async () => {
    const notifications = [
      makeNotification({ _id: "n1", message: "Message One" }),
      makeNotification({ _id: "n2", message: "Message Two" }),
    ];
    renderDropdown({ notifications });
    expect(await screen.findByText("Message One")).toBeInTheDocument();
    expect(screen.getByText("Message Two")).toBeInTheDocument();
  });
});

describe("NotificationDropdown — unread count display", () => {
  it("shows the unread count badge when unreadCount > 0", async () => {
    renderDropdown({ notifications: [makeNotification({ read: false })], unreadCount: 3 });
    expect(await screen.findByText("3 new")).toBeInTheDocument();
  });

  it("hides the unread count badge when unreadCount is 0", async () => {
    renderDropdown({ notifications: [], unreadCount: 0 });
    await screen.findByText("Notifications");
    expect(screen.queryByText(/new/)).not.toBeInTheDocument();
  });

  it("shows 'Mark all as read' button when unreadCount > 0", async () => {
    renderDropdown({ notifications: [makeNotification({ read: false })], unreadCount: 1 });
    expect(await screen.findByRole("button", { name: /mark all as read/i })).toBeInTheDocument();
  });

  it("hides 'Mark all as read' button when unreadCount is 0", async () => {
    renderDropdown({ notifications: [], unreadCount: 0 });
    await screen.findByText("Notifications");
    expect(screen.queryByRole("button", { name: /mark all as read/i })).not.toBeInTheDocument();
  });
});

describe("NotificationDropdown — interactions", () => {
  it("clicking 'Mark all as read' dispatches markAllAsRead", async () => {
    axiosInstance.patch.mockResolvedValue({});
    renderDropdown({ notifications: [makeNotification({ read: false })], unreadCount: 1 });
    const btn = await screen.findByRole("button", { name: /mark all as read/i });
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith("/notifications/mark-all-read");
    });
  });

  it("clicking the delete button dispatches deleteNotification", async () => {
    axiosInstance.delete.mockResolvedValue({});
    renderDropdown({ notifications: [makeNotification({ _id: "n1" })], unreadCount: 1 });
    const deleteBtn = await screen.findByTitle("Delete");
    await act(async () => { fireEvent.click(deleteBtn); });
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith("/notifications/n1");
    });
  });

  it("clicking an unread notification calls markAsRead", async () => {
    axiosInstance.patch.mockResolvedValue({});
    renderDropdown({
      notifications: [makeNotification({ _id: "n1", read: false, message: "You were assigned a task" })],
      unreadCount: 1,
    });
    const item = await screen.findByText("You were assigned a task");
    await act(async () => { fireEvent.click(item.closest(".notif-item")); });
    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith("/notifications/n1/read");
    });
  });

  it("clicking an already-read notification does NOT call markAsRead", async () => {
    axiosInstance.patch.mockResolvedValue({});
    renderDropdown({
      notifications: [makeNotification({ _id: "n1", read: true, message: "Already read message" })],
      unreadCount: 0,
    });
    const item = await screen.findByText("Already read message");
    await act(async () => { fireEvent.click(item.closest(".notif-item")); });
    await waitFor(() => {
      expect(axiosInstance.patch).not.toHaveBeenCalledWith("/notifications/n1/read");
    });
  });
});

describe("NotificationDropdown — dispatches fetchNotifications on mount", () => {
  it("calls GET /notifications when component mounts", async () => {
    renderDropdown();
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith("/notifications");
    });
  });
});