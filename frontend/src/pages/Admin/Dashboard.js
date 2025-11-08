import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/Admin";
import { toast } from "react-toastify";
import api from "../../services/api";

const AdminDashboardNew = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 10,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 - New Customers */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-purple-200 text-sm mb-1">0 (+12.4% 🡅)</p>
              <h3 className="text-3xl font-bold mb-1">{stats.totalUsers}</h3>
              <p className="text-purple-200 text-sm">New Customers (today)</p>
            </div>
            {/* Mini Chart */}
            <div className="mt-4 flex items-end gap-1 h-12">
              {[40, 60, 35, 80, 50, 70, 65, 90, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white bg-opacity-30 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Card 2 - Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 text-sm mb-1">$0 (+8.2% 🡅)</p>
              <h3 className="text-3xl font-bold mb-1">${stats.totalRevenue}</h3>
              <p className="text-blue-200 text-sm">Revenue Today</p>
            </div>
            <div className="mt-4 flex items-end gap-1 h-12">
              {[50, 70, 45, 85, 60, 75, 55, 95, 80].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white bg-opacity-30 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Card 3 - Orders */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-yellow-100 text-sm mb-1">64 (+6.7% 🡅)</p>
              <h3 className="text-3xl font-bold mb-1">{stats.totalOrders}</h3>
              <p className="text-yellow-100 text-sm">Orders</p>
            </div>
            <div className="mt-4 flex items-end gap-1 h-12">
              {[45, 65, 40, 75, 55, 70, 60, 85, 70].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white bg-opacity-30 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Card 4 - Products */}
          <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-pink-100 text-sm mb-1">10 (+3.1% 🡅)</p>
              <h3 className="text-3xl font-bold mb-1">{stats.totalProducts}</h3>
              <p className="text-pink-100 text-sm">Total Products</p>
            </div>
            <div className="mt-4 flex items-end gap-1 h-12">
              {[55, 75, 50, 80, 65, 85, 70, 90, 85].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white bg-opacity-30 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardNew;
