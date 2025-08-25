# ShopHub - Full-Stack MERN E-commerce Application

A complete e-commerce solution built with MongoDB, Express.js, React, and Node.js, designed for deployment on Vercel.

## 🚀 Features

### Frontend (React)
- **Google OAuth 2.0 Authentication** - Secure user login without Firebase
- **Product Catalog** - Browse products with search, filtering, and sorting
- **Shopping Cart** - Add, remove, and update quantities with stock validation
- **Checkout Process** - Cash on delivery with shipping information collection
- **Order Tracking** - View order history and real-time status updates
- **Product Reviews** - Leave reviews only after order delivery
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Admin Dashboard** - Secure admin panel for business management

### Backend (Node.js/Express)
- **Serverless Architecture** - Optimized for Vercel deployment
- **MongoDB Atlas Integration** - Cloud database with proper connection pooling
- **JWT Authentication** - Secure token-based authentication
- **Admin Management** - Two default admin accounts with secure login
- **Stock Management** - Real-time inventory tracking
- **Order Processing** - Complete order lifecycle management
- **Review System** - Moderated reviews tied to delivered orders
- **Message System** - Customer contact form with admin management

## 🏗️ Project Structure

```
├── backend/                 # Node.js API (Serverless functions)
│   ├── api/
│   │   ├── auth/           # Authentication routes
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order processing
│   │   ├── reviews/        # Review system
│   │   ├── messages/       # Contact messages
│   │   └── admin/          # Admin authentication
│   ├── lib/
│   │   ├── mongodb.js      # Database connection
│   │   └── auth.js         # Authentication utilities
│   └── vercel.json         # Vercel deployment config
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React contexts
│   │   ├── pages/          # Page components
│   │   └── assets/         # Static assets
│   └── dist/               # Build output
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Google OAuth 2.0 credentials

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

5. Start development server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

5. Start development server:
```bash
npm run dev
```

## 📋 Database Collections

The application uses the following MongoDB collections:

- **users** - Google OAuth user profiles
- **admins** - Admin accounts (username/password)
- **products** - Product catalog with inventory
- **orders** - Customer orders with status tracking
- **reviews** - Product reviews (delivery-gated)
- **messages** - Customer contact messages

## 🔐 Admin Access

Default admin credentials:
- Username: `admin1` | Password: `admin1`
- Username: `admin2` | Password: `admin2`

Access the admin dashboard at `/admin/login`

## 🌐 Deployment

### Vercel Deployment

1. **Backend Deployment:**
   - Push backend code to Git repository
   - Connect to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy as serverless functions

2. **Frontend Deployment:**
   - Build the frontend: `npm run build`
   - Deploy the `dist` folder to Vercel
   - Configure environment variables

3. **Environment Variables:**
   - Set all required environment variables in Vercel dashboard
   - Update `FRONTEND_URL` to production URL

### MongoDB Atlas Setup
1. Create MongoDB Atlas cluster
2. Configure IP whitelist (0.0.0.0/0 for Vercel)
3. Create database user
4. Get connection string

### Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized domains
4. Configure client ID in environment variables

## 🔧 Configuration

### Email Notifications (EmailJS)
The application is prepared for EmailJS integration for order notifications:

```javascript
// In src/pages/Checkout.tsx
await emailjs.send('service_id', 'template_id', emailData, 'user_id');
```

### Stock Management
- Stock decreases only after successful order placement
- Real-time stock validation during checkout
- Out-of-stock prevention in cart and product pages

### Review System
- Reviews only allowed after order status = "delivered"
- Automatic approval (configurable in admin panel)
- Prevents duplicate reviews per order/product combination

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/verify` - Token verification
- `POST /api/admin/login` - Admin login

### Products
- `GET /api/products` - Get all active products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (admin)

### Reviews
- `POST /api/reviews` - Add review (delivery required)
- `GET /api/reviews/product/:id` - Get product reviews

### Messages
- `POST /api/messages` - Send contact message

## 🧪 Testing

### Default Test Data
The application initializes with:
- 2 admin accounts
- Sample products (configurable)
- Test orders and reviews

### Manual Testing Checklist
- [ ] User registration/login with Google
- [ ] Product browsing and filtering
- [ ] Cart operations with stock validation
- [ ] Checkout process with order creation
- [ ] Order status updates
- [ ] Review submission (after delivery)
- [ ] Admin dashboard functionality
- [ ] Contact form submission

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Live Demo

- **Frontend:** [Your Vercel Frontend URL]
- **Backend API:** [Your Vercel Backend URL]
- **Admin Panel:** [Frontend URL]/admin/login

## 💡 Features Overview

### Customer Features
✅ Google OAuth authentication  
✅ Product browsing with advanced filters  
✅ Shopping cart with stock validation  
✅ Secure checkout process  
✅ Order tracking and history  
✅ Product reviews (post-delivery)  
✅ Contact form  
✅ Responsive mobile design  

### Admin Features
✅ Secure admin authentication  
✅ Product management (CRUD)  
✅ Order management with status updates  
✅ Review moderation  
✅ Customer message management  
✅ Dashboard with analytics  
✅ Stock management  

### Technical Features
✅ Serverless architecture (Vercel-optimized)  
✅ MongoDB Atlas integration  
✅ JWT-based authentication  
✅ Error handling and validation  
✅ Email notification system (EmailJS ready)  
✅ Production-ready deployment  

---

Built with ❤️ using React, Node.js, MongoDB, and deployed on Vercel.