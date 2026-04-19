#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Clear screen before starting
process.stdout.write('\x1B[2J\x1B[H');

render(<App />);
