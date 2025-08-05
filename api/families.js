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
    // Return mock families data
    return res.json({ data: [
      {
        id: '1',
        name: 'Johnson Family',
        description: 'Extended family group for holidays and birthdays',
        members: [
          {
            id: 'member_1',
            userId: 'user_123',
            name: 'Flash Folks',
            email: 'flashfolks@gmail.com',
            role: 'admin',
            joinedAt: new Date('2024-01-01').toISOString()
          },
          {
            id: 'member_2',
            userId: 'user_456',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            role: 'member',
            joinedAt: new Date('2024-01-15').toISOString()
          },
          {
            id: 'member_3',
            userId: 'user_789',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'member',
            joinedAt: new Date('2024-02-01').toISOString()
          }
        ],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          allowInvites: true,
          shareGifts: true,
          shareBudgets: false
        }
      },
      {
        id: '2',
        name: 'Work Friends',
        description: 'Office colleagues for gift exchanges',
        members: [
          {
            id: 'member_4',
            userId: 'user_123',
            name: 'Flash Folks',
            email: 'flashfolks@gmail.com',
            role: 'admin',
            joinedAt: new Date('2024-02-01').toISOString()
          },
          {
            id: 'member_5',
            userId: 'user_101',
            name: 'Emma Davis',
            email: 'emma@example.com',
            role: 'member',
            joinedAt: new Date('2024-02-05').toISOString()
          }
        ],
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          allowInvites: true,
          shareGifts: true,
          shareBudgets: true
        }
      }
      ]
    });
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Family name must be at least 2 characters long' 
      });
    }

    const newFamily = {
      id: Math.random().toString(36).substring(2, 15),
      name: name.trim(),
      description: description?.trim() || '',
      members: [
        {
          id: 'member_' + Math.random().toString(36).substring(2, 15),
          userId: 'user_123',
          name: 'Flash Folks',
          email: 'flashfolks@gmail.com',
          role: 'admin',
          joinedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        allowInvites: true,
        shareGifts: true,
        shareBudgets: false
      }
    };

    console.log('✅ Family created:', { name, description });
    return res.status(201).json({ data: newFamily });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}