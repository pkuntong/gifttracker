require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Supabase Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

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
    const result = await pool.query(
      'SELECT id, email, name, created_at, preferences FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      preferences: user.preferences || {
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
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const result = await pool.query(
      'INSERT INTO users (id, email, name, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [userId, email, name, hashedPassword]
    );

    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });

    const userData = await getUserData(userId);
    res.status(201).json({
      user: userData,
      token
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
    const result = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    const userData = await getUserData(user.id);
    res.json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userData = await getUserData(req.user.userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// People routes
app.get('/api/people', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM people WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get people error:', error);
    res.status(500).json({ message: 'Failed to get people' });
  }
});

app.post('/api/people', authenticateToken, async (req, res) => {
  try {
    const { name, email, relationship, birthday, notes } = req.body;
    
    const result = await pool.query(
      'INSERT INTO people (id, user_id, name, email, relationship, birthday, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
      [uuidv4(), req.user.userId, name, email, relationship, birthday, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create person error:', error);
    res.status(500).json({ message: 'Failed to create person' });
  }
});

app.put('/api/people/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const personIndex = people.findIndex(p => p.id === id && p.userId === req.user.userId);
    if (personIndex === -1) {
      return res.status(404).json({ message: 'Person not found' });
    }

    people[personIndex] = {
      ...people[personIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(people[personIndex]);
  } catch (error) {
    console.error('Update person error:', error);
    res.status(500).json({ message: 'Failed to update person' });
  }
});

app.delete('/api/people/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const personIndex = people.findIndex(p => p.id === id && p.userId === req.user.userId);
    if (personIndex === -1) {
      return res.status(404).json({ message: 'Person not found' });
    }

    people.splice(personIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete person error:', error);
    res.status(500).json({ message: 'Failed to delete person' });
  }
});

// Gifts routes
app.get('/api/gifts', authenticateToken, (req, res) => {
  try {
    const userGifts = gifts.filter(g => g.userId === req.user.userId);
    res.json(userGifts);
  } catch (error) {
    console.error('Get gifts error:', error);
    res.status(500).json({ message: 'Failed to get gifts' });
  }
});

app.post('/api/gifts', authenticateToken, (req, res) => {
  try {
    const { name, description, price, currency, status, recipientId, occasionId, notes } = req.body;
    
    const gift = {
      id: uuidv4(),
      userId: req.user.userId,
      name,
      description,
      price: parseFloat(price),
      currency,
      status,
      recipientId,
      occasionId,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    gifts.push(gift);
    res.status(201).json(gift);
  } catch (error) {
    console.error('Create gift error:', error);
    res.status(500).json({ message: 'Failed to create gift' });
  }
});

app.put('/api/gifts/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const giftIndex = gifts.findIndex(g => g.id === id && g.userId === req.user.userId);
    if (giftIndex === -1) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    gifts[giftIndex] = {
      ...gifts[giftIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(gifts[giftIndex]);
  } catch (error) {
    console.error('Update gift error:', error);
    res.status(500).json({ message: 'Failed to update gift' });
  }
});

app.delete('/api/gifts/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const giftIndex = gifts.findIndex(g => g.id === id && g.userId === req.user.userId);
    if (giftIndex === -1) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    gifts.splice(giftIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete gift error:', error);
    res.status(500).json({ message: 'Failed to delete gift' });
  }
});

// Occasions routes
app.get('/api/occasions', authenticateToken, (req, res) => {
  try {
    const userOccasions = occasions.filter(o => o.userId === req.user.userId);
    res.json(userOccasions);
  } catch (error) {
    console.error('Get occasions error:', error);
    res.status(500).json({ message: 'Failed to get occasions' });
  }
});

app.post('/api/occasions', authenticateToken, (req, res) => {
  try {
    const { name, date, type, personId, description, budget } = req.body;
    
    const occasion = {
      id: uuidv4(),
      userId: req.user.userId,
      name,
      date,
      type,
      personId,
      description,
      budget: budget ? parseFloat(budget) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    occasions.push(occasion);
    res.status(201).json(occasion);
  } catch (error) {
    console.error('Create occasion error:', error);
    res.status(500).json({ message: 'Failed to create occasion' });
  }
});

app.put('/api/occasions/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const occasionIndex = occasions.findIndex(o => o.id === id && o.userId === req.user.userId);
    if (occasionIndex === -1) {
      return res.status(404).json({ message: 'Occasion not found' });
    }

    occasions[occasionIndex] = {
      ...occasions[occasionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(occasions[occasionIndex]);
  } catch (error) {
    console.error('Update occasion error:', error);
    res.status(500).json({ message: 'Failed to update occasion' });
  }
});

app.delete('/api/occasions/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const occasionIndex = occasions.findIndex(o => o.id === id && o.userId === req.user.userId);
    if (occasionIndex === -1) {
      return res.status(404).json({ message: 'Occasion not found' });
    }

    occasions.splice(occasionIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete occasion error:', error);
    res.status(500).json({ message: 'Failed to delete occasion' });
  }
});

// Families routes
app.get('/api/families', authenticateToken, (req, res) => {
  try {
    const userFamilies = families.filter(f => 
      f.members.some(m => m.userId === req.user.userId)
    );
    res.json(userFamilies);
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({ message: 'Failed to get families' });
  }
});

app.post('/api/families', authenticateToken, (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const family = {
      id: uuidv4(),
      name,
      description,
      members: [
        {
          id: uuidv4(),
          userId: req.user.userId,
          familyId: uuidv4(),
          role: 'owner',
          joinedAt: new Date().toISOString()
        },
        ...(members || [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    families.push(family);
    res.status(201).json(family);
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({ message: 'Failed to create family' });
  }
});

app.put('/api/families/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const familyIndex = families.findIndex(f => f.id === id && f.members.some(m => m.userId === req.user.userId));
    if (familyIndex === -1) {
      return res.status(404).json({ message: 'Family not found' });
    }

    families[familyIndex] = {
      ...families[familyIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(families[familyIndex]);
  } catch (error) {
    console.error('Update family error:', error);
    res.status(500).json({ message: 'Failed to update family' });
  }
});

app.delete('/api/families/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const familyIndex = families.findIndex(f => f.id === id && f.members.some(m => m.userId === req.user.userId && m.role === 'owner'));
    if (familyIndex === -1) {
      return res.status(404).json({ message: 'Family not found or insufficient permissions' });
    }

    families.splice(familyIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({ message: 'Failed to delete family' });
  }
});

app.post('/api/families/:id/invite', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    const family = families.find(f => f.id === id && f.members.some(m => m.userId === req.user.userId));
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // In a real app, you'd send an email invitation here
    // For now, we'll just return success
    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite family member error:', error);
    res.status(500).json({ message: 'Failed to send invitation' });
  }
});

app.delete('/api/families/:id/members/:memberId', authenticateToken, (req, res) => {
  try {
    const { id, memberId } = req.params;
    
    const family = families.find(f => f.id === id && f.members.some(m => m.userId === req.user.userId));
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    const memberIndex = family.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    family.members.splice(memberIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Remove family member error:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
});

// Budgets routes
app.get('/api/budgets', authenticateToken, (req, res) => {
  try {
    const userBudgets = budgets.filter(b => b.userId === req.user.userId);
    res.json(userBudgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Failed to get budgets' });
  }
});

app.post('/api/budgets', authenticateToken, (req, res) => {
  try {
    const { name, amount, currency, period, type, personId, occasionId, description, startDate, endDate, spent } = req.body;
    
    const budget = {
      id: uuidv4(),
      userId: req.user.userId,
      name,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      period: period || 'custom',
      type,
      personId,
      occasionId,
      description,
      startDate,
      endDate,
      spent: spent || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    budgets.push(budget);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Failed to create budget' });
  }
});

app.put('/api/budgets/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const budgetIndex = budgets.findIndex(b => b.id === id && b.userId === req.user.userId);
    if (budgetIndex === -1) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budgets[budgetIndex] = {
      ...budgets[budgetIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(budgets[budgetIndex]);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Failed to update budget' });
  }
});

app.delete('/api/budgets/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const budgetIndex = budgets.findIndex(b => b.id === id && b.userId === req.user.userId);
    if (budgetIndex === -1) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budgets.splice(budgetIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Failed to delete budget' });
  }
});

// Notifications routes
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === req.user.userId);
    res.json(userNotifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

app.put('/api/notifications/preferences', authenticateToken, (req, res) => {
  try {
    // In a real app, you'd save these to the user's preferences
    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id && n.userId === req.user.userId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.updatedAt = new Date().toISOString();
    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = notifications.findIndex(n => n.id === id && n.userId === req.user.userId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notifications.splice(notificationIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

app.post('/api/notifications/test', authenticateToken, (req, res) => {
  try {
    const { type, channel } = req.body;
    
    const testNotification = {
      id: uuidv4(),
      userId: req.user.userId,
      type,
      title: `Test ${type.replace('_', ' ')} notification`,
      message: `This is a test notification for ${type} via ${channel}`,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notifications.push(testNotification);
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ message: 'Failed to send test notification' });
  }
});

// Profile routes
app.put('/api/profile', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = req.body;
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email
    };

    res.json(getUserData(req.user.userId));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

app.put('/api/profile/preferences', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { preferences } = req.body;
    users[userIndex] = {
      ...users[userIndex],
      preferences: {
        ...users[userIndex].preferences,
        ...preferences
      }
    };

    res.json(getUserData(req.user.userId));
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// Analytics routes
app.get('/api/analytics', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate, people, occasions, categories } = req.query;
    
    const userGifts = gifts.filter(g => g.userId === req.user.userId);
    const userPeople = people.filter(p => p.userId === req.user.userId);
    const userOccasions = occasions.filter(o => o.userId === req.user.userId);
    const userBudgets = budgets.filter(b => b.userId === req.user.userId);
    const userFamilies = families.filter(f => 
      f.members.some(m => m.userId === req.user.userId)
    );

    const totalSpent = userGifts.reduce((sum, gift) => sum + (gift.price || 0), 0);
    const completedGifts = userGifts.filter(g => g.status === 'purchased').length;
    const averageGiftPrice = userGifts.length > 0 ? totalSpent / userGifts.length : 0;

    // Category breakdown
    const categoryBreakdown = userGifts.reduce((acc, gift) => {
      const category = gift.category || 'Other';
      if (!acc[category]) {
        acc[category] = { count: 0, totalSpent: 0 };
      }
      acc[category].count++;
      acc[category].totalSpent += gift.price || 0;
      return acc;
    }, {});

    // Spending by person
    const spendingByPerson = userPeople.map(person => {
      const personGifts = userGifts.filter(g => g.personId === person.id);
      const totalSpent = personGifts.reduce((sum, gift) => sum + (gift.price || 0), 0);
      return {
        personName: person.name,
        totalSpent,
        giftCount: personGifts.length,
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      const monthGifts = userGifts.filter(g => {
        const giftDate = new Date(g.createdAt);
        return giftDate.getMonth() === date.getMonth() && giftDate.getFullYear() === date.getFullYear();
      });
      
      monthlyTrends.push({
        month,
        giftsPurchased: monthGifts.filter(g => g.status === 'purchased').length,
        amountSpent: monthGifts.reduce((sum, g) => sum + (g.price || 0), 0),
        occasions: userOccasions.filter(o => {
          const occasionDate = new Date(o.date);
          return occasionDate.getMonth() === date.getMonth() && occasionDate.getFullYear() === date.getFullYear();
        }).length,
      });
    }

    const analytics = {
      giftStats: {
        totalGifts: userGifts.length,
        completedGifts,
        pendingGifts: userGifts.length - completedGifts,
        averageGiftPrice,
        totalSpent,
        budgetUtilization: userBudgets.length > 0 ? (totalSpent / userBudgets.reduce((sum, b) => sum + b.amount, 0)) * 100 : 0,
      },
      occasionStats: {
        totalOccasions: userOccasions.length,
        upcomingOccasions: userOccasions.filter(o => new Date(o.date) > new Date()).length,
        averageGiftsPerOccasion: userOccasions.length > 0 ? userGifts.length / userOccasions.length : 0,
        mostPopularOccasionType: userOccasions.length > 0 ? 
          Object.entries(userOccasions.reduce((acc, o) => {
            acc[o.type] = (acc[o.type] || 0) + 1;
            return acc;
          }, {})).sort((a, b) => b[1] - a[1])[0][0] : 'Birthday',
      },
      peopleStats: {
        totalPeople: userPeople.length,
        averageGiftsPerPerson: userPeople.length > 0 ? userGifts.length / userPeople.length : 0,
        mostGiftedPerson: spendingByPerson.length > 0 ? spendingByPerson[0].personName : 'None',
      },
      budgetStats: {
        totalBudgets: userBudgets.length,
        totalBudgetAmount: userBudgets.reduce((sum, b) => sum + b.amount, 0),
        totalSpent,
        averageBudgetUtilization: userBudgets.length > 0 ? 
          userBudgets.reduce((sum, b) => sum + (b.spent / b.amount * 100), 0) / userBudgets.length : 0,
      },
      familyStats: {
        totalFamilies: userFamilies.length,
        totalFamilyMembers: userFamilies.reduce((sum, f) => sum + f.members.length, 0),
        averageFamilySize: userFamilies.length > 0 ? 
          userFamilies.reduce((sum, f) => sum + f.members.length, 0) / userFamilies.length : 0,
      },
      monthlyTrends,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        count: data.count,
        totalSpent: data.totalSpent,
      })),
      spendingByPerson,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
});

// Reports routes
app.get('/api/reports', authenticateToken, (req, res) => {
  try {
    const userReports = reports.filter(r => r.userId === req.user.userId);
    res.json(userReports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Failed to get reports' });
  }
});

app.post('/api/reports', authenticateToken, (req, res) => {
  try {
    const { type, title, description, isScheduled, scheduleFrequency, filters, data } = req.body;
    
    const report = {
      id: uuidv4(),
      userId: req.user.userId,
      type,
      title,
      description,
      data: data || {},
      filters: filters || {},
      createdAt: new Date().toISOString(),
      isScheduled: isScheduled || false,
      scheduleFrequency: scheduleFrequency || 'monthly',
      lastGenerated: new Date().toISOString(),
      nextScheduled: isScheduled ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };

    reports.push(report);
    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Failed to create report' });
  }
});

app.put('/api/reports/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const reportIndex = reports.findIndex(r => r.id === id && r.userId === req.user.userId);
    if (reportIndex === -1) {
      return res.status(404).json({ message: 'Report not found' });
    }

    reports[reportIndex] = {
      ...reports[reportIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(reports[reportIndex]);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
});

app.delete('/api/reports/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const reportIndex = reports.findIndex(r => r.id === id && r.userId === req.user.userId);
    if (reportIndex === -1) {
      return res.status(404).json({ message: 'Report not found' });
    }

    reports.splice(reportIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

app.post('/api/reports/generate', authenticateToken, (req, res) => {
  try {
    const { type, filters } = req.body;
    
    // Generate report data based on type
    let reportData = {};
    const userGifts = gifts.filter(g => g.userId === req.user.userId);
    const userPeople = people.filter(p => p.userId === req.user.userId);
    const userOccasions = occasions.filter(o => o.userId === req.user.userId);
    const userBudgets = budgets.filter(b => b.userId === req.user.userId);

    switch (type) {
      case 'gift_summary':
        reportData = {
          totalGifts: userGifts.length,
          purchasedGifts: userGifts.filter(g => g.status === 'purchased').length,
          pendingGifts: userGifts.filter(g => g.status === 'pending').length,
          totalSpent: userGifts.reduce((sum, g) => sum + (g.price || 0), 0),
        };
        break;
      case 'budget_report':
        reportData = {
          totalBudgets: userBudgets.length,
          totalBudgetAmount: userBudgets.reduce((sum, b) => sum + b.amount, 0),
          totalSpent: userBudgets.reduce((sum, b) => sum + b.spent, 0),
          averageUtilization: userBudgets.length > 0 ? 
            userBudgets.reduce((sum, b) => sum + (b.spent / b.amount * 100), 0) / userBudgets.length : 0,
        };
        break;
      case 'occasion_report':
        reportData = {
          totalOccasions: userOccasions.length,
          upcomingOccasions: userOccasions.filter(o => new Date(o.date) > new Date()).length,
          occasionTypes: userOccasions.reduce((acc, o) => {
            acc[o.type] = (acc[o.type] || 0) + 1;
            return acc;
          }, {}),
        };
        break;
      case 'spending_analysis':
        reportData = {
          totalSpent: userGifts.reduce((sum, g) => sum + (g.price || 0), 0),
          averageGiftPrice: userGifts.length > 0 ? 
            userGifts.reduce((sum, g) => sum + (g.price || 0), 0) / userGifts.length : 0,
          spendingByPerson: userPeople.map(person => {
            const personGifts = userGifts.filter(g => g.personId === person.id);
            return {
              personName: person.name,
              totalSpent: personGifts.reduce((sum, g) => sum + (g.price || 0), 0),
              giftCount: personGifts.length,
            };
          }),
        };
        break;
      case 'family_report':
        const userFamilies = families.filter(f => 
          f.members.some(m => m.userId === req.user.userId)
        );
        reportData = {
          totalFamilies: userFamilies.length,
          totalMembers: userFamilies.reduce((sum, f) => sum + f.members.length, 0),
          averageFamilySize: userFamilies.length > 0 ? 
            userFamilies.reduce((sum, f) => sum + f.members.length, 0) / userFamilies.length : 0,
        };
        break;
    }

    const report = {
      id: uuidv4(),
      userId: req.user.userId,
      type,
      title: `${type.replace('_', ' ')} Report`,
      description: `Generated ${type.replace('_', ' ')} report`,
      data: reportData,
      filters: filters || {},
      createdAt: new Date().toISOString(),
      isScheduled: false,
      lastGenerated: new Date().toISOString(),
    };

    reports.push(report);
    res.status(201).json(report);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

app.get('/api/reports/:id/export', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;
    
    const report = reports.find(r => r.id === id && r.userId === req.user.userId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    let exportData;
    let contentType;
    let filename;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(report, null, 2);
        contentType = 'application/json';
        filename = `report-${id}.json`;
        break;
      case 'csv':
        // Simple CSV export
        const csvData = Object.entries(report.data).map(([key, value]) => 
          `${key},${typeof value === 'object' ? JSON.stringify(value) : value}`
        ).join('\n');
        exportData = `Key,Value\n${csvData}`;
        contentType = 'text/csv';
        filename = `report-${id}.csv`;
        break;
      case 'pdf':
        // For PDF, we'll return a simple text representation
        exportData = `Report: ${report.title}\n\n${JSON.stringify(report.data, null, 2)}`;
        contentType = 'application/pdf';
        filename = `report-${id}.pdf`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid export format' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Failed to export report' });
  }
});

// Gift Ideas routes
app.get('/api/gift-ideas', authenticateToken, (req, res) => {
  try {
    const userGiftIdeas = giftIdeas.filter(gi => gi.userId === req.user.userId);
    res.json(userGiftIdeas);
  } catch (error) {
    console.error('Get gift ideas error:', error);
    res.status(500).json({ message: 'Failed to get gift ideas' });
  }
});

app.post('/api/gift-ideas', authenticateToken, (req, res) => {
  try {
    const { title, description, category, price, currency, tags, imageUrl, purchaseUrl, recipientId, occasionId, notes, source, isFavorite, isPurchased } = req.body;
    
    const giftIdea = {
      id: uuidv4(),
      userId: req.user.userId,
      title,
      description,
      category,
      price: parseFloat(price),
      currency: currency || 'USD',
      tags: tags || [],
      imageUrl,
      purchaseUrl,
      recipientId,
      occasionId,
      notes,
      source: source || 'manual',
      isFavorite: isFavorite || false,
      isPurchased: isPurchased || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    giftIdeas.push(giftIdea);
    res.status(201).json(giftIdea);
  } catch (error) {
    console.error('Create gift idea error:', error);
    res.status(500).json({ message: 'Failed to create gift idea' });
  }
});

app.put('/api/gift-ideas/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const ideaIndex = giftIdeas.findIndex(gi => gi.id === id && gi.userId === req.user.userId);
    if (ideaIndex === -1) {
      return res.status(404).json({ message: 'Gift idea not found' });
    }

    giftIdeas[ideaIndex] = {
      ...giftIdeas[ideaIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(giftIdeas[ideaIndex]);
  } catch (error) {
    console.error('Update gift idea error:', error);
    res.status(500).json({ message: 'Failed to update gift idea' });
  }
});

app.delete('/api/gift-ideas/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const ideaIndex = giftIdeas.findIndex(gi => gi.id === id && gi.userId === req.user.userId);
    if (ideaIndex === -1) {
      return res.status(404).json({ message: 'Gift idea not found' });
    }

    giftIdeas.splice(ideaIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete gift idea error:', error);
    res.status(500).json({ message: 'Failed to delete gift idea' });
  }
});

app.put('/api/gift-ideas/:id/favorite', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const ideaIndex = giftIdeas.findIndex(gi => gi.id === id && gi.userId === req.user.userId);
    if (ideaIndex === -1) {
      return res.status(404).json({ message: 'Gift idea not found' });
    }

    giftIdeas[ideaIndex].isFavorite = !giftIdeas[ideaIndex].isFavorite;
    giftIdeas[ideaIndex].updatedAt = new Date().toISOString();

    res.json(giftIdeas[ideaIndex]);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
});

// Gift Recommendations routes
app.get('/api/gift-recommendations', authenticateToken, (req, res) => {
  try {
    const { personId, occasionId, category, minPrice, maxPrice, interests } = req.query;
    
    // Mock recommendations based on filters
    const mockRecommendations = [
      {
        id: uuidv4(),
        title: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category: 'electronics',
        price: 199.99,
        currency: 'USD',
        confidence: 85,
        reason: 'Based on tech interests and budget',
        tags: ['tech', 'audio', 'wireless'],
        imageUrl: 'https://example.com/headphones.jpg',
        purchaseUrl: 'https://example.com/purchase',
        source: 'ai'
      },
      {
        id: uuidv4(),
        title: 'Personalized Photo Book',
        description: 'Custom photo book with memories and stories',
        category: 'books',
        price: 49.99,
        currency: 'USD',
        confidence: 92,
        reason: 'Perfect for sentimental occasions',
        tags: ['personalized', 'memories', 'photo'],
        imageUrl: 'https://example.com/photobook.jpg',
        purchaseUrl: 'https://example.com/purchase',
        source: 'personalized'
      },
      {
        id: uuidv4(),
        title: 'Gourmet Coffee Gift Set',
        description: 'Premium coffee beans and accessories',
        category: 'food',
        price: 79.99,
        currency: 'USD',
        confidence: 78,
        reason: 'Based on food preferences',
        tags: ['coffee', 'gourmet', 'food'],
        imageUrl: 'https://example.com/coffee.jpg',
        purchaseUrl: 'https://example.com/purchase',
        source: 'trending'
      }
    ];

    // Filter recommendations based on query parameters
    let filteredRecommendations = mockRecommendations;
    
    if (category) {
      filteredRecommendations = filteredRecommendations.filter(r => r.category === category);
    }
    
    if (minPrice || maxPrice) {
      filteredRecommendations = filteredRecommendations.filter(r => {
        if (minPrice && r.price < parseFloat(minPrice)) return false;
        if (maxPrice && r.price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    res.json(filteredRecommendations);
  } catch (error) {
    console.error('Get gift recommendations error:', error);
    res.status(500).json({ message: 'Failed to get gift recommendations' });
  }
});

app.post('/api/gift-recommendations/personalized', authenticateToken, (req, res) => {
  try {
    const { personId, occasionId } = req.query;
    
    // Mock personalized recommendations
    const personalizedRecommendations = [
      {
        id: uuidv4(),
        title: 'Custom Engraved Watch',
        description: 'Personalized watch with custom engraving',
        category: 'jewelry',
        price: 299.99,
        currency: 'USD',
        confidence: 95,
        reason: 'Based on personal style and occasion',
        tags: ['personalized', 'luxury', 'engraved'],
        imageUrl: 'https://example.com/watch.jpg',
        purchaseUrl: 'https://example.com/purchase',
        source: 'personalized'
      },
      {
        id: uuidv4(),
        title: 'Adventure Travel Package',
        description: 'Weekend getaway to favorite destination',
        category: 'experiences',
        price: 599.99,
        currency: 'USD',
        confidence: 88,
        reason: 'Based on travel interests and budget',
        tags: ['travel', 'adventure', 'experience'],
        imageUrl: 'https://example.com/travel.jpg',
        purchaseUrl: 'https://example.com/purchase',
        source: 'smart'
      }
    ];

    res.json(personalizedRecommendations);
  } catch (error) {
    console.error('Generate personalized recommendations error:', error);
    res.status(500).json({ message: 'Failed to generate personalized recommendations' });
  }
});

// Gift Preferences routes
app.get('/api/gift-preferences/:personId', authenticateToken, (req, res) => {
  try {
    const { personId } = req.params;
    
    const preference = giftPreferences.find(gp => 
      gp.personId === personId && gp.userId === req.user.userId
    );
    
    res.json(preference || null);
  } catch (error) {
    console.error('Get gift preferences error:', error);
    res.status(500).json({ message: 'Failed to get gift preferences' });
  }
});

app.post('/api/gift-preferences', authenticateToken, (req, res) => {
  try {
    const { personId, interests, hobbies, favoriteCategories, priceRange, preferredStores, allergies, dislikes, notes } = req.body;
    
    const preference = {
      id: uuidv4(),
      userId: req.user.userId,
      personId,
      interests: interests || [],
      hobbies: hobbies || [],
      favoriteCategories: favoriteCategories || [],
      priceRange: priceRange || { min: 0, max: 1000 },
      preferredStores: preferredStores || [],
      allergies: allergies || [],
      dislikes: dislikes || [],
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    giftPreferences.push(preference);
    res.status(201).json(preference);
  } catch (error) {
    console.error('Create gift preferences error:', error);
    res.status(500).json({ message: 'Failed to create gift preferences' });
  }
});

app.put('/api/gift-preferences/:personId', authenticateToken, (req, res) => {
  try {
    const { personId } = req.params;
    const updates = req.body;
    
    const preferenceIndex = giftPreferences.findIndex(gp => 
      gp.personId === personId && gp.userId === req.user.userId
    );
    
    if (preferenceIndex === -1) {
      return res.status(404).json({ message: 'Gift preferences not found' });
    }

    giftPreferences[preferenceIndex] = {
      ...giftPreferences[preferenceIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(giftPreferences[preferenceIndex]);
  } catch (error) {
    console.error('Update gift preferences error:', error);
    res.status(500).json({ message: 'Failed to update gift preferences' });
  }
});

app.delete('/api/gift-preferences/:personId', authenticateToken, (req, res) => {
  try {
    const { personId } = req.params;
    
    const preferenceIndex = giftPreferences.findIndex(gp => 
      gp.personId === personId && gp.userId === req.user.userId
    );
    
    if (preferenceIndex === -1) {
      return res.status(404).json({ message: 'Gift preferences not found' });
    }

    giftPreferences.splice(preferenceIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete gift preferences error:', error);
    res.status(500).json({ message: 'Failed to delete gift preferences' });
  }
});

// Wishlist data storage
let wishlists = [];
let wishlistItems = [];
let wishlistComments = [];
let wishlistCollaborators = [];
let wishlistInvitations = [];
let wishlistShares = [];
let wishlistActivity = [];

// Wishlist routes
app.get('/api/wishlists', authenticateToken, (req, res) => {
  try {
    const userWishlists = wishlists.filter(w => w.userId === req.user.userId);
    res.json(userWishlists);
  } catch (error) {
    console.error('Get wishlists error:', error);
    res.status(500).json({ message: 'Failed to get wishlists' });
  }
});

app.post('/api/wishlists', authenticateToken, (req, res) => {
  try {
    const { name, description, isPublic, isCollaborative, settings } = req.body;
    
    const wishlist = {
      id: uuidv4(),
      userId: req.user.userId,
      name,
      description,
      isPublic: isPublic || false,
      isCollaborative: isCollaborative || false,
      shareUrl: null,
      shareCode: null,
      items: [],
      collaborators: [],
      settings: settings || {
        allowComments: true,
        allowPurchases: true,
        showPrices: true,
        allowDuplicates: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    wishlists.push(wishlist);
    res.status(201).json(wishlist);
  } catch (error) {
    console.error('Create wishlist error:', error);
    res.status(500).json({ message: 'Failed to create wishlist' });
  }
});

app.get('/api/wishlists/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const wishlist = wishlists.find(w => w.id === id);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Add items and collaborators to the response
    const items = wishlistItems.filter(item => item.wishlistId === id);
    const collaborators = wishlistCollaborators.filter(c => c.wishlistId === id);
    
    const fullWishlist = {
      ...wishlist,
      items,
      collaborators
    };

    res.json(fullWishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to get wishlist' });
  }
});

app.put('/api/wishlists/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const wishlistIndex = wishlists.findIndex(w => w.id === id && w.userId === req.user.userId);
    
    if (wishlistIndex === -1) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlists[wishlistIndex] = {
      ...wishlists[wishlistIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(wishlists[wishlistIndex]);
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
});

app.delete('/api/wishlists/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const wishlistIndex = wishlists.findIndex(w => w.id === id && w.userId === req.user.userId);
    
    if (wishlistIndex === -1) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove related data
    wishlistItems = wishlistItems.filter(item => item.wishlistId !== id);
    wishlistComments = wishlistComments.filter(comment => 
      wishlistItems.some(item => item.id === comment.itemId)
    );
    wishlistCollaborators = wishlistCollaborators.filter(c => c.wishlistId !== id);
    wishlistShares = wishlistShares.filter(s => s.wishlistId !== id);
    wishlistActivity = wishlistActivity.filter(a => a.wishlistId !== id);

    wishlists.splice(wishlistIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ message: 'Failed to delete wishlist' });
  }
});

// Wishlist Items routes
app.post('/api/wishlists/:wishlistId/items', authenticateToken, (req, res) => {
  try {
    const { wishlistId } = req.params;
    const { title, description, price, currency, category, priority, imageUrl, purchaseUrl, store, tags, notes } = req.body;
    
    const item = {
      id: uuidv4(),
      wishlistId,
      title,
      description,
      price: parseFloat(price) || 0,
      currency: currency || 'USD',
      category,
      priority: priority || 'medium',
      status: 'available',
      imageUrl,
      purchaseUrl,
      store,
      tags: tags || [],
      notes,
      reservedBy: null,
      purchasedBy: null,
      purchasedAt: null,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    wishlistItems.push(item);
    res.status(201).json(item);
  } catch (error) {
    console.error('Add wishlist item error:', error);
    res.status(500).json({ message: 'Failed to add wishlist item' });
  }
});

app.put('/api/wishlists/:wishlistId/items/:itemId', authenticateToken, (req, res) => {
  try {
    const { wishlistId, itemId } = req.params;
    const updates = req.body;
    
    const itemIndex = wishlistItems.findIndex(item => item.id === itemId && item.wishlistId === wishlistId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    wishlistItems[itemIndex] = {
      ...wishlistItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(wishlistItems[itemIndex]);
  } catch (error) {
    console.error('Update wishlist item error:', error);
    res.status(500).json({ message: 'Failed to update wishlist item' });
  }
});

app.delete('/api/wishlists/:wishlistId/items/:itemId', authenticateToken, (req, res) => {
  try {
    const { wishlistId, itemId } = req.params;
    
    const itemIndex = wishlistItems.findIndex(item => item.id === itemId && item.wishlistId === wishlistId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    // Remove related comments
    wishlistComments = wishlistComments.filter(comment => comment.itemId !== itemId);

    wishlistItems.splice(itemIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    res.status(500).json({ message: 'Failed to delete wishlist item' });
  }
});

app.put('/api/wishlists/:wishlistId/items/:itemId/reserve', authenticateToken, (req, res) => {
  try {
    const { wishlistId, itemId } = req.params;
    
    const itemIndex = wishlistItems.findIndex(item => item.id === itemId && item.wishlistId === wishlistId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    wishlistItems[itemIndex].status = 'reserved';
    wishlistItems[itemIndex].reservedBy = req.user.userId;
    wishlistItems[itemIndex].updatedAt = new Date().toISOString();

    res.json(wishlistItems[itemIndex]);
  } catch (error) {
    console.error('Reserve wishlist item error:', error);
    res.status(500).json({ message: 'Failed to reserve wishlist item' });
  }
});

app.put('/api/wishlists/:wishlistId/items/:itemId/purchase', authenticateToken, (req, res) => {
  try {
    const { wishlistId, itemId } = req.params;
    
    const itemIndex = wishlistItems.findIndex(item => item.id === itemId && item.wishlistId === wishlistId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    wishlistItems[itemIndex].status = 'purchased';
    wishlistItems[itemIndex].purchasedBy = req.user.userId;
    wishlistItems[itemIndex].purchasedAt = new Date().toISOString();
    wishlistItems[itemIndex].updatedAt = new Date().toISOString();

    res.json(wishlistItems[itemIndex]);
  } catch (error) {
    console.error('Purchase wishlist item error:', error);
    res.status(500).json({ message: 'Failed to purchase wishlist item' });
  }
});

// Wishlist Comments routes
app.post('/api/wishlist-items/:itemId/comments', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const { message } = req.body;
    
    const comment = {
      id: uuidv4(),
      itemId,
      userId: req.user.userId,
      userName: req.user.name || 'Anonymous',
      message,
      createdAt: new Date().toISOString()
    };

    wishlistComments.push(comment);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Add wishlist comment error:', error);
    res.status(500).json({ message: 'Failed to add wishlist comment' });
  }
});

app.delete('/api/wishlist-items/:itemId/comments/:commentId', authenticateToken, (req, res) => {
  try {
    const { itemId, commentId } = req.params;
    
    const commentIndex = wishlistComments.findIndex(c => 
      c.id === commentId && c.itemId === itemId && c.userId === req.user.userId
    );
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    wishlistComments.splice(commentIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete wishlist comment error:', error);
    res.status(500).json({ message: 'Failed to delete wishlist comment' });
  }
});

// Wishlist Collaboration routes
app.post('/api/wishlists/:wishlistId/invite', authenticateToken, (req, res) => {
  try {
    const { wishlistId } = req.params;
    const { email, role } = req.body;
    
    const invitation = {
      id: uuidv4(),
      wishlistId,
      email,
      role: role || 'viewer',
      invitedBy: req.user.userId,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'pending'
    };

    wishlistInvitations.push(invitation);
    res.status(201).json(invitation);
  } catch (error) {
    console.error('Invite wishlist collaborator error:', error);
    res.status(500).json({ message: 'Failed to invite collaborator' });
  }
});

app.put('/api/wishlist-invitations/:invitationId/accept', authenticateToken, (req, res) => {
  try {
    const { invitationId } = req.params;
    
    const invitationIndex = wishlistInvitations.findIndex(inv => inv.id === invitationId);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const invitation = wishlistInvitations[invitationIndex];
    invitation.status = 'accepted';

    const collaborator = {
      id: uuidv4(),
      wishlistId: invitation.wishlistId,
      userId: req.user.userId,
      userName: req.user.name || 'Anonymous',
      userEmail: invitation.email,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.invitedAt,
      joinedAt: new Date().toISOString(),
      status: 'accepted'
    };

    wishlistCollaborators.push(collaborator);
    res.json(collaborator);
  } catch (error) {
    console.error('Accept wishlist invitation error:', error);
    res.status(500).json({ message: 'Failed to accept invitation' });
  }
});

app.put('/api/wishlist-invitations/:invitationId/decline', authenticateToken, (req, res) => {
  try {
    const { invitationId } = req.params;
    
    const invitationIndex = wishlistInvitations.findIndex(inv => inv.id === invitationId);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    wishlistInvitations[invitationIndex].status = 'declined';
    res.status(204).send();
  } catch (error) {
    console.error('Decline wishlist invitation error:', error);
    res.status(500).json({ message: 'Failed to decline invitation' });
  }
});

app.delete('/api/wishlists/:wishlistId/collaborators/:collaboratorId', authenticateToken, (req, res) => {
  try {
    const { wishlistId, collaboratorId } = req.params;
    
    const collaboratorIndex = wishlistCollaborators.findIndex(c => 
      c.id === collaboratorId && c.wishlistId === wishlistId
    );
    
    if (collaboratorIndex === -1) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }

    wishlistCollaborators.splice(collaboratorIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Remove wishlist collaborator error:', error);
    res.status(500).json({ message: 'Failed to remove collaborator' });
  }
});

app.put('/api/wishlists/:wishlistId/collaborators/:collaboratorId', authenticateToken, (req, res) => {
  try {
    const { wishlistId, collaboratorId } = req.params;
    const { role } = req.body;
    
    const collaboratorIndex = wishlistCollaborators.findIndex(c => 
      c.id === collaboratorId && c.wishlistId === wishlistId
    );
    
    if (collaboratorIndex === -1) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }

    wishlistCollaborators[collaboratorIndex].role = role;
    wishlistCollaborators[collaboratorIndex].updatedAt = new Date().toISOString();

    res.json(wishlistCollaborators[collaboratorIndex]);
  } catch (error) {
    console.error('Update wishlist collaborator role error:', error);
    res.status(500).json({ message: 'Failed to update collaborator role' });
  }
});

// Wishlist Sharing routes
app.post('/api/wishlists/:wishlistId/share', authenticateToken, (req, res) => {
  try {
    const { wishlistId } = req.params;
    const { shareType, password, expiresAt } = req.body;
    
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const share = {
      id: uuidv4(),
      wishlistId,
      shareType: shareType || 'public',
      shareUrl: `https://gifttracker.com/wishlist/${shareCode}`,
      shareCode,
      password: password || null,
      expiresAt: expiresAt || null,
      viewCount: 0,
      createdAt: new Date().toISOString()
    };

    wishlistShares.push(share);
    res.status(201).json(share);
  } catch (error) {
    console.error('Share wishlist error:', error);
    res.status(500).json({ message: 'Failed to share wishlist' });
  }
});

app.delete('/api/wishlists/:wishlistId/share', authenticateToken, (req, res) => {
  try {
    const { wishlistId } = req.params;
    
    const shareIndex = wishlistShares.findIndex(s => s.wishlistId === wishlistId);
    
    if (shareIndex !== -1) {
      wishlistShares.splice(shareIndex, 1);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Unshare wishlist error:', error);
    res.status(500).json({ message: 'Failed to unshare wishlist' });
  }
});

app.get('/api/wishlists/:wishlistId/shares', authenticateToken, (req, res) => {
  try {
    const { wishlistId } = req.params;
    
    const shares = wishlistShares.filter(s => s.wishlistId === wishlistId);
    res.json(shares);
  } catch (error) {
    console.error('Get wishlist shares error:', error);
    res.status(500).json({ message: 'Failed to get wishlist shares' });
  }
});

// Public wishlist access
app.get('/api/wishlists/public/:shareCode', (req, res) => {
  try {
    const { shareCode } = req.params;
    
    const share = wishlistShares.find(s => s.shareCode === shareCode);
    if (!share) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const wishlist = wishlists.find(w => w.id === share.wishlistId);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Increment view count
    share.viewCount++;

    const items = wishlistItems.filter(item => item.wishlistId === wishlist.id);
    const fullWishlist = {
      ...wishlist,
      items,
      collaborators: []
    };

    res.json(fullWishlist);
  } catch (error) {
    console.error('Get public wishlist error:', error);
    res.status(500).json({ message: 'Failed to get public wishlist' });
  }
});

// Wishlist Activity routes
app.get('/api/wishlists/:wishlistId/activity', authenticateToken, (req, res) => {
  try {
    const { wishlistId } = req.params;
    
    const activity = wishlistActivity.filter(a => a.wishlistId === wishlistId);
    res.json(activity);
  } catch (error) {
    console.error('Get wishlist activity error:', error);
    res.status(500).json({ message: 'Failed to get wishlist activity' });
  }
});

// Wishlist Statistics routes
app.get('/api/wishlists/:wishlistId/stats', authenticateToken, (req, res) => {
  try {
    const { wishlistId } = req.params;
    
    const items = wishlistItems.filter(item => item.wishlistId === wishlistId);
    const availableItems = items.filter(item => item.status === 'available');
    const reservedItems = items.filter(item => item.status === 'reserved');
    const purchasedItems = items.filter(item => item.status === 'purchased');
    
    const totalValue = items.reduce((sum, item) => sum + item.price, 0);
    const averagePrice = items.length > 0 ? totalValue / items.length : 0;
    
    // Get most popular category
    const categoryCounts = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    const mostPopularCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, 'other'
    );

    const recentActivity = wishlistActivity
      .filter(a => a.wishlistId === wishlistId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      totalItems: items.length,
      availableItems: availableItems.length,
      reservedItems: reservedItems.length,
      purchasedItems: purchasedItems.length,
      totalValue,
      averagePrice,
      mostPopularCategory,
      recentActivity
    });
  } catch (error) {
    console.error('Get wishlist stats error:', error);
    res.status(500).json({ message: 'Failed to get wishlist statistics' });
  }
});

// Wishlist Search routes
app.get('/api/wishlists/search', authenticateToken, (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const userWishlists = wishlists.filter(w => w.userId === req.user.userId);
    const filteredWishlists = userWishlists.filter(w => 
      w.name.toLowerCase().includes(q.toLowerCase()) ||
      w.description?.toLowerCase().includes(q.toLowerCase())
    );

    res.json(filteredWishlists);
  } catch (error) {
    console.error('Search wishlists error:', error);
    res.status(500).json({ message: 'Failed to search wishlists' });
  }
});

// Wishlist Templates routes
app.get('/api/wishlists/templates', authenticateToken, (req, res) => {
  try {
    const templates = [
      {
        id: 'birthday',
        name: 'Birthday Wishlist',
        description: 'Perfect gifts for birthday celebrations',
        category: 'birthday',
        items: [
          {
            title: 'Personalized Photo Frame',
            description: 'Custom photo frame with special memories',
            price: 29.99,
            currency: 'USD',
            category: 'home',
            priority: 'medium',
            tags: ['personalized', 'photo', 'memories']
          },
          {
            title: 'Gourmet Gift Basket',
            description: 'Premium food and beverage collection',
            price: 79.99,
            currency: 'USD',
            category: 'food',
            priority: 'high',
            tags: ['gourmet', 'food', 'premium']
          }
        ]
      },
      {
        id: 'wedding',
        name: 'Wedding Registry',
        description: 'Traditional wedding gift registry',
        category: 'wedding',
        items: [
          {
            title: 'Kitchen Mixer',
            description: 'Professional stand mixer for baking',
            price: 299.99,
            currency: 'USD',
            category: 'home',
            priority: 'high',
            tags: ['kitchen', 'baking', 'appliance']
          },
          {
            title: 'Bedding Set',
            description: 'Luxury cotton bedding collection',
            price: 149.99,
            currency: 'USD',
            category: 'home',
            priority: 'medium',
            tags: ['bedding', 'luxury', 'cotton']
          }
        ]
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Get wishlist templates error:', error);
    res.status(500).json({ message: 'Failed to get wishlist templates' });
  }
});

app.post('/api/wishlists/templates/:templateId', authenticateToken, (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, description } = req.body;
    
    // Get template
    const templates = [
      {
        id: 'birthday',
        name: 'Birthday Wishlist',
        description: 'Perfect gifts for birthday celebrations',
        category: 'birthday',
        items: [
          {
            title: 'Personalized Photo Frame',
            description: 'Custom photo frame with special memories',
            price: 29.99,
            currency: 'USD',
            category: 'home',
            priority: 'medium',
            tags: ['personalized', 'photo', 'memories']
          },
          {
            title: 'Gourmet Gift Basket',
            description: 'Premium food and beverage collection',
            price: 79.99,
            currency: 'USD',
            category: 'food',
            priority: 'high',
            tags: ['gourmet', 'food', 'premium']
          }
        ]
      },
      {
        id: 'wedding',
        name: 'Wedding Registry',
        description: 'Traditional wedding gift registry',
        category: 'wedding',
        items: [
          {
            title: 'Kitchen Mixer',
            description: 'Professional stand mixer for baking',
            price: 299.99,
            currency: 'USD',
            category: 'home',
            priority: 'high',
            tags: ['kitchen', 'baking', 'appliance']
          },
          {
            title: 'Bedding Set',
            description: 'Luxury cotton bedding collection',
            price: 149.99,
            currency: 'USD',
            category: 'home',
            priority: 'medium',
            tags: ['bedding', 'luxury', 'cotton']
          }
        ]
      }
    ];

    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const wishlist = {
      id: uuidv4(),
      userId: req.user.userId,
      name: name || template.name,
      description: description || template.description,
      isPublic: false,
      isCollaborative: false,
      shareUrl: null,
      shareCode: null,
      items: [],
      collaborators: [],
      settings: {
        allowComments: true,
        allowPurchases: true,
        showPrices: true,
        allowDuplicates: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    wishlists.push(wishlist);

    // Add template items
    template.items.forEach(templateItem => {
      const item = {
        id: uuidv4(),
        wishlistId: wishlist.id,
        title: templateItem.title,
        description: templateItem.description,
        price: templateItem.price,
        currency: templateItem.currency,
        category: templateItem.category,
        priority: templateItem.priority,
        status: 'available',
        tags: templateItem.tags,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      wishlistItems.push(item);
    });

    res.status(201).json(wishlist);
  } catch (error) {
    console.error('Create wishlist from template error:', error);
    res.status(500).json({ message: 'Failed to create wishlist from template' });
  }
});

// Reminder data storage
let reminders = [];
let reminderTemplates = [];
let reminderRules = [];
let notificationPreferences = [];
let notificationHistory = [];
let smartReminders = [];

// Reminder routes
app.get('/api/reminders', authenticateToken, (req, res) => {
  try {
    const userReminders = reminders.filter(r => r.userId === req.user.userId);
    res.json(userReminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Failed to get reminders' });
  }
});

app.post('/api/reminders', authenticateToken, (req, res) => {
  try {
    const { title, description, type, priority, scheduledFor, channels, relatedData, repeatSettings } = req.body;
    
    const reminder = {
      id: uuidv4(),
      userId: req.user.userId,
      title,
      description,
      type: type || 'custom',
      priority: priority || 'medium',
      status: 'pending',
      scheduledFor,
      sentAt: null,
      dismissedAt: null,
      completedAt: null,
      channels: channels || [],
      relatedData: relatedData || {},
      repeatSettings: repeatSettings || {
        frequency: 'once',
        interval: 1,
        endDate: null,
        maxOccurrences: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    reminders.push(reminder);
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Failed to create reminder' });
  }
});

app.put('/api/reminders/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const reminderIndex = reminders.findIndex(r => r.id === id && r.userId === req.user.userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminders[reminderIndex] = {
      ...reminders[reminderIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(reminders[reminderIndex]);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Failed to update reminder' });
  }
});

app.delete('/api/reminders/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const reminderIndex = reminders.findIndex(r => r.id === id && r.userId === req.user.userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminders.splice(reminderIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Failed to delete reminder' });
  }
});

app.put('/api/reminders/:id/dismiss', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const reminderIndex = reminders.findIndex(r => r.id === id && r.userId === req.user.userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminders[reminderIndex] = {
      ...reminders[reminderIndex],
      status: 'dismissed',
      dismissedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json(reminders[reminderIndex]);
  } catch (error) {
    console.error('Dismiss reminder error:', error);
    res.status(500).json({ message: 'Failed to dismiss reminder' });
  }
});

app.put('/api/reminders/:id/complete', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const reminderIndex = reminders.findIndex(r => r.id === id && r.userId === req.user.userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminders[reminderIndex] = {
      ...reminders[reminderIndex],
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json(reminders[reminderIndex]);
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ message: 'Failed to complete reminder' });
  }
});

// Reminder Templates routes
app.get('/api/reminders/templates', authenticateToken, (req, res) => {
  try {
    const userTemplates = reminderTemplates.filter(t => t.userId === req.user.userId);
    const systemTemplates = reminderTemplates.filter(t => t.isSystem);
    res.json([...userTemplates, ...systemTemplates]);
  } catch (error) {
    console.error('Get reminder templates error:', error);
    res.status(500).json({ message: 'Failed to get reminder templates' });
  }
});

app.post('/api/reminders/templates', authenticateToken, (req, res) => {
  try {
    const { name, description, type, title, message, defaultAdvanceNotice, defaultChannels } = req.body;
    
    const template = {
      id: uuidv4(),
      name,
      description,
      type,
      title,
      message,
      defaultAdvanceNotice: defaultAdvanceNotice || 60,
      defaultChannels: defaultChannels || ['email', 'in_app'],
      isSystem: false,
      createdAt: new Date().toISOString()
    };

    reminderTemplates.push(template);
    res.status(201).json(template);
  } catch (error) {
    console.error('Create reminder template error:', error);
    res.status(500).json({ message: 'Failed to create reminder template' });
  }
});

app.put('/api/reminders/templates/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const templateIndex = reminderTemplates.findIndex(t => t.id === id && t.userId === req.user.userId);
    
    if (templateIndex === -1) {
      return res.status(404).json({ message: 'Template not found' });
    }

    reminderTemplates[templateIndex] = {
      ...reminderTemplates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(reminderTemplates[templateIndex]);
  } catch (error) {
    console.error('Update reminder template error:', error);
    res.status(500).json({ message: 'Failed to update reminder template' });
  }
});

app.delete('/api/reminders/templates/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const templateIndex = reminderTemplates.findIndex(t => t.id === id && t.userId === req.user.userId);
    
    if (templateIndex === -1) {
      return res.status(404).json({ message: 'Template not found' });
    }

    reminderTemplates.splice(templateIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete reminder template error:', error);
    res.status(500).json({ message: 'Failed to delete reminder template' });
  }
});

// Reminder Rules routes
app.get('/api/reminders/rules', authenticateToken, (req, res) => {
  try {
    const userRules = reminderRules.filter(r => r.userId === req.user.userId);
    res.json(userRules);
  } catch (error) {
    console.error('Get reminder rules error:', error);
    res.status(500).json({ message: 'Failed to get reminder rules' });
  }
});

app.post('/api/reminders/rules', authenticateToken, (req, res) => {
  try {
    const { name, description, conditions, actions, isActive } = req.body;
    
    const rule = {
      id: uuidv4(),
      userId: req.user.userId,
      name,
      description,
      conditions: conditions || {},
      actions: actions || {},
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    reminderRules.push(rule);
    res.status(201).json(rule);
  } catch (error) {
    console.error('Create reminder rule error:', error);
    res.status(500).json({ message: 'Failed to create reminder rule' });
  }
});

app.put('/api/reminders/rules/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const ruleIndex = reminderRules.findIndex(r => r.id === id && r.userId === req.user.userId);
    
    if (ruleIndex === -1) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    reminderRules[ruleIndex] = {
      ...reminderRules[ruleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(reminderRules[ruleIndex]);
  } catch (error) {
    console.error('Update reminder rule error:', error);
    res.status(500).json({ message: 'Failed to update reminder rule' });
  }
});

app.delete('/api/reminders/rules/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const ruleIndex = reminderRules.findIndex(r => r.id === id && r.userId === req.user.userId);
    
    if (ruleIndex === -1) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    reminderRules.splice(ruleIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete reminder rule error:', error);
    res.status(500).json({ message: 'Failed to delete reminder rule' });
  }
});

// Notification Preferences routes
app.get('/api/notifications/preferences', authenticateToken, (req, res) => {
  try {
    let userPrefs = notificationPreferences.find(p => p.userId === req.user.userId);
    
    if (!userPrefs) {
      userPrefs = {
        userId: req.user.userId,
        email: {
          enabled: true,
          frequency: 'immediate',
          types: ['occasion_reminder', 'gift_status_update', 'budget_alert'],
          quietHours: null,
        },
        push: {
          enabled: true,
          types: ['occasion_reminder', 'gift_status_update'],
          sound: true,
          vibration: true,
        },
        sms: {
          enabled: false,
          phoneNumber: null,
          types: ['urgent_reminders'],
        },
        inApp: {
          enabled: true,
          types: ['all'],
          position: 'top-right',
          duration: 5,
        },
        calendar: {
          enabled: false,
          defaultCalendar: null,
          includeDetails: true,
        },
      };
      notificationPreferences.push(userPrefs);
    }

    res.json(userPrefs);
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ message: 'Failed to get notification preferences' });
  }
});

app.put('/api/notifications/preferences', authenticateToken, (req, res) => {
  try {
    const updates = req.body;
    
    let userPrefs = notificationPreferences.find(p => p.userId === req.user.userId);
    
    if (!userPrefs) {
      userPrefs = {
        userId: req.user.userId,
        email: { enabled: true, frequency: 'immediate', types: [] },
        push: { enabled: true, types: [], sound: true, vibration: true },
        sms: { enabled: false, phoneNumber: null, types: [] },
        inApp: { enabled: true, types: [], position: 'top-right', duration: 5 },
        calendar: { enabled: false, defaultCalendar: null, includeDetails: true },
      };
      notificationPreferences.push(userPrefs);
    }

    userPrefs = { ...userPrefs, ...updates };
    const index = notificationPreferences.findIndex(p => p.userId === req.user.userId);
    notificationPreferences[index] = userPrefs;

    res.json(userPrefs);
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
});

// Notification History routes
app.get('/api/notifications/history', authenticateToken, (req, res) => {
  try {
    const { type, channel, status, dateRange } = req.query;
    let userHistory = notificationHistory.filter(h => h.userId === req.user.userId);
    
    if (type) userHistory = userHistory.filter(h => h.type === type);
    if (channel) userHistory = userHistory.filter(h => h.channel === channel);
    if (status) userHistory = userHistory.filter(h => h.status === status);
    if (dateRange) {
      const { start, end } = JSON.parse(dateRange);
      userHistory = userHistory.filter(h => {
        const sentDate = new Date(h.sentAt);
        return sentDate >= new Date(start) && sentDate <= new Date(end);
      });
    }

    res.json(userHistory);
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({ message: 'Failed to get notification history' });
  }
});

app.put('/api/notifications/history/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const historyIndex = notificationHistory.findIndex(h => h.id === id && h.userId === req.user.userId);
    
    if (historyIndex === -1) {
      return res.status(404).json({ message: 'Notification history not found' });
    }

    notificationHistory[historyIndex] = {
      ...notificationHistory[historyIndex],
      status: 'read',
      readAt: new Date().toISOString()
    };

    res.json(notificationHistory[historyIndex]);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Smart Reminders routes
app.get('/api/reminders/smart', authenticateToken, (req, res) => {
  try {
    const userSmartReminders = smartReminders.filter(r => r.userId === req.user.userId && !r.isDismissed);
    res.json(userSmartReminders);
  } catch (error) {
    console.error('Get smart reminders error:', error);
    res.status(500).json({ message: 'Failed to get smart reminders' });
  }
});

app.put('/api/reminders/smart/:id/dismiss', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const reminderIndex = smartReminders.findIndex(r => r.id === id && r.userId === req.user.userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ message: 'Smart reminder not found' });
    }

    smartReminders[reminderIndex] = {
      ...smartReminders[reminderIndex],
      isDismissed: true,
      dismissedAt: new Date().toISOString()
    };

    res.json(smartReminders[reminderIndex]);
  } catch (error) {
    console.error('Dismiss smart reminder error:', error);
    res.status(500).json({ message: 'Failed to dismiss smart reminder' });
  }
});

// Reminder Stats routes
app.get('/api/reminders/stats', authenticateToken, (req, res) => {
  try {
    const userReminders = reminders.filter(r => r.userId === req.user.userId);
    const userSmartReminders = smartReminders.filter(r => r.userId === req.user.userId);
    
    const stats = {
      totalReminders: userReminders.length,
      pendingReminders: userReminders.filter(r => r.status === 'pending').length,
      completedReminders: userReminders.filter(r => r.status === 'completed').length,
      dismissedReminders: userReminders.filter(r => r.status === 'dismissed').length,
      upcomingReminders: userReminders.filter(r => r.status === 'pending' && new Date(r.scheduledFor) > new Date()).slice(0, 5),
      reminderEffectiveness: {
        completed: userReminders.filter(r => r.status === 'completed').length,
        dismissed: userReminders.filter(r => r.status === 'dismissed').length,
        missed: userReminders.filter(r => r.status === 'pending' && new Date(r.scheduledFor) < new Date()).length,
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get reminder stats error:', error);
    res.status(500).json({ message: 'Failed to get reminder stats' });
  }
});

// Test Notifications routes
app.post('/api/notifications/test', authenticateToken, (req, res) => {
  try {
    const { channel, type } = req.body;
    
    // Simulate sending a test notification
    const testNotification = {
      id: uuidv4(),
      userId: req.user.userId,
      type: type || 'test',
      title: 'Test Notification',
      message: 'This is a test notification',
      channel: channel || 'in_app',
      status: 'sent',
      sentAt: new Date().toISOString(),
      metadata: {
        reminderId: null,
        personId: null,
        occasionId: null,
        giftId: null,
      },
    };

    notificationHistory.push(testNotification);
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ message: 'Failed to send test notification' });
  }
});

// Bulk Reminder Operations
app.post('/api/reminders/bulk', authenticateToken, (req, res) => {
  try {
    const { reminders } = req.body;
    
    const createdReminders = reminders.map(reminderData => {
      const reminder = {
        id: uuidv4(),
        userId: req.user.userId,
        ...reminderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      reminders.push(reminder);
      return reminder;
    });

    res.status(201).json(createdReminders);
  } catch (error) {
    console.error('Create bulk reminders error:', error);
    res.status(500).json({ message: 'Failed to create bulk reminders' });
  }
});

app.put('/api/reminders/bulk', authenticateToken, (req, res) => {
  try {
    const { updates } = req.body;
    
    const updatedReminders = updates.map(({ id, updates: reminderUpdates }) => {
      const reminderIndex = reminders.findIndex(r => r.id === id && r.userId === req.user.userId);
      
      if (reminderIndex === -1) {
        return null;
      }

      reminders[reminderIndex] = {
        ...reminders[reminderIndex],
        ...reminderUpdates,
        updatedAt: new Date().toISOString()
      };

      return reminders[reminderIndex];
    }).filter(Boolean);

    res.json(updatedReminders);
  } catch (error) {
    console.error('Update bulk reminders error:', error);
    res.status(500).json({ message: 'Failed to update bulk reminders' });
  }
});

app.delete('/api/reminders/bulk', authenticateToken, (req, res) => {
  try {
    const { ids } = req.body;
    
    ids.forEach(id => {
      const reminderIndex = reminders.findIndex(r => r.id === id && r.userId === req.user.userId);
      if (reminderIndex !== -1) {
        reminders.splice(reminderIndex, 1);
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete bulk reminders error:', error);
    res.status(500).json({ message: 'Failed to delete bulk reminders' });
  }
});

// Stripe Payment Endpoints
app.post('/api/payments/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

app.post('/api/payments/create-subscription', authenticateToken, async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;

    // Create customer if doesn't exist
    let customer = await stripe.customers.list({
      email: users.find(u => u.id === req.user.userId)?.email,
      limit: 1
    });

    if (customer.data.length === 0) {
      customer = await stripe.customers.create({
        email: users.find(u => u.id === req.user.userId)?.email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } else {
      customer = customer.data[0];
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

app.post('/api/payments/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      canceledAt: new Date()
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

app.get('/api/payments/invoices', authenticateToken, async (req, res) => {
  try {
    const customer = await stripe.customers.list({
      email: users.find(u => u.id === req.user.userId)?.email,
      limit: 1
    });

    if (customer.data.length === 0) {
      return res.json([]);
    }

    const invoices = await stripe.invoices.list({
      customer: customer.data[0].id,
      limit: 10
    });

    res.json(invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      date: new Date(invoice.created * 1000),
      description: invoice.description
    })));
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Failed to get invoices' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gift Tracker API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: Supabase PostgreSQL`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  pool.end();
  process.exit(0);
}); 