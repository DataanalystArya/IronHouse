// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  constructor(cb) {
    this.cb = cb;
  }
  observe(el) {
    if (el && this.cb) {
      this.cb([{ isIntersecting: true, target: el }]);
    }
  }
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
global.IntersectionObserver = IntersectionObserverMock;
