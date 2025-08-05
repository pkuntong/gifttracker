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
    // Return mock expense data
    return res.json({ data: [
        {
          id: '1',
          amount: 89.99,
          currency: 'USD',
          description: 'Bluetooth headphones for Sarah',
          category: 'Electronics',
          date: '2024-01-15',
          budgetId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          amount: 45.50,
          currency: 'USD',
          description: 'Gift wrapping supplies',
          category: 'Supplies',
          date: '2024-01-20',
          budgetId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          amount: 24.99,
          currency: 'USD',
          description: 'Coffee subscription for Mike',
          category: 'Food & Drink',
          date: '2024-01-25',
          budgetId: '2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }

  if (req.method === 'POST') {
    const { amount, currency, description, category, budgetId, giftId, date } = req.body;
    
    const newExpense = {
      id: Math.random().toString(36).substring(2, 15),
      amount: amount || 0,
      currency: currency || 'USD',
      description: description || 'New Expense',
      category: category || 'General',
      budgetId: budgetId || '',
      giftId: giftId || '',
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(201).json({ data: newExpense });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}