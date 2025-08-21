import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { login, startAuthHeartbeat } from './services/authService';

// Ensure we have a token at startup and start heartbeat
(async () => {
  try {
    await login('admin', 'admin');
  } catch (e) {
    console.error('Initial login failed', e);
  }
  startAuthHeartbeat();
  createRoot(document.getElementById('root')!).render(<App />);
})();
