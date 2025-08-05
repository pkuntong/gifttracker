export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Simple token validation - in production this would check JWT tokens
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      valid: false,
      message: 'No valid authorization token provided' 
    });
  }

  // For development, accept any token that starts with 'mock_token_'
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token.startsWith('mock_token_')) {
    return res.status(401).json({ 
      valid: false,
      message: 'Invalid token format' 
    });
  }

  // Return validation success with user data
  return res.json({
    data: {
      valid: true,
      user: {
        id: 'user_123',
        email: 'flashfolks@gmail.com',
        name: 'Flash Folks',
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
      }
    }
  });
}