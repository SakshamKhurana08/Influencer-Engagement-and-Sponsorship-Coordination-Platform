import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.confirm (returns true by default — tests can override)
window.confirm = vi.fn(() => true);

// Mock window.location.href assignment
delete window.location;
window.location = { href: '', assign: vi.fn(), reload: vi.fn() };

// Suppress console.error noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {});
