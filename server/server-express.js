const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Gift Tracker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    modules: {
      express: typeof express,
      cors: typeof cors
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Express server is working!',
    method: req.method,
    url: req.url,
    headers: req.headers.host,
    timestamp: new Date().toISOString()
  });
});

// Authentication test endpoint
app.post('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth endpoint is working!',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// People test endpoint
app.get('/api/people/test', (req, res) => {
  res.json({
    message: 'People endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Gifts test endpoint
app.get('/api/gifts/test', (req, res) => {
  res.json({
    message: 'Gifts endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Default response for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint not found',
    availableEndpoints: [
      '/api/health',
      '/api/test',
      '/api/auth/test',
      '/api/people/test',
      '/api/gifts/test'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gift Tracker API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Using Express and CORS`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
}); 