

// Mock the API service completely
jest.mock("../../../src/services/api.js", () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    defaults: {
      headers: { common: {} }
    }
  };
  return {
    __esModule: true,
    default: mockAxiosInstance
  };
});

// Mock socket
jest.mock("../../../src/socket/socket.js", () => ({
  disconnectSocket: jest.fn(),
}));

// Mock Vite's import.meta.env globally
global.importMeta = {
  env: {
    VITE_API_BASE_URL: "http://localhost:5000/api",
    MODE: "test",
    DEV: true,
    PROD: false,
  }
};

// Manually define import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_BASE_URL: "http://localhost:5000/api",
        MODE: "test",
        DEV: true,
        PROD: false,
      }
    }
  },
  writable: true
});

// Now import the slice
import authReducer, {
  clearError,
  setUser,
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
  updateProfile,
  changePassword,
} from "../../../src/store/slices/authSlice";

// Mock localStorage / sessionStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
Object.defineProperty(window, "sessionStorage", { value: localStorageMock });

// Helper functions
const mockUser = { _id: "u1", name: "Alice", email: "alice@test.com", role: "admin", id: "u1" };

const pending = (thunk) => ({ type: thunk.pending.type });
const fulfilled = (thunk, payload) => ({ type: thunk.fulfilled.type, payload });
const rejected = (thunk, payload) => ({ type: thunk.rejected.type, payload });

//  Initial State 

describe("authSlice — initial state", () => {
  beforeEach(() => localStorageMock.clear());

  it("sets isAuthenticated=false when no token exists", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("sets isAuthenticated=true when accessToken is in localStorage", () => {
    localStorageMock.setItem("accessToken", "fake-token");
    
    // Re-import to evaluate initialState with token present
    jest.resetModules();
    
    // Re-mock the API after reset
    jest.doMock("../../../src/services/api.js", () => ({
      __esModule: true,
      default: {
        post: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      }
    }));
    
    const { default: freshReducer } = require("../../../src/store/slices/authSlice");
    const state = freshReducer(undefined, { type: "@@INIT" });
    expect(state.isAuthenticated).toBe(true);
  });
});

//  Synchronous Reducers 

describe("authSlice — synchronous reducers", () => {
  it("clearError: sets error to null", () => {
    const initialState = { error: "Something went wrong" };
    const state = authReducer(initialState, clearError());
    expect(state.error).toBeNull();
  });

  it("setUser: sets user and marks authenticated", () => {
    const state = authReducer({ user: null, isAuthenticated: false }, setUser(mockUser));
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });
});

//  loginUser 

describe("authSlice — loginUser", () => {
  it("pending: sets loading=true, clears error", () => {
    const state = authReducer({ loading: false, error: "old error" }, pending(loginUser));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fulfilled: sets user, isAuthenticated, loading=false", () => {
    const payload = { user: mockUser, accessToken: "token-abc" };
    const state = authReducer({ loading: true }, fulfilled(loginUser, payload));
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it("rejected: stores error message, loading=false", () => {
    const state = authReducer({ loading: true, error: null }, rejected(loginUser, "Invalid credentials"));
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Invalid credentials");
  });
});

//  registerUser 

describe("authSlice — registerUser", () => {
  it("fulfilled: user is set but isAuthenticated remains false (email verification flow)", () => {
    const payload = { user: mockUser };
    const state = authReducer({}, fulfilled(registerUser, payload));
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(false);
  });

  it("rejected: captures error", () => {
    const state = authReducer({}, rejected(registerUser, "Email already in use"));
    expect(state.error).toBe("Email already in use");
  });
});

//  logoutUser 

describe("authSlice — logoutUser", () => {
  it("fulfilled: clears user, sets isAuthenticated=false", () => {
    const preState = { user: mockUser, isAuthenticated: true, loading: false, error: "some error" };
    const state = authReducer(preState, { type: logoutUser.fulfilled.type });
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });
});

//  fetchCurrentUser 

describe("authSlice — fetchCurrentUser", () => {
  it("pending: sets userLoading=true", () => {
    const state = authReducer({ userLoading: false }, pending(fetchCurrentUser));
    expect(state.userLoading).toBe(true);
  });

  it("fulfilled: populates user, sets isAuthenticated=true", () => {
    const state = authReducer({ userLoading: true }, fulfilled(fetchCurrentUser, mockUser));
    expect(state.userLoading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("rejected: clears user and isAuthenticated", () => {
    const preState = { userLoading: true, user: mockUser, isAuthenticated: true };
    const state = authReducer(preState, { type: fetchCurrentUser.rejected.type });
    expect(state.userLoading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

//  updateProfile ───────────────────────────────────────────────────────────────

describe("authSlice — updateProfile", () => {
  it("fulfilled: merges updated fields into existing user", () => {
    const preState = { user: { ...mockUser } };
    const updated = { name: "Alice Updated", avatar: "avatar.png" };
    const state = authReducer(preState, fulfilled(updateProfile, updated));
    expect(state.user.name).toBe("Alice Updated");
    expect(state.user.email).toBe(mockUser.email);
    expect(state.user.avatar).toBe("avatar.png");
  });
});