import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import talentsRoutes from './routes/talents.js';
import authRoutes from './routes/auth.js';
import collaborationRoutes from './routes/collaboration.js';
import { initDatabase } from './database/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Carte des Talents API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    
    // Routes (after DB init)
    app.use('/api/talents', talentsRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/collaboration', collaborationRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
