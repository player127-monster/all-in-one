import express from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware, adminMiddleware } from '../../lib/auth.js';
import clientPromise from '../../lib/mongodb.js';

const router = express.Router();

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, shippingInfo, totalAmount } = req.body;

    if (!items || !items.length || !shippingInfo || !totalAmount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Items, shipping info, and total amount are required' 
      });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const orders = db.collection('orders');
    const products = db.collection('products');

    // Validate stock for all items
    for (const item of items) {
      const product = await products.findOne({ _id: new ObjectId(item.productId) });
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          error: `Product ${item.name} not found` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for ${item.name}. Available: ${product.stock}` 
        });
      }
    }

    // Create order
    const order = {
      userId: new ObjectId(req.user.userId),
      userInfo: {
        name: req.user.name,
        email: req.user.email
      },
      items: items.map(item => ({
        productId: new ObjectId(item.productId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingInfo,
      totalAmount: parseFloat(totalAmount),
      status: 'processing',
      createdAt: new Date()
    };

    const result = await orders.insertOne(order);
    order._id = result.insertedId;

    // Update stock for all items
    for (const item of items) {
      await products.updateOne(
        { _id: new ObjectId(item.productId) },
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const orders = db.collection('orders');

    const userOrders = await orders
      .find({ userId: new ObjectId(req.user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: userOrders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const orders = db.collection('orders');

    const allOrders = await orders
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: allOrders });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid order ID' });
    }

    if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const orders = db.collection('orders');

    const result = await orders.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status, 
          updatedAt: new Date(),
          [`${status}At`]: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedOrder = await orders.findOne({ _id: new ObjectId(id) });
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid order ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const orders = db.collection('orders');

    const query = { _id: new ObjectId(id) };
    
    // Non-admin users can only see their own orders
    if (!req.user.isAdmin) {
      query.userId = new ObjectId(req.user.userId);
    }

    const order = await orders.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

export default router;