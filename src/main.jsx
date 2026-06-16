// FitOS — Entry Point
// This file imports all component slices so Vite bundles them together
import React from 'react';
import { createRoot } from 'react-dom/client';
import './config.jsx';
import './warmup.jsx';
import './session.jsx';
import './classes.jsx';
import './catalog.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App/>);
