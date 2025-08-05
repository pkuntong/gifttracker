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
    // Return mock budget data
    return res.json({
      data: [
        {
          id: '1',
          name: 'Christmas 2024',
          amount: 500,
          currency: 'USD',
          period: 'yearly',
          type: 'occasion',
          spent: 250,
          remaining: 250,
          status: 'on_track',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Birthday Gifts',
          amount: 200,
          currency: 'USD',
          period: 'monthly',
          type: 'general',
          spent: 180,
          remaining: 20,
          status: 'over_budget',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }

  if (req.method === 'POST') {
    const { name, amount, currency, period, type, description } = req.body;
    
    const newBudget = {
      id: Math.random().toString(36).substring(2, 15),
      name: name || 'New Budget',
      amount: amount || 0,
      currency: currency || 'USD',
      period: period || 'monthly',
      type: type || 'general',
      description: description || '',
      spent: 0,
      remaining: amount || 0,
      status: 'on_track',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(201).json({ data: newBudget });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}