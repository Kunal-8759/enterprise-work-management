import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// ✅ Add TextEncoder/TextDecoder for React Router DOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ✅ Mock import.meta.env for Vite
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: "http://localhost:5000/api",
      MODE: "test",
      DEV: true,
      PROD: false,
    },
  },
};

// ✅ Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ✅ Mock scrollTo
window.scrollTo = jest.fn();

// ✅ Mock localStorage (if needed for tests)
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });