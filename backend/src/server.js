import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbConfig.js';

import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

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
app.listen(PORT,async() => {
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