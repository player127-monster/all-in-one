import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from '../../lib/auth.js';
import clientPromise from '../../lib/mongodb.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const users = db.collection('users');

    // Check if user exists
    let user = await users.findOne({ googleId });

    if (!user) {
      // Create new user
      user = {
        googleId,
        email,
        name,
        picture,
        createdAt: new Date(),
        isAdmin: false
      };
      
      const result = await users.insertOne(user);
      user._id = result.insertedId;
    }

    const jwtToken = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin
    });

    res.json({
      success: true,
      data: {
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          isAdmin: user.isAdmin
        }
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

// Verify token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token required' });
    }

    const { verifyToken } = await import('../../lib/auth.js');
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    res.json({ success: true, data: decoded });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, error: 'Token verification failed' });
  }
});

export default router;