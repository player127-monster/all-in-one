import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, Star, MessageCircle, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
  totalMessages: number;
  totalRevenue: number;
  recentOrders: any[];
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalReviews: 0,
    totalMessages: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, reviewsRes, messagesRes] = await Promise.all([
        fetch('https://backend4-phi.vercel.app/api/products/admin/all', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('https://backend4-phi.vercel.app/api/orders/admin/all', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('https://backend4-phi.vercel.app/api/reviews/admin/all', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('https://backend4-phi.vercel.app/api/messages/admin/all', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const [productsData, ordersData, reviewsData, messagesData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        reviewsRes.json(),
        messagesRes.json(),
      ]);

      const totalRevenue = ordersData.success 
        ? ordersData.data.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
        : 0;

      const recentOrders = ordersData.success 
        ? ordersData.data.slice(0, 5)
        : [];

      setStats({
        totalProducts: productsData.success ? productsData.data.length : 0,
        totalOrders: ordersData.success ? ordersData.data.length : 0,
        totalReviews: reviewsData.success ? reviewsData.data.length : 0,
        totalMessages: messagesData.success ? messagesData.data.length : 0,
        totalRevenue,
        recentOrders,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      name: 'Total Reviews',
      value: stats.totalReviews,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      name: 'Messages',
      value: stats.totalMessages,
      icon: MessageCircle,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-600',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-300 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.userInfo.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <Package className="h-4 w-4 mr-2" />
            Add New Product
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View All Orders
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Check Messages
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;