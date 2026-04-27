
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoute.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoute.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

import { createServer } from "http";
import { initSocket } from "./socket/socket.js";

dotenv.config();

// Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
const httpServer = createServer(app);
initSocket(httpServer);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Enterprise Work Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth'
    }
  });
});


// Start server
httpServer.listen(PORT,async() => {
  try{
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
    await connectDB();
    console.log('Database connection established successfully');
  }
  catch(error){
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
});