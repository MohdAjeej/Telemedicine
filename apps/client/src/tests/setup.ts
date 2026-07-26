import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia — polyfill it so components that read
// prefers-color-scheme (e.g. ThemeProvider) don't crash under test.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
