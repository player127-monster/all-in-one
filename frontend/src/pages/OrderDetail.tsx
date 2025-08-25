import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  userInfo: {
    name: string;
    email: string;
  };
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'processing':
        return {
          icon: <Package className="h-6 w-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Your order is being prepared',
        };
      case 'shipped':
        return {
          icon: <Truck className="h-6 w-6" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          description: 'Your order is on the way',
        };
      case 'delivered':
        return {
          icon: <CheckCircle className="h-6 w-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Your order has been delivered',
        };
      case 'cancelled':
        return {
          icon: <Clock className="h-6 w-6" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: 'Your order has been cancelled',
        };
      default:
        return {
          icon: <Clock className="h-6 w-6" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Status unknown',
        };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-8 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded"></div>
            <div className="bg-gray-300 h-96 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        <Link to="/orders" className="text-blue-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusDetails = getStatusDetails(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/orders"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          
          <div className={`flex items-center space-x-3 ${statusDetails.bgColor} rounded-lg p-4 mt-4 md:mt-0`}>
            <div className={statusDetails.color}>
              {statusDetails.icon}
            </div>
            <div>
              <p className={`font-semibold ${statusDetails.color}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
              <p className="text-sm text-gray-600">
                {statusDetails.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Order Items</h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-blue-600 font-medium">${item.price.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Information</h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Name:</span> {order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
              <p><span className="font-medium">Email:</span> {order.shippingInfo.email}</p>
              <p><span className="font-medium">Phone:</span> {order.shippingInfo.phone}</p>
              <p><span className="font-medium">Address:</span> {order.shippingInfo.address}</p>
              <p><span className="font-medium">City:</span> {order.shippingInfo.city}</p>
              <p><span className="font-medium">State:</span> {order.shippingInfo.state}</p>
              <p><span className="font-medium">ZIP Code:</span> {order.shippingInfo.zipCode}</p>
              <p><span className="font-medium">Country:</span> {order.shippingInfo.country}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-semibold text-blue-800 mb-1">Cash on Delivery</p>
              <p className="text-blue-700 text-sm">
                Payment will be collected when your order is delivered.
              </p>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-800">Order Placed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              
              {order.status !== 'processing' && (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">Order Shipped</p>
                    <p className="text-sm text-gray-600">
                      {order.updatedAt && new Date(order.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
              
              {order.status === 'delivered' && (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">Order Delivered</p>
                    <p className="text-sm text-gray-600">
                      {order.updatedAt && new Date(order.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help with Your Order?</h3>
        <p className="text-gray-600 mb-4">
          If you have any questions about your order, feel free to contact our customer support team.
        </p>
        <Link
          to="/contact"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail;