import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './design-system/tokens.css';
import './design-system/global.css';
import './i18n';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
