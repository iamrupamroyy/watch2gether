# Watch2Gether

A web-based synchronized video watch party platform built with Node.js, Express, Socket.IO, and React.

## Features

- **Room System:** Create private rooms with unique codes.
- **Synchronized Playback:** Video playback is synchronized between all users in a room.
- **Real-time Communication:** Uses WebSockets for low-latency communication.
- **Host Controls:** The user who creates the room is the host and can set the video URL.
- **Drift Correction:** Automatically corrects for network and performance-related drift.

## Project Structure

```
watch2gether/
├── backend/
│   ├── package.json
│   ├── index.js
│   ├── rooms.js
│   └── socketHandlers.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── socket.js
│   │   ├── VideoPlayer.jsx
│   │   └── utils/sync.js
└── README.md
```

## Setup and Run

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### 1. Backend Setup

First, navigate to the backend directory and install the dependencies.

```bash
cd watch2gether/backend
npm install
```

Then, you can start the backend server.

```bash
npm start
```

The server will be running on `http://localhost:3001`.

### 2. Frontend Setup

Open a **new terminal window**, navigate to the frontend directory, and install the dependencies.

```bash
cd watch2gether/frontend
npm install
```

Then, start the frontend development server.

```bash
npm run dev
```

The frontend will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

### 3. How to Use

1.  **Open the Application:** Open `http://localhost:5173` in your web browser.
2.  **Create a Room:** Click the "Create New Room" button. You will be taken to a new room and your room code will be displayed at the top.
3.  **Join a Room:** Open a new browser window or tab and navigate to `http://localhost:5173`. Enter the room code from the first window and click "Join Room".
4.  **Set Video:** As the host, paste a direct video URL (e.g., from [archive.org](https://archive.org/details/movies?tab=collection&sort=-publicdate)) into the input field and click "Set Video".
5.  **Watch Together:** The video will load for all users in the room. Play, pause, and seeking are synchronized across all clients.

## Deployment

This project can be deployed for free using services like Vercel (for the frontend) and Render (for the backend).

### Backend Deployment (Render)

1.  **Push to GitHub:** Make sure your project is on a GitHub repository.
2.  **Create a Render Account:** Sign up for a free account at [render.com](https://render.com/).
3.  **New Web Service:**
    *   On your Render dashboard, click "New" -> "Web Service".
    *   Connect your GitHub account and select your repository.
4.  **Configuration:**
    *   **Name:** Give your service a name (e.g., `watch2gether-backend`).
    *   **Root Directory:** `backend`
    *   **Environment:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
5.  **Create Web Service:** Click "Create Web Service". Render will automatically build and deploy your backend.
6.  **Get the URL:** Once deployed, Render will provide you with a public URL for your backend (e.g., `https://watch2gether-backend.onrender.com`). You will need this for the frontend configuration.

### Frontend Deployment (Vercel)

1.  **Update API Endpoint:**
    *   Before deploying the frontend, you need to tell it where to find the backend.
    *   In `frontend/src/socket.js`, change the following line:
        ```javascript
        // const socket = io("http://localhost:3001");
        const socket = io("YOUR_RENDER_BACKEND_URL"); // Replace with your actual backend URL
        ```
2.  **Push to GitHub:** Commit and push the updated `socket.js` file to your GitHub repository.
3.  **Create a Vercel Account:** Sign up for a free account at [vercel.com](https://vercel.com/).
4.  **New Project:**
    *   On your Vercel dashboard, click "Add New..." -> "Project".
    *   Import your GitHub repository.
5.  **Configuration:**
    *   **Framework Preset:** Vercel should automatically detect `Vite`.
    *   **Root Directory:** `frontend`
6.  **Deploy:** Click "Deploy". Vercel will build and deploy your React application.
7.  **Access Your Site:** Vercel will provide you with a public URL for your live site.

Now your Watch2Gether application is live and accessible to anyone!

## Future Improvements

- **Persistent Rooms:** Use a database like Redis or a NoSQL database to store room state, so rooms are not lost when the server restarts.
- **Chat:** Add a real-time chat feature for users in a room.
- **User Authentication:** Implement user accounts to track history and assign permanent host roles.
- **Video Buffering Handling:** More robustly handle cases where a user's video is buffering. The server could be notified and potentially pause playback for everyone until the user is ready.
- **Deployment Scripts:** Add Dockerfiles and deployment scripts for easier production deployment.
- **UI/UX Enhancements:** Improve the user interface with a more polished design, loading indicators, and better error handling.
