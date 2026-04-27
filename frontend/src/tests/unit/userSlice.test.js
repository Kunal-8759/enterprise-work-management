import userReducer, {
  clearSearchedUser,
  clearUserError,
  searchUserByEmail,
  fetchAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../../store/slices/userSlice.js";

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

const makeUser = (overrides = {}) => ({
  _id: "u1",
  name: "Alice",
  email: "alice@test.com",
  role: "employee",
  status: "active",
  ...overrides,
});

const initialState = {
  searchedUser: null,
  searching: false,
  users: [],
  loading: false,
  error: null,
};

//  Initial state 
describe("userSlice — initial state", () => {
  it("returns the correct initial state", () => {
    const state = userReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });
});

// Synchronous reducers 
describe("userSlice — clearSearchedUser", () => {
  it("sets searchedUser to null", () => {
    const state = userReducer(
      { ...initialState, searchedUser: makeUser() },
      clearSearchedUser()
    );
    expect(state.searchedUser).toBeNull();
  });

  it("also clears error when clearing searched user", () => {
    const state = userReducer(
      { ...initialState, searchedUser: makeUser(), error: "User not found" },
      clearSearchedUser()
    );
    expect(state.error).toBeNull();
  });
});

describe("userSlice — clearUserError", () => {
  it("sets error to null", () => {
    const state = userReducer(
      { ...initialState, error: "Something went wrong" },
      clearUserError()
    );
    expect(state.error).toBeNull();
  });

  it("does not affect other state fields", () => {
    const user = makeUser();
    const state = userReducer(
      { ...initialState, searchedUser: user, error: "error" },
      clearUserError()
    );
    expect(state.searchedUser).toEqual(user);
  });
});

// searchUserByEmail 
describe("userSlice — searchUserByEmail", () => {
  it("pending: sets searching=true, clears searchedUser and error", () => {
    const state = userReducer(
      { ...initialState, searchedUser: makeUser(), error: "old error" },
      pending(searchUserByEmail)
    );
    expect(state.searching).toBe(true);
    expect(state.searchedUser).toBeNull();
    expect(state.error).toBeNull();
  });

  it("fulfilled: stores the found user and sets searching=false", () => {
    const user = makeUser({ email: "alice@test.com" });
    const state = userReducer(
      { ...initialState, searching: true },
      fulfilled(searchUserByEmail, user)
    );
    expect(state.searching).toBe(false);
    expect(state.searchedUser).toEqual(user);
  });

  it("rejected: stores error message and sets searching=false", () => {
    const state = userReducer(
      { ...initialState, searching: true },
      rejected(searchUserByEmail, "Failed to search user")
    );
    expect(state.searching).toBe(false);
    expect(state.error).toBe("Failed to search user");
  });

  it("rejected: searchedUser remains null on failure", () => {
    const state = userReducer(
      { ...initialState, searching: true, searchedUser: null },
      rejected(searchUserByEmail, "Not found")
    );
    expect(state.searchedUser).toBeNull();
  });
});

//  fetchAllUsers   
describe("userSlice — fetchAllUsers", () => {
  it("pending: sets loading=true and clears error", () => {
    const state = userReducer(
      { ...initialState, error: "old error" },
      pending(fetchAllUsers)
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fulfilled: stores the users array and sets loading=false", () => {
    const users = [makeUser({ _id: "u1" }), makeUser({ _id: "u2" })];
    const state = userReducer(
      { ...initialState, loading: true },
      fulfilled(fetchAllUsers, users)
    );
    expect(state.loading).toBe(false);
    expect(state.users).toHaveLength(2);
    expect(state.users[0]._id).toBe("u1");
  });

  it("fulfilled: replaces any existing users list", () => {
    const oldUsers = [makeUser({ _id: "u0" })];
    const newUsers = [makeUser({ _id: "u1" }), makeUser({ _id: "u2" })];
    const state = userReducer(
      { ...initialState, users: oldUsers },
      fulfilled(fetchAllUsers, newUsers)
    );
    expect(state.users).toHaveLength(2);
    expect(state.users.find((u) => u._id === "u0")).toBeUndefined();
  });

  it("rejected: stores error and sets loading=false", () => {
    const state = userReducer(
      { ...initialState, loading: true },
      rejected(fetchAllUsers, "Failed to fetch users")
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch users");
  });

  it("fulfilled: works correctly with an empty users array", () => {
    const state = userReducer(
      { ...initialState, users: [makeUser()] },
      fulfilled(fetchAllUsers, [])
    );
    expect(state.users).toHaveLength(0);
  });
});

//   updateUserRole   
describe("userSlice — updateUserRole", () => {
  it("fulfilled: replaces the matching user in the list with updated role", () => {
    const users = [
      makeUser({ _id: "u1", role: "employee" }),
      makeUser({ _id: "u2", role: "employee" }),
    ];
    const updatedUser = makeUser({ _id: "u1", role: "manager" });
    const state = userReducer(
      { ...initialState, users },
      fulfilled(updateUserRole, updatedUser)
    );
    expect(state.users[0].role).toBe("manager");
    expect(state.users[1].role).toBe("employee");
  });

  it("fulfilled: does nothing when user id is not in the list", () => {
    const users = [makeUser({ _id: "u1", role: "employee" })];
    const state = userReducer(
      { ...initialState, users },
      fulfilled(updateUserRole, makeUser({ _id: "ghost", role: "admin" }))
    );
    expect(state.users[0].role).toBe("employee");
  });

  it("fulfilled: all three roles can be assigned", () => {
    ["admin", "manager", "employee"].forEach((role) => {
      const users = [makeUser({ _id: "u1", role: "employee" })];
      const updated = makeUser({ _id: "u1", role });
      const state = userReducer(
        { ...initialState, users },
        fulfilled(updateUserRole, updated)
      );
      expect(state.users[0].role).toBe(role);
    });
  });
});

//   updateUserStatus   
describe("userSlice — updateUserStatus", () => {
  it("fulfilled: replaces the matching user in the list with updated status", () => {
    const users = [makeUser({ _id: "u1", status: "active" })];
    const updatedUser = makeUser({ _id: "u1", status: "inactive" });
    const state = userReducer(
      { ...initialState, users },
      fulfilled(updateUserStatus, updatedUser)
    );
    expect(state.users[0].status).toBe("inactive");
  });

  it("fulfilled: does not affect other users in the list", () => {
    const users = [
      makeUser({ _id: "u1", status: "active" }),
      makeUser({ _id: "u2", status: "active" }),
    ];
    const updated = makeUser({ _id: "u1", status: "inactive" });
    const state = userReducer(
      { ...initialState, users },
      fulfilled(updateUserStatus, updated)
    );
    expect(state.users[1].status).toBe("active");
  });

  it("fulfilled: does nothing when user id is not found", () => {
    const users = [makeUser({ _id: "u1", status: "active" })];
    const state = userReducer(
      { ...initialState, users },
      fulfilled(updateUserStatus, makeUser({ _id: "ghost", status: "inactive" }))
    );
    expect(state.users[0].status).toBe("active");
  });
});