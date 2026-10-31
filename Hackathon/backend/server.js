import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import staffRoutes from './routes/staff.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server & production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Brightloop Operations API',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);

// Serve static frontend when built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error: ' + err.message
  });
});

// Start Server & Connect Database
async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`✦ Brightloop API Server running on http://localhost:${PORT}`);
  });
}

startServer();
