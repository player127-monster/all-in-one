import express from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware, adminMiddleware } from '../../lib/auth.js';
import clientPromise from '../../lib/mongodb.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const products = db.collection('products');

    const allProducts = await products.find({ active: true }).toArray();
    
    res.json({ success: true, data: allProducts });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const products = db.collection('products');

    const product = await products.findOne({ _id: new ObjectId(id), active: true });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, image, stock, category } = req.body;

    if (!name || !description || !price || !image || stock === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, description, price, image, and stock are required' 
      });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const products = db.collection('products');

    const product = {
      name,
      description,
      price: parseFloat(price),
      image,
      stock: parseInt(stock),
      category: category || 'general',
      active: true,
      createdAt: new Date()
    };

    const result = await products.insertOne(product);
    product._id = result.insertedId;

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock, category, active } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const products = db.collection('products');

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (image !== undefined) updateData.image = image;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category !== undefined) updateData.category = category;
    if (active !== undefined) updateData.active = active;
    updateData.updatedAt = new Date();

    const result = await products.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updatedProduct = await products.findOne({ _id: new ObjectId(id) });
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const products = db.collection('products');

    const result = await products.updateOne(
      { _id: new ObjectId(id) },
      { $set: { active: false, deletedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

// Get all products for admin (includes inactive)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const mongodb = await clientPromise;
    const db = mongodb.db('ecommerce');
    const products = db.collection('products');

    const allProducts = await products.find({}).toArray();
    
    res.json({ success: true, data: allProducts });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

export default router;