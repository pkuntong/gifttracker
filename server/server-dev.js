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

      // Expenses table
      db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        description TEXT,
        category TEXT DEFAULT 'general',
        budget_id TEXT,
        gift_id TEXT,
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (budget_id) REFERENCES budgets (id),
        FOREIGN KEY (gift_id) REFERENCES gifts (id)
      )`);

      // Families table
      db.run(`CREATE TABLE IF NOT EXISTS families (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Gift preferences table
      db.run(`CREATE TABLE IF NOT EXISTS gift_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        person_id TEXT NOT NULL,
        interests TEXT DEFAULT '[]',
        hobbies TEXT DEFAULT '[]',
        favorite_categories TEXT DEFAULT '[]',
        price_range TEXT DEFAULT '{}',
        preferred_stores TEXT DEFAULT '[]',
        allergies TEXT DEFAULT '[]',
        dislikes TEXT DEFAULT '[]',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (person_id) REFERENCES people (id)
      )`);

      // Reports table
      db.run(`CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        filters TEXT DEFAULT '{}',
        frequency TEXT DEFAULT 'manual',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Reminders table
      db.run(`CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        person_id TEXT,
        occasion_id TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (person_id) REFERENCES people (id),
        FOREIGN KEY (occasion_id) REFERENCES occasions (id)
      )`);

      // Gift ideas table
      db.run(`CREATE TABLE IF NOT EXISTS gift_ideas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        price_range TEXT DEFAULT '{}',
        tags TEXT DEFAULT '[]',
        source TEXT,
        url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Wishlists table
      db.run(`CREATE TABLE IF NOT EXISTS wishlists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        person_id TEXT,
        occasion TEXT,
        privacy TEXT DEFAULT 'private',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (person_id) REFERENCES people (id)
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
        user: {
          id: userId,
          email,
          name
        },
        session: {
          access_token: token
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
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        session: {
          access_token: token
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

  app.put('/api/people/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, relationship, birthday, notes, avatar, familyId } = req.body;
      
      await runQueryInsert(
        'UPDATE people SET name = ?, email = ?, relationship = ?, birthday = ?, notes = ?, avatar = ?, family_id = ? WHERE id = ? AND user_id = ?',
        [name, email, relationship, birthday, notes, avatar, familyId, id, req.user.userId]
      );

      const updatedPerson = await runQuerySingle(
        'SELECT * FROM people WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!updatedPerson) {
        return res.status(404).json({ message: 'Person not found' });
      }

      res.json(updatedPerson);
    } catch (error) {
      console.error('Update person error:', error);
      res.status(500).json({ message: 'Failed to update person' });
    }
  });

  app.delete('/api/people/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      await runQueryInsert(
        'DELETE FROM people WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      res.json({ message: 'Person deleted successfully' });
    } catch (error) {
      console.error('Delete person error:', error);
      res.status(500).json({ message: 'Failed to delete person' });
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

  app.put('/api/gifts/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, currency, status, recipientId, occasionId, notes } = req.body;
      
      await runQueryInsert(
        'UPDATE gifts SET name = ?, description = ?, price = ?, currency = ?, status = ?, recipient_id = ?, occasion_id = ?, notes = ? WHERE id = ? AND user_id = ?',
        [name, description, price, currency, status, recipientId, occasionId, notes, id, req.user.userId]
      );

      const updatedGift = await runQuerySingle(
        'SELECT * FROM gifts WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!updatedGift) {
        return res.status(404).json({ message: 'Gift not found' });
      }

      res.json(updatedGift);
    } catch (error) {
      console.error('Update gift error:', error);
      res.status(500).json({ message: 'Failed to update gift' });
    }
  });

  app.delete('/api/gifts/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      await runQueryInsert(
        'DELETE FROM gifts WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      res.json({ message: 'Gift deleted successfully' });
    } catch (error) {
      console.error('Delete gift error:', error);
      res.status(500).json({ message: 'Failed to delete gift' });
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

  app.put('/api/occasions/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, date, type, personId, description, budget } = req.body;
      
      await runQueryInsert(
        'UPDATE occasions SET name = ?, date = ?, type = ?, person_id = ?, description = ?, budget = ? WHERE id = ? AND user_id = ?',
        [name, date, type, personId, description, budget, id, req.user.userId]
      );

      const updatedOccasion = await runQuerySingle(
        'SELECT * FROM occasions WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      if (!updatedOccasion) {
        return res.status(404).json({ message: 'Occasion not found' });
      }

      res.json(updatedOccasion);
    } catch (error) {
      console.error('Update occasion error:', error);
      res.status(500).json({ message: 'Failed to update occasion' });
    }
  });

  app.delete('/api/occasions/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      await runQueryInsert(
        'DELETE FROM occasions WHERE id = ? AND user_id = ?',
        [id, req.user.userId]
      );

      res.json({ message: 'Occasion deleted successfully' });
    } catch (error) {
      console.error('Delete occasion error:', error);
      res.status(500).json({ message: 'Failed to delete occasion' });
    }
  });

  // Expenses routes
  app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
      const expenses = await runQuery(
        'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC',
        [req.user.userId]
      );
      
      // Transform the data to match the frontend expectations
      const transformedExpenses = expenses.map(expense => ({
        id: expense.id,
        amount: parseFloat(expense.amount) || 0,
        currency: expense.currency || 'USD',
        category: expense.category || 'general',
        recipient: expense.description || 'Unknown',
        occasion: 'General',
        date: new Date(expense.date),
        description: expense.description,
        tags: [],
        status: 'completed',
        paymentMethod: 'Unknown',
        location: null
      }));
      
      res.json(transformedExpenses);
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({ message: 'Failed to get expenses' });
    }
  });

  app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
      const { amount, currency, description, category, budgetId, giftId, date } = req.body;
      const expenseId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO expenses (id, user_id, amount, currency, description, category, budget_id, gift_id, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [expenseId, req.user.userId, amount, currency, description, category, budgetId, giftId, date]
      );

      const newExpense = await runQuerySingle(
        'SELECT * FROM expenses WHERE id = ?',
        [expenseId]
      );

      res.status(201).json(newExpense);
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({ message: 'Failed to create expense' });
    }
  });

  // Families routes
  app.get('/api/families', authenticateToken, async (req, res) => {
    try {
      const families = await runQuery(
        'SELECT * FROM families WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.userId]
      );
      
      // Transform the data to match the frontend expectations
      const transformedFamilies = families.map(family => ({
        id: family.id,
        name: family.name,
        description: family.description,
        memberCount: 0, // We'll calculate this
        createdAt: family.created_at,
        updatedAt: family.created_at
      }));
      
      res.json(transformedFamilies);
    } catch (error) {
      console.error('Get families error:', error);
      res.status(500).json({ message: 'Failed to get families' });
    }
  });

  app.post('/api/families', authenticateToken, async (req, res) => {
    try {
      const { name, description } = req.body;
      const familyId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO families (id, user_id, name, description) VALUES (?, ?, ?, ?)',
        [familyId, req.user.userId, name, description]
      );

      const newFamily = await runQuerySingle(
        'SELECT * FROM families WHERE id = ?',
        [familyId]
      );

      res.status(201).json(newFamily);
    } catch (error) {
      console.error('Create family error:', error);
      res.status(500).json({ message: 'Failed to create family' });
    }
  });

  // Budgets routes
  app.get('/api/budgets', authenticateToken, async (req, res) => {
    try {
      const budgets = await runQuery(
        'SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.userId]
      );
      
      // Transform the data to match the frontend expectations
      const transformedBudgets = budgets.map(budget => ({
        id: budget.id,
        name: budget.name,
        amount: parseFloat(budget.amount) || 0,
        spent: 0, // We'll calculate this from expenses
        currency: budget.currency || 'USD',
        period: budget.period || 'monthly',
        startDate: new Date(budget.start_date),
        endDate: budget.end_date ? new Date(budget.end_date) : null,
        category: budget.type || 'general',
        status: 'on_track', // Default status
        priority: 'medium', // Default priority
        description: budget.description,
        tags: [],
        notifications: true,
        autoAdjust: false
      }));
      
      res.json(transformedBudgets);
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

  // Financial Insights route
  app.get('/api/financial-insights', authenticateToken, async (req, res) => {
    try {
      // Generate mock insights for now
      const insights = [
        {
          id: '1',
          type: 'savings',
          title: 'Budget Optimization',
          description: 'You can save 15% more by optimizing your gift spending',
          value: 150,
          currency: 'USD',
          change: 15,
          changeType: 'increase',
          confidence: 85,
          actionable: true,
          action: 'Review gift categories',
          category: 'spending',
          priority: 'high'
        },
        {
          id: '2',
          type: 'trend',
          title: 'Spending Trend',
          description: 'Your gift spending has increased by 8% this month',
          value: 320,
          currency: 'USD',
          change: 8,
          changeType: 'increase',
          confidence: 92,
          actionable: true,
          action: 'Set spending limits',
          category: 'budget',
          priority: 'medium'
        }
      ];
      
      res.json(insights);
    } catch (error) {
      console.error('Get financial insights error:', error);
      res.status(500).json({ message: 'Failed to get financial insights' });
    }
  });

  // Gift Preferences routes
  app.get('/api/preferences/:personId', authenticateToken, async (req, res) => {
    try {
      const { personId } = req.params;
      const preferences = await runQuerySingle(
        'SELECT * FROM gift_preferences WHERE person_id = ? AND user_id = ?',
        [personId, req.user.userId]
      );
      res.json(preferences || {});
    } catch (error) {
      console.error('Get gift preferences error:', error);
      res.status(500).json({ message: 'Failed to get gift preferences' });
    }
  });

  app.post('/api/preferences', authenticateToken, async (req, res) => {
    try {
      const { personId, interests, hobbies, favoriteCategories, priceRange, preferredStores, allergies, dislikes, notes } = req.body;
      const preferencesId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO gift_preferences (id, user_id, person_id, interests, hobbies, favorite_categories, price_range, preferred_stores, allergies, dislikes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [preferencesId, req.user.userId, personId, JSON.stringify(interests || []), JSON.stringify(hobbies || []), JSON.stringify(favoriteCategories || []), JSON.stringify(priceRange || {}), JSON.stringify(preferredStores || []), JSON.stringify(allergies || []), JSON.stringify(dislikes || []), notes]
      );

      const newPreferences = await runQuerySingle(
        'SELECT * FROM gift_preferences WHERE id = ?',
        [preferencesId]
      );

      res.status(201).json(newPreferences);
    } catch (error) {
      console.error('Create gift preferences error:', error);
      res.status(500).json({ message: 'Failed to create gift preferences' });
    }
  });

  app.put('/api/preferences/:personId', authenticateToken, async (req, res) => {
    try {
      const { personId } = req.params;
      const { interests, hobbies, favoriteCategories, priceRange, preferredStores, allergies, dislikes, notes } = req.body;
      
      await runQueryInsert(
        'UPDATE gift_preferences SET interests = ?, hobbies = ?, favorite_categories = ?, price_range = ?, preferred_stores = ?, allergies = ?, dislikes = ?, notes = ? WHERE person_id = ? AND user_id = ?',
        [JSON.stringify(interests || []), JSON.stringify(hobbies || []), JSON.stringify(favoriteCategories || []), JSON.stringify(priceRange || {}), JSON.stringify(preferredStores || []), JSON.stringify(allergies || []), JSON.stringify(dislikes || []), notes, personId, req.user.userId]
      );

      const updatedPreferences = await runQuerySingle(
        'SELECT * FROM gift_preferences WHERE person_id = ? AND user_id = ?',
        [personId, req.user.userId]
      );

      res.json(updatedPreferences);
    } catch (error) {
      console.error('Update gift preferences error:', error);
      res.status(500).json({ message: 'Failed to update gift preferences' });
    }
  });

  // Profile and User Preferences routes
  app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
      const userData = await getUserData(req.user.userId);
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(userData);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Failed to get profile' });
    }
  });

  app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
      const { name, email } = req.body;
      
      await runQueryInsert(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, req.user.userId]
      );

      const updatedUser = await getUserData(req.user.userId);
      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  app.put('/api/user/preferences', authenticateToken, async (req, res) => {
    try {
      const preferences = req.body;
      
      await runQueryInsert(
        'UPDATE users SET preferences = ? WHERE id = ?',
        [JSON.stringify(preferences), req.user.userId]
      );

      res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Update user preferences error:', error);
      res.status(500).json({ message: 'Failed to update preferences' });
    }
  });

  // Reports routes
  app.post('/api/reports', authenticateToken, async (req, res) => {
    try {
      const { name, type, filters, frequency } = req.body;
      const reportId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO reports (id, user_id, name, type, filters, frequency) VALUES (?, ?, ?, ?, ?, ?)',
        [reportId, req.user.userId, name, type, JSON.stringify(filters || {}), frequency]
      );

      const newReport = await runQuerySingle(
        'SELECT * FROM reports WHERE id = ?',
        [reportId]
      );

      res.status(201).json(newReport);
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ message: 'Failed to create report' });
    }
  });

  // Reminders routes
  app.post('/api/reminders', authenticateToken, async (req, res) => {
    try {
      const { title, description, date, type, personId, occasionId } = req.body;
      const reminderId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO reminders (id, user_id, title, description, date, type, person_id, occasion_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [reminderId, req.user.userId, title, description, date, type, personId, occasionId]
      );

      const newReminder = await runQuerySingle(
        'SELECT * FROM reminders WHERE id = ?',
        [reminderId]
      );

      res.status(201).json(newReminder);
    } catch (error) {
      console.error('Create reminder error:', error);
      res.status(500).json({ message: 'Failed to create reminder' });
    }
  });

  // Gift Ideas routes
  app.post('/api/gift-ideas', authenticateToken, async (req, res) => {
    try {
      const { title, description, category, priceRange, tags, source, url } = req.body;
      const ideaId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO gift_ideas (id, user_id, title, description, category, price_range, tags, source, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [ideaId, req.user.userId, title, description, category, JSON.stringify(priceRange || {}), JSON.stringify(tags || []), source, url]
      );

      const newIdea = await runQuerySingle(
        'SELECT * FROM gift_ideas WHERE id = ?',
        [ideaId]
      );

      res.status(201).json(newIdea);
    } catch (error) {
      console.error('Create gift idea error:', error);
      res.status(500).json({ message: 'Failed to create gift idea' });
    }
  });

  // Wishlists routes
  app.post('/api/wishlists', authenticateToken, async (req, res) => {
    try {
      const { name, description, personId, occasion, privacy } = req.body;
      const wishlistId = uuidv4();
      
      await runQueryInsert(
        'INSERT INTO wishlists (id, user_id, name, description, person_id, occasion, privacy) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [wishlistId, req.user.userId, name, description, personId, occasion, privacy]
      );

      const newWishlist = await runQuerySingle(
        'SELECT * FROM wishlists WHERE id = ?',
        [wishlistId]
      );

      res.status(201).json(newWishlist);
    } catch (error) {
      console.error('Create wishlist error:', error);
      res.status(500).json({ message: 'Failed to create wishlist' });
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