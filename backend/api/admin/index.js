import express from 'express';
import { generateToken, comparePassword, hashPassword } from '../../lib/auth.js';
import clientPromise from '../../lib/mongodb.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const admins = db.collection('admins');

    // Initialize default admins if collection is empty
    const adminCount = await admins.countDocuments();
    if (adminCount === 0) {
      const defaultAdmins = [
        {
          username: 'admin1',
          password: await hashPassword('admin1'),
          createdAt: new Date()
        },
        {
          username: 'admin2',
          password: await hashPassword('admin2'),
          createdAt: new Date()
        }
      ];
      await admins.insertMany(defaultAdmins);
    }

    const admin = await admins.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const validPassword = await comparePassword(password, admin.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: admin._id,
      username: admin.username,
      isAdmin: true
    });

    console.log(token);
    

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          isAdmin: true
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

export default router;