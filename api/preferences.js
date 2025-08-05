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
    // Return current user preferences
    return res.json({
      data: {
        currency: 'USD',
        timezone: 'America/New_York', 
        theme: 'system',
        notifications: true,
        language: 'en'
      }
    });
  }

  if (req.method === 'PUT') {
    const { currency, timezone, theme, notifications } = req.body;
    
    // Validate currency format (3-letter code)
    if (currency && !/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ 
        message: 'Currency must be a valid 3-letter code (e.g., USD, EUR)' 
      });
    }

    // Validate theme
    if (theme && !['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({ 
        message: 'Theme must be light, dark, or system' 
      });
    }

    // Return updated preferences
    const updatedPreferences = {
      currency: currency || 'USD',
      timezone: timezone || 'America/New_York',
      theme: theme || 'system', 
      notifications: notifications !== undefined ? notifications : true,
      language: 'en'
    };

    console.log('✅ Preferences updated:', updatedPreferences);
    return res.json({
      data: {
        success: true,
        preferences: updatedPreferences
      }
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}