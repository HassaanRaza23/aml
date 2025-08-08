import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BellIcon, UserPlusIcon, FileBarChartIcon, ShieldAlertIcon } from "lucide-react";
import { dashboardService } from "../services/dashboardService";
import { toast } from "react-toastify";

const COLORS = ["#16a34a", "#eab308", "#dc2626"];

const DashboardHome = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    customerStats: { total: 0, recent: 0, riskLevels: {} },
    screeningStats: { total: 0, recent: 0 },
    caseStats: { total: 0, open: 0, inProgress: 0, statusStats: {} },
    reportStats: { total: 0, sar: 0, recent: 0 },
    alertStats: { total: 0, pending: 0, severityStats: {}, alertsOverTime: [] },
    riskStats: { riskLevels: {}, pieData: [] },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [highRiskCustomers, setHighRiskCustomers] = useState([]);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard data');
        toast.error('Failed to load dashboard data');
      }

      // Fetch additional data
      const [tasks, customers] = await Promise.all([
        dashboardService.getPendingTasks(),
        dashboardService.getHighRiskCustomers()
      ]);

      setPendingTasks(tasks);
      setHighRiskCustomers(customers);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AML Platform Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold text-blue-600">{stats.customerStats.total}</div>
            <div className="text-sm text-gray-500">Customers Onboarded</div>
            <div className="text-xs text-green-600 mt-1">+{stats.customerStats.recent} this week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold text-purple-600">{stats.screeningStats.total}</div>
            <div className="text-sm text-gray-500">Screenings Done</div>
            <div className="text-xs text-green-600 mt-1">+{stats.screeningStats.recent} this week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold text-orange-600">{stats.caseStats.total}</div>
            <div className="text-sm text-gray-500">Total Cases</div>
            <div className="text-xs text-orange-600 mt-1">{stats.caseStats.open} open, {stats.caseStats.inProgress} in progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold text-red-600">{stats.reportStats.sar}</div>
            <div className="text-sm text-gray-500">SAR Reports Filed</div>
            <div className="text-xs text-green-600 mt-1">+{stats.reportStats.recent} this week</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="font-semibold mb-2">Alerts Over Time</div>
            {stats.alertStats.alertsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.alertStats.alertsOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                No alert data available
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-semibold mb-2">Customer Risk Levels</div>
            {stats.riskStats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.riskStats.pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {stats.riskStats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                No risk data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="font-semibold mb-4">Quick Actions</div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            onClick={() => navigate('/customer/onboarding')}
          >
            <UserPlusIcon size={16} /> Add New Customer
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
            onClick={() => navigate('/screening/instant')}
          >
            <ShieldAlertIcon size={16} /> Start Screening
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-colors"
            onClick={() => navigate('/reports/reportgeneration')}
          >
            <FileBarChartIcon size={16} /> Generate Report
          </Button>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-red-600">{stats.alertStats.pending}</div>
            <div className="text-sm text-gray-500">Pending Alerts</div>
            <div className="text-xs text-red-600 mt-1">Requires attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-yellow-600">{stats.caseStats.open}</div>
            <div className="text-sm text-gray-500">Open Cases</div>
            <div className="text-xs text-yellow-600 mt-1">Need assignment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-green-600">{stats.reportStats.total}</div>
            <div className="text-sm text-gray-500">Total Reports</div>
            <div className="text-xs text-green-600 mt-1">Generated this month</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="font-semibold mb-4">Pending Tasks</div>
        {pendingTasks.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {pendingTasks.map((task, index) => (
              <li key={index} className="text-red-600">{task}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-green-600">✅ All tasks completed!</p>
        )}
      </div>

      {/* High Risk Profiles */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="font-semibold mb-4">Recent High-Risk Customers</div>
        {highRiskCustomers.length > 0 ? (
          <ul className="text-sm text-gray-700 space-y-2">
            {highRiskCustomers.map((customer, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-red-500">🔴</span>
                <span className="font-medium">{customer.name}</span>
                <span className="text-gray-500">- {customer.riskLevel} Risk</span>
                <span className="text-xs text-gray-400">(Added {customer.created})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-green-600">✅ No high-risk customers found</p>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="font-semibold mb-4">Recent Activity</div>
        {stats.recentActivity.length > 0 ? (
          <ul className="text-sm text-gray-700 space-y-2">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-blue-500">✅</span>
                <span>{activity.description}</span>
                <span className="text-xs text-gray-400">by {activity.user}</span>
                <span className="text-xs text-gray-400">({activity.timestamp})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
