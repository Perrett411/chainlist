// Next.js API route for user authentication - temporary implementation
// TODO: Replace with full Replit Auth when production environment is configured

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Temporary mock authentication for development
  // In production, this would use the full Replit Auth infrastructure
  
  // Check for auth cookie (simulated)
  const authCookie = req.cookies['auth-session'];
  
  if (!authCookie || authCookie !== 'authenticated') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Return mock authenticated user
  // This demonstrates the expected user structure from server-side auth
  const user = {
    id: 'demo_user_' + Date.now(),
    email: 'demo@perrettassociates.com',
    firstName: 'Demo',
    lastName: 'User',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=2F80ED&color=fff',
    role: 'admin', // Set to admin for demo purposes
    permissions: ['read', 'write', 'admin'],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json(user);
}