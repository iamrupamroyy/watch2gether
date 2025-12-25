# Watch Party

A web-based synchronized video watch party platform built with Node.js, Express, Socket.IO, and React.

## Features

- **Room System:** Create private rooms with unique codes.
- **Synchronized Playback:** Video playback is synchronized between all users in a room.
- **Real-time Communication:** Uses WebSockets for low-latency communication.
- **Host Controls:** The user who creates the room is the host and can set the video URL.
- **Drift Correction:** Automatically corrects for network and performance-related drift.

## Project Structure

```
watch-party/
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
cd watch-party/backend
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
cd watch-party/frontend
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

## Future Improvements

- **Persistent Rooms:** Use a database like Redis or a NoSQL database to store room state, so rooms are not lost when the server restarts.
- **Chat:** Add a real-time chat feature for users in a room.
- **User Authentication:** Implement user accounts to track history and assign permanent host roles.
- **Video Buffering Handling:** More robustly handle cases where a user's video is buffering. The server could be notified and potentially pause playback for everyone until the user is ready.
- **Deployment Scripts:** Add Dockerfiles and deployment scripts for easier production deployment.
- **UI/UX Enhancements:** Improve the user interface with a more polished design, loading indicators, and better error handling.
