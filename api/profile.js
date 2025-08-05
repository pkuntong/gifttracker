export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return mock user profile data in expected format
    return res.json({
      data: {
        id: 'user_123',
        email: 'flashfolks@gmail.com',
        name: 'Flash Folks',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        preferences: {
          currency: 'USD',
          timezone: 'America/New_York',
          theme: 'system',
          notifications: true,
          language: 'en',
          subscription: {
            plan: 'FREE',
            status: 'active'
          }
        }
      }
    });
  }

  if (req.method === 'PUT') {
    const { name, email } = req.body;
    
    // Validate input
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    if (name && name.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Name must be at least 2 characters long' 
      });
    }

    // Return updated profile
    const updatedProfile = {
      id: 'user_123',
      email: email || 'flashfolks@gmail.com',
      name: name || 'Flash Folks',
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date().toISOString(),
      preferences: {
        currency: 'USD',
        timezone: 'America/New_York',
        theme: 'system',
        notifications: true,
        language: 'en',
        subscription: {
          plan: 'FREE',
          status: 'active'
        }
      }
    };

    console.log('✅ Profile updated:', { name, email });
    return res.json({ data: updatedProfile });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}