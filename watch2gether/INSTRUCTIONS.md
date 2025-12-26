# Watch2Gether Instructions

This document provides complete instructions for setting up, running, and deploying the Watch2Gether application.

## Project Structure

-   `/backend`: The Node.js, Express, and Socket.IO server.
-   `/frontend`: The React and Vite client application.

---

## 1. Local Development Setup

To run the application on your local machine, you need to have [Node.js](https://nodejs.org/) (v16 or later) and `npm` installed.

### A. Run the Backend Server

1.  Open a terminal.
2.  Navigate to the backend directory: `cd backend`
3.  Install dependencies: `npm install`
4.  Start the server: `npm start`

The backend server will be running on `http://localhost:3001`.

### B. Run the Frontend Application

1.  Open a **second, separate terminal**.
2.  Navigate to the frontend directory: `cd frontend`
3.  Install dependencies: `npm install`
4.  Start the development server: `npm run dev`

The frontend will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

### C. Important: Configure for Local Use

Before running the frontend for local development, you must ensure it is pointing to your **local backend server**.

1.  Open the file: `frontend/src/socket.js`
2.  Find the line that defines the `URL`.
3.  Make sure it is set to your local backend address:
    ```javascript
    const URL = 'http://localhost:3001';
    ```

---

## 2. Deployment to Production

This application is designed to be deployed for free on [Render](https://render.com/) (for the backend) and [Vercel](https://vercel.com/) (for the frontend).

### A. Deploy the Backend to Render

1.  **Push your code** to a GitHub repository.
2.  **Create a Render Account** and link your GitHub.
3.  **Create a "New Web Service"** on Render.
4.  Select your repository.
5.  Use the following settings during setup:
    -   **Name:** `watch2gether-backend` (or your choice)
    -   **Root Directory:** `watch2gether/backend`
    -   **Environment:** `Node`
    -   **Build Command:** `npm install`
    -   **Start Command:** `npm start`
6.  Click "Create Web Service".
7.  After the deployment is complete, Render will give you a public URL for your backend (e.g., `https://watch2gether-backend-sjgr.onrender.com`). **Copy this URL.**

### B. Deploy the Frontend to Vercel

Before deploying the frontend, you must configure it to point to your **live, deployed backend server**.

1.  **Configure for Production Use:**
    -   Open the file: `frontend/src/socket.js`
    -   Change the `URL` to your backend URL from Render:
        ```javascript
        // const URL = 'http://localhost:3001';
        const URL = 'https://your-render-backend-url.onrender.com'; // PASTE YOUR URL HERE
        ```
2.  **Commit and push** this change to your GitHub repository.
3.  **Create a Vercel Account** and link your GitHub.
4.  **Create a "New Project"** on Vercel and import your repository.
5.  Use the following settings during setup:
    *   **Framework Preset:** `Vite` (should be auto-detected)
    *   **Root Directory:** `watch2gether/frontend`
6.  Click "Deploy".

Vercel will build your application and provide you with a public URL for your live website.

---

## 3. Switching Between Local and Production

Remember to **always check the `URL` in `frontend/src/socket.js`** before running or deploying.

-   For **local development**, it must be `http://localhost:3001`.
-   For **production deployment**, it must be your live Render backend URL.

It's recommended to comment out the one you are not using, for example:

```javascript
// For Production
// const URL = 'https://watch2gether-backend-sjgr.onrender.com';

// For Local Development
const URL = 'http://localhost:3001';
```
