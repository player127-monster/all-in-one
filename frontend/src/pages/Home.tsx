import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingCart, Truck, Shield, Headphones } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Toaster, toast } from 'react-hot-toast';


interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('https://backend4-phi.vercel.app/api/products');
      const data = await response.json();
      console.log(data);
      
      
      if (data.success) {
        await setFeaturedProducts(data.data.slice(0, 8)); // Show first 8 products
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      

      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">AllinOne</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover amazing products at unbeatable prices. Your one-stop destination for quality shopping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50. Fast and reliable delivery.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Shopping</h3>
              <p className="text-gray-600">Your data is safe with us. SSL encryption and secure payments.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Get help when you need it. Our support team is always ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium products that our customers love most.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          ${product.price}
                        </span>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                          ))}
                          <span className="text-sm text-gray-500 ml-1">(4.5)</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Link
                          to={`/products/${product._id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers and discover amazing deals today!
          </p>
          <Link
            to="/products"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center"
          >
            Browse Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;