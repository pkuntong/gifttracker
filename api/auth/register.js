export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    console.log('🔧 Registration attempt for:', email);
    
    // Generate simple mock data for registration
    const userId = Math.random().toString(36).substring(2, 15);
    const token = 'mock_token_' + Math.random().toString(36).substring(2, 15);
    
    const userData = {
      id: userId,
      email: email,
      name: name || 'New User',
      created_at: new Date().toISOString()
    };

    console.log('✅ Registration successful for:', email);
    return res.status(201).json({
      user: userData,
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}