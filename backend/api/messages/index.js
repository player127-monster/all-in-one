import express from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware, adminMiddleware } from '../../lib/auth.js';
import clientPromise from '../../lib/mongodb.js';

const router = express.Router();

// Create message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and message are required' 
      });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const messages = db.collection('messages');

    const newMessage = {
      name,
      email,
      phone: phone || '',
      subject: subject || '',
      message,
      read: false,
      createdAt: new Date()
    };

    const result = await messages.insertOne(newMessage);
    newMessage._id = result.insertedId;

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Get all messages (admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const messages = db.collection('messages');

    const allMessages = await messages
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: allMessages });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Mark message as read (admin only)
router.put('/:id/read', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid message ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const messages = db.collection('messages');

    const result = await messages.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          read: Boolean(read),
          readAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const updatedMessage = await messages.findOne({ _id: new ObjectId(id) });
    res.json({ success: true, data: updatedMessage });
  } catch (error) {
    console.error('Update message read status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update message' });
  }
});

// Delete message (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid message ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const messages = db.collection('messages');

    const result = await messages.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

export default router;