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
    // Return mock occasion data
    return res.json([
      {
        id: '1',
        name: 'Christmas 2024',
        date: '2024-12-25',
        type: 'holiday',
        description: 'Annual Christmas celebration',
        budget: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: "Sarah's Birthday",
        date: '2024-05-15',
        type: 'birthday',
        personId: '1',
        description: 'Sister Sarah\'s birthday',
        budget: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Wedding Anniversary',
        date: '2024-08-12',
        type: 'anniversary',
        description: 'Annual wedding anniversary',
        budget: 200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }

  if (req.method === 'POST') {
    const { name, date, type, personId, description, budget } = req.body;
    
    const newOccasion = {
      id: Math.random().toString(36).substring(2, 15),
      name: name || 'New Occasion',
      date: date || new Date().toISOString().split('T')[0],
      type: type || 'other',
      personId: personId || '',
      description: description || '',
      budget: budget || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(201).json(newOccasion);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}