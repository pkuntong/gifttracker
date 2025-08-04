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

  // Return mock financial insights data
  return res.json({
    insights: {
      totalSpent: 1245.50,
      totalBudget: 2000.00,
      budgetUtilization: 62.3,
      topCategories: [
        { category: 'Electronics', amount: 450.00, percentage: 36.1 },
        { category: 'Clothing', amount: 325.50, percentage: 26.1 },
        { category: 'Books', amount: 180.00, percentage: 14.5 },
        { category: 'Food & Drink', amount: 120.00, percentage: 9.6 },
        { category: 'Supplies', amount: 170.00, percentage: 13.7 }
      ],
      monthlyTrend: [
        { month: 'Oct', amount: 280.50 },
        { month: 'Nov', amount: 420.00 },
        { month: 'Dec', amount: 545.00 },
        { month: 'Jan', amount: 320.50 },
        { month: 'Feb', amount: 425.00 },
        { month: 'Mar', amount: 500.00 }
      ],
      recommendations: [
        'Consider setting a lower budget for Electronics category',
        'Great job staying under budget this month!',
        'You might want to track gift wrapping expenses separately',
        'Your spending pattern shows good seasonal planning'
      ],
      upcomingExpenses: [
        { name: 'Valentine\'s Day', date: '2024-02-14', estimatedAmount: 150 },
        { name: 'Mother\'s Day', date: '2024-05-12', estimatedAmount: 200 }
      ]
    }
  });
}