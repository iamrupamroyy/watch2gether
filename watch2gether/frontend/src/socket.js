// frontend/src/socket.js
import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
// In development, this will be http://localhost:5173 (Vite dev server)
// and the backend is on http://localhost:3001. CORS is needed.
// In production, you would serve the frontend build from the Express server,
// so they would share the same origin.
const URL = 'https://watch2gether-backend-sjgr.onrender.com';

export const socket = io(URL);
