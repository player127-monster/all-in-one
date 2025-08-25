import express from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware, adminMiddleware } from '../../lib/auth.js';
import clientPromise from '../../lib/mongodb.js';

const router = express.Router();

// Add review (only if order is delivered)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID, order ID, and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const orders = db.collection('orders');
    const reviews = db.collection('reviews');

    // Check if order exists and is delivered
    const order = await orders.findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(req.user.userId),
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order not found or not delivered yet' 
      });
    }

    // Check if product is in the order
    const productInOrder = order.items.some(
      item => item.productId.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product not found in this order' 
      });
    }

    // Check if review already exists
    const existingReview = await reviews.findOne({
      productId: new ObjectId(productId),
      userId: new ObjectId(req.user.userId),
      orderId: new ObjectId(orderId)
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already reviewed this product' 
      });
    }

    // Create review
    const review = {
      productId: new ObjectId(productId),
      userId: new ObjectId(req.user.userId),
      orderId: new ObjectId(orderId),
      userName: req.user.name,
      rating: parseInt(rating),
      comment: comment || '',
      approved: true,
      createdAt: new Date()
    };

    const result = await reviews.insertOne(review);
    review._id = result.insertedId;

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, error: 'Failed to add review' });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const reviews = db.collection('reviews');

    const productReviews = await reviews
      .find({ 
        productId: new ObjectId(productId), 
        approved: true 
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: productReviews });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// Get all reviews (admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const reviews = db.collection('reviews');

    const allReviews = await reviews
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: allReviews });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// Update review approval (admin only)
router.put('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const reviews = db.collection('reviews');

    const result = await reviews.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          approved: Boolean(approved),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const updatedReview = await reviews.findOne({ _id: new ObjectId(id) });
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error('Update review approval error:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// Delete review (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const reviews = db.collection('reviews');

    const result = await reviews.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

export default router;