import React from 'react';
import '@testing-library/jest-dom';

global.React = React;

function createLocalStorageMock() {
  let store = {};

  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },

    setItem(key, value) {
      store[key] = String(value);
    },

    removeItem(key) {
      delete store[key];
    },

    clear() {
      store = {};
    },
  };
}

const localStorageMock = createLocalStorageMock();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});