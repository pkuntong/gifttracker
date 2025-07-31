require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// SQLite Database
const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        preferences TEXT DEFAULT '{}'
      )`);

      // People table
      db.run(`CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        relationship TEXT,
        birthday TEXT,
        notes TEXT,
        avatar TEXT,
        family_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Gifts table
      db.run(`CREATE TABLE IF NOT EXISTS gifts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'planned',
        recipient_id TEXT,
        occasion_id TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES people (id)
      )`);

      // Occasions table
      db.run(`CREATE TABLE IF NOT EXISTS occasions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT DEFAULT 'other',
        person_id TEXT,
        description TEXT,
        budget REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (person_id) REFERENCES people (id)
      )`);

      // Budgets table
      db.run(`CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        period TEXT DEFAULT 'monthly',
        type TEXT DEFAULT 'general',
        person_id TEXT,
        occasion_id TEXT,
        description TEXT,
        start_date TEXT,
        end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (person_id) REFERENCES people (id),
        FOREIGN KEY (occasion_id) REFERENCES occasions (id)
      )`);

      console.log('✅ Database initialized successfully');
      resolve();
    });
  });
};

// Helper function to run database queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const runQuerySingle = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const runQueryInsert = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to get user data
const getUserData = async (userId) => {
  try {
    const user = await runQuerySingle(
      'SELECT id, email, name, created_at, preferences FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      preferences: user.preferences ? JSON.parse(user.preferences) : {
        currency: 'USD',
        timezone: 'UTC',
        notifications: true,
        theme: 'light'
      }
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Initialize database and start server
initDatabase().then(() => {
  // Routes

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Gift Tracker API is running' });
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await runQuerySingle(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userId = uuidv4();
      await runQueryInsert(
        'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
        [userId, email, name, passwordHash]
      );

      // Generate JWT token
      const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          email,
          name
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await runQuerySingle(
        'SELECT id, email, name, password_hash FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    // In a real app, you might want to blacklist the token
    res.json({ message: 'Logout successful' });
  });

  // User validation
  app.get('/api/user/validate', authenticateToken, async (req, res) => {
    try {
      const userData = await getUserData(req.user.userId);
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(userData);
    } catch (error) {
      console.error('User validation error:', error);
      res.status(500).json({ message: 'Validation failed' });
    }
  });

  // Contact form
  app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    console.log('Contact form submission:', { name, email, subject, message });
    res.json({ message: 'Contact form submitted successfully' });
  });

  // People routes
  app.get('/api/people', authenticateToken, async (req, res) => {
    try {
      const people = await runQuery(
        'SELECT * FROM people WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.userId]
      );
      res.json(people);
    } catch (error) {
      console.error('Get people error:', error);
      res.status(500).json({ message: 'Failed to get people' });
    }
  });

  app.post('/api/people', authenticateToken, async (req, res) => {
    try {
      const { name, email, relationship, birthday, notes, avatar, familyId } = req.body;
      const personId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO people (id, user_id, name, email, relationship, birthday, notes, avatar, family_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [personId, req.user.userId, name, email, relationship, birthday, notes, avatar, familyId]
      );

      const newPerson = await runQuerySingle(
        'SELECT * FROM people WHERE id = ?',
        [personId]
      );

      res.status(201).json(newPerson);
    } catch (error) {
      console.error('Create person error:', error);
      res.status(500).json({ message: 'Failed to create person' });
    }
  });

  // Gifts routes
  app.get('/api/gifts', authenticateToken, async (req, res) => {
    try {
      const gifts = await runQuery(
        'SELECT * FROM gifts WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.userId]
      );
      res.json(gifts);
    } catch (error) {
      console.error('Get gifts error:', error);
      res.status(500).json({ message: 'Failed to get gifts' });
    }
  });

  app.post('/api/gifts', authenticateToken, async (req, res) => {
    try {
      const { name, description, price, currency, status, recipientId, occasionId, notes } = req.body;
      const giftId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO gifts (id, user_id, name, description, price, currency, status, recipient_id, occasion_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [giftId, req.user.userId, name, description, price, currency, status, recipientId, occasionId, notes]
      );

      const newGift = await runQuerySingle(
        'SELECT * FROM gifts WHERE id = ?',
        [giftId]
      );

      res.status(201).json(newGift);
    } catch (error) {
      console.error('Create gift error:', error);
      res.status(500).json({ message: 'Failed to create gift' });
    }
  });

  // Occasions routes
  app.get('/api/occasions', authenticateToken, async (req, res) => {
    try {
      const occasions = await runQuery(
        'SELECT * FROM occasions WHERE user_id = ? ORDER BY date ASC',
        [req.user.userId]
      );
      res.json(occasions);
    } catch (error) {
      console.error('Get occasions error:', error);
      res.status(500).json({ message: 'Failed to get occasions' });
    }
  });

  app.post('/api/occasions', authenticateToken, async (req, res) => {
    try {
      const { name, date, type, personId, description, budget } = req.body;
      const occasionId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO occasions (id, user_id, name, date, type, person_id, description, budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [occasionId, req.user.userId, name, date, type, personId, description, budget]
      );

      const newOccasion = await runQuerySingle(
        'SELECT * FROM occasions WHERE id = ?',
        [occasionId]
      );

      res.status(201).json(newOccasion);
    } catch (error) {
      console.error('Create occasion error:', error);
      res.status(500).json({ message: 'Failed to create occasion' });
    }
  });

  // Budgets routes
  app.get('/api/budgets', authenticateToken, async (req, res) => {
    try {
      const budgets = await runQuery(
        'SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.userId]
      );
      res.json(budgets);
    } catch (error) {
      console.error('Get budgets error:', error);
      res.status(500).json({ message: 'Failed to get budgets' });
    }
  });

  app.post('/api/budgets', authenticateToken, async (req, res) => {
    try {
      const { name, amount, currency, period, type, personId, occasionId, description, startDate, endDate } = req.body;
      const budgetId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO budgets (id, user_id, name, amount, currency, period, type, person_id, occasion_id, description, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [budgetId, req.user.userId, name, amount, currency, period, type, personId, occasionId, description, startDate, endDate]
      );

      const newBudget = await runQuerySingle(
        'SELECT * FROM budgets WHERE id = ?',
        [budgetId]
      );

      res.status(201).json(newBudget);
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({ message: 'Failed to create budget' });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Gift Tracker API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: SQLite (${dbPath})`);
  });
}).catch(error => {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
}); 