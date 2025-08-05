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
    // Return mock people data
    return res.json({ data: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        relationship: 'Sister',
        birthday: '1990-05-15',
        notes: 'Loves technology and coffee',
        avatar: '/placeholder.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        relationship: 'Friend',
        birthday: '1988-12-03',
        notes: 'Into fitness and outdoor activities',
        avatar: '/placeholder.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Emma Davis',
        email: 'emma@example.com',
        relationship: 'Colleague',
        birthday: '1992-08-22',
        notes: 'Book lover and plant enthusiast',
        avatar: '/placeholder.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      ]
    });
  }

  if (req.method === 'POST') {
    const { name, email, relationship, birthday, notes, avatar, familyId } = req.body;
    
    const newPerson = {
      id: Math.random().toString(36).substring(2, 15),
      name: name || 'New Person',
      email: email || '',
      relationship: relationship || '',
      birthday: birthday || '',
      notes: notes || '',
      avatar: avatar || '/placeholder.svg',
      familyId: familyId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(201).json({ data: newPerson });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}