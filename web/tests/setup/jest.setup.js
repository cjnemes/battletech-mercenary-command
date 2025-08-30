// Jest setup file for Battletech game testing

// Mock IndexedDB for testing
import 'fake-indexeddb/auto';

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

// Mock console methods in tests (except for intentional logging)
global.console = {
  ...console,
  // Keep log for debugging during test development
  log: console.log,
  // Mock other console methods to keep test output clean
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock requestAnimationFrame for testing animations
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16); // 60fps simulation
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock canvas context for testing tactical combat
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  drawImage: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn(),
  resetTransform: jest.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'inherit',
  fillText: jest.fn(),
  strokeText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  ellipse: jest.fn(),
  rect: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  clip: jest.fn(),
  isPointInPath: jest.fn(),
  isPointInStroke: jest.fn(),
}));

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Game-specific test utilities
global.createMockGameState = () => ({
  currentScreen: 'main-menu',
  inGame: false,
  company: {
    name: 'Test Company',
    funds: 1000000,
    rating: 'Regular',
    reputation: {
      Steiner: 0,
      Davion: 0,
      Liao: 0,
      Marik: 0,
      Kurita: 0,
      Mercenary: 25,
    },
  },
  time: {
    day: 1,
    month: 1,
    year: 3025,
  },
  pilots: [],
  mechs: [],
  contracts: [],
  selectedPilot: null,
  selectedMech: null,
  selectedContract: null,
});

// Mock DOM elements commonly used in the game
global.createMockElement = (tag = 'div') => {
  const element = document.createElement(tag);
  element.classList = {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    toggle: jest.fn(),
  };
  element.addEventListener = jest.fn();
  element.removeEventListener = jest.fn();
  element.dispatchEvent = jest.fn();
  return element;
};

// Increase test timeout for complex game operations
jest.setTimeout(10000);

// Global error handler to catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});