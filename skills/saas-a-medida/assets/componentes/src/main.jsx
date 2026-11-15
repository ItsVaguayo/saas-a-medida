import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './tema.css';
import './base.css';
import { Catalogo } from './catalogo/Catalogo.jsx';

createRoot(document.getElementById('raiz')).render(<StrictMode><Catalogo /></StrictMode>);
