// Global test setup — runs before every test file.
// Makes React available globally (needed for JSX transform in vitest + jsdom)
// and loads jest-dom so we can use matchers like toBeInTheDocument().
import React from 'react';
import '@testing-library/jest-dom';

global.React = React;
