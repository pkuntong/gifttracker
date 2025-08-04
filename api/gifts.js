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
    // Return mock gift data
    return res.json([
      {
        id: '1',
        name: 'Wireless Headphones',
        description: 'High-quality noise-canceling headphones',
        price: 199.99,
        currency: 'USD',
        status: 'planned',
        recipientId: '1',
        occasionId: '1',
        notes: 'Perfect for music lover',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Coffee Subscription',
        description: 'Monthly premium coffee delivery',
        price: 24.99,
        currency: 'USD',
        status: 'purchased',
        recipientId: '2',
        occasionId: '2',
        notes: 'They love coffee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Plant Care Kit',
        description: 'Everything needed for indoor gardening',
        price: 49.99,
        currency: 'USD',
        status: 'wrapped',
        recipientId: '3',
        notes: 'Great for plant enthusiast',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }

  if (req.method === 'POST') {
    const { name, description, price, currency, status, recipientId, occasionId, notes } = req.body;
    
    const newGift = {
      id: Math.random().toString(36).substring(2, 15),
      name: name || 'New Gift',
      description: description || '',
      price: price || 0,
      currency: currency || 'USD',
      status: status || 'planned',
      recipientId: recipientId || '',
      occasionId: occasionId || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(201).json(newGift);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}