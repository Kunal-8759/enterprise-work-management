import notificationReducer, {
  addNotification,
  clearNotificationError,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../store/slices/notificationSlice.js";

jest.mock("../../services/api.js", () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    put:    jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request:  { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

//  helpers 
const pending   = (thunk)          => ({ type: thunk.pending.type });
const fulfilled = (thunk, payload) => ({ type: thunk.fulfilled.type, payload });
const rejected  = (thunk, payload) => ({ type: thunk.rejected.type, payload });

const makeNotification = (overrides = {}) => ({
  _id: "n1",
  message: "You were assigned a task",
  type: "task_assigned",
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

//  Initial state 
describe("notificationSlice — initial state", () => {
  it("returns the correct initial state", () => {
    const state = notificationReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });
});

//  Synchronous reducers 
describe("notificationSlice — addNotification", () => {
  it("prepends the new notification to the front of the list", () => {
    const existing = makeNotification({ _id: "n0" });
    const incoming = makeNotification({ _id: "n1", message: "New task" });
    const state = notificationReducer(
      { ...initialState, notifications: [existing], unreadCount: 1 },
      addNotification(incoming)
    );
    expect(state.notifications[0]).toEqual(incoming);
    expect(state.notifications[1]).toEqual(existing);
  });

  it("increments unreadCount by 1", () => {
    const state = notificationReducer(
      { ...initialState, unreadCount: 3 },
      addNotification(makeNotification())
    );
    expect(state.unreadCount).toBe(4);
  });
});

describe("notificationSlice — clearNotificationError", () => {
  it("sets error to null", () => {
    const state = notificationReducer(
      { ...initialState, error: "Something went wrong" },
      clearNotificationError()
    );
    expect(state.error).toBeNull();
  });
});

//  fetchNotifications 
describe("notificationSlice — fetchNotifications", () => {
  it("pending: sets loading=true and clears error", () => {
    const state = notificationReducer(
      { ...initialState, error: "old error" },
      pending(fetchNotifications)
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fulfilled: populates notifications and unreadCount", () => {
    const payload = {
      notifications: [makeNotification({ _id: "n1" }), makeNotification({ _id: "n2", read: true })],
      unreadCount: 1,
    };
    const state = notificationReducer(
      { ...initialState, loading: true },
      fulfilled(fetchNotifications, payload)
    );
    expect(state.loading).toBe(false);
    expect(state.notifications).toHaveLength(2);
    expect(state.unreadCount).toBe(1);
  });

  it("rejected: stores error message and sets loading=false", () => {
    const state = notificationReducer(
      { ...initialState, loading: true },
      rejected(fetchNotifications, "Failed to fetch notifications")
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch notifications");
  });
});

//  markAsRead 
describe("notificationSlice — markAsRead", () => {
  it("marks the matching notification as read", () => {
    const notif = makeNotification({ _id: "n1", read: false });
    const state = notificationReducer(
      { ...initialState, notifications: [notif], unreadCount: 1 },
      fulfilled(markAsRead, "n1")
    );
    expect(state.notifications[0].read).toBe(true);
  });

  it("decrements unreadCount by 1 when notification was unread", () => {
    const notif = makeNotification({ _id: "n1", read: false });
    const state = notificationReducer(
      { ...initialState, notifications: [notif], unreadCount: 2 },
      fulfilled(markAsRead, "n1")
    );
    expect(state.unreadCount).toBe(1);
  });

  it("does NOT decrement unreadCount if notification was already read", () => {
    const notif = makeNotification({ _id: "n1", read: true });
    const state = notificationReducer(
      { ...initialState, notifications: [notif], unreadCount: 0 },
      fulfilled(markAsRead, "n1")
    );
    expect(state.unreadCount).toBe(0);
  });

  it("does nothing when the id does not match any notification", () => {
    const notif = makeNotification({ _id: "n1" });
    const state = notificationReducer(
      { ...initialState, notifications: [notif], unreadCount: 1 },
      fulfilled(markAsRead, "non-existent-id")
    );
    expect(state.unreadCount).toBe(1);
    expect(state.notifications[0].read).toBe(false);
  });

  it("unreadCount never goes below 0", () => {
    const notif = makeNotification({ _id: "n1", read: false });
    const state = notificationReducer(
      { ...initialState, notifications: [notif], unreadCount: 0 },
      fulfilled(markAsRead, "n1")
    );
    expect(state.unreadCount).toBe(0);
  });
});

//  markAllAsRead 
describe("notificationSlice — markAllAsRead", () => {
  it("sets read=true on every notification", () => {
    const notifications = [
      makeNotification({ _id: "n1", read: false }),
      makeNotification({ _id: "n2", read: false }),
      makeNotification({ _id: "n3", read: true }),
    ];
    const state = notificationReducer(
      { ...initialState, notifications, unreadCount: 2 },
      fulfilled(markAllAsRead, undefined)
    );
    expect(state.notifications.every((n) => n.read === true)).toBe(true);
  });

  it("resets unreadCount to 0", () => {
    const notifications = [
      makeNotification({ _id: "n1", read: false }),
      makeNotification({ _id: "n2", read: false }),
    ];
    const state = notificationReducer(
      { ...initialState, notifications, unreadCount: 2 },
      fulfilled(markAllAsRead, undefined)
    );
    expect(state.unreadCount).toBe(0);
  });

  it("works correctly when there are no notifications", () => {
    const state = notificationReducer(
      { ...initialState, notifications: [], unreadCount: 0 },
      fulfilled(markAllAsRead, undefined)
    );
    expect(state.unreadCount).toBe(0);
    expect(state.notifications).toHaveLength(0);
  });
});

//  deleteNotification  
describe("notificationSlice — deleteNotification", () => {
  it("removes the notification with the matching id", () => {
    const notifications = [
      makeNotification({ _id: "n1" }),
      makeNotification({ _id: "n2" }),
    ];
    const state = notificationReducer(
      { ...initialState, notifications },
      fulfilled(deleteNotification, "n1")
    );
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]._id).toBe("n2");
  });

  it("decrements unreadCount when the deleted notification was unread", () => {
    const notifications = [makeNotification({ _id: "n1", read: false })];
    const state = notificationReducer(
      { ...initialState, notifications, unreadCount: 1 },
      fulfilled(deleteNotification, "n1")
    );
    expect(state.unreadCount).toBe(0);
  });

  it("does NOT decrement unreadCount when the deleted notification was already read", () => {
    const notifications = [makeNotification({ _id: "n1", read: true })];
    const state = notificationReducer(
      { ...initialState, notifications, unreadCount: 0 },
      fulfilled(deleteNotification, "n1")
    );
    expect(state.unreadCount).toBe(0);
  });

  it("unreadCount never goes below 0 on delete", () => {
    const notifications = [makeNotification({ _id: "n1", read: false })];
    const state = notificationReducer(
      { ...initialState, notifications, unreadCount: 0 },
      fulfilled(deleteNotification, "n1")
    );
    expect(state.unreadCount).toBe(0);
  });

  it("leaves state unchanged when id does not exist", () => {
    const notifications = [makeNotification({ _id: "n1" })];
    const state = notificationReducer(
      { ...initialState, notifications, unreadCount: 1 },
      fulfilled(deleteNotification, "ghost-id")
    );
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
  });
});