// Next.js API route for logout
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Clear authentication cookies
    res.setHeader('Set-Cookie', [
      'auth-session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
    ]);
    
    // Redirect to home page
    res.redirect(302, '/');
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}