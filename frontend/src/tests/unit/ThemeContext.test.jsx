import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../../../src/context/ThemeContext";

// ─── Setup localStorage mock ─────────────────────────────────────────────────
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

// ─── Consumer component for testing context ──────────────────────────────────
const ThemeConsumer = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-status">{isDark ? "dark" : "light"}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

const renderWithTheme = () =>
  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.body.classList.remove("dark");
    jest.resetModules();
  });

  it("defaults to light theme when no localStorage key is set", () => {
    renderWithTheme();
    expect(screen.getByTestId("theme-status")).toHaveTextContent("light");
  });

  it("defaults to dark theme when localStorage has theme=dark", () => {
    localStorageMock.setItem("theme", "dark");
    renderWithTheme();
    expect(screen.getByTestId("theme-status")).toHaveTextContent("dark");
  });

  it("toggling switches from light to dark", async () => {
    const user = userEvent.setup();
    renderWithTheme();
    expect(screen.getByTestId("theme-status")).toHaveTextContent("light");
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByTestId("theme-status")).toHaveTextContent("dark");
  });

  it("toggling twice returns to light theme", async () => {
    const user = userEvent.setup();
    renderWithTheme();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByTestId("theme-status")).toHaveTextContent("light");
  });

  it("adds 'dark' class to document.body when theme is toggled to dark", async () => {
    const user = userEvent.setup();
    renderWithTheme();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(document.body.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class from document.body when toggled back to light", async () => {
    const user = userEvent.setup();
    localStorageMock.setItem("theme", "dark");
    renderWithTheme();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(document.body.classList.contains("dark")).toBe(false);
  });

  it("persists dark theme to localStorage after toggle", async () => {
    const user = userEvent.setup();
    renderWithTheme();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(localStorageMock.getItem("theme")).toBe("dark");
  });

  it("persists light theme to localStorage after toggling back", async () => {
    const user = userEvent.setup();
    localStorageMock.setItem("theme", "dark");
    renderWithTheme();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(localStorageMock.getItem("theme")).toBe("light");
  });
});