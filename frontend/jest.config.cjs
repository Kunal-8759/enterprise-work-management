module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    // ✅ Fix: Point to src/__mocks__/
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios|react-toastify|date-fns|@hookform|react-hook-form|react-redux|@reduxjs)/)",
  ],
};