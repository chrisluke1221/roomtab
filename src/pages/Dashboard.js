import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Receipt, 
  DollarSign, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Dashboard = ({ tenants, properties, bills }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Calculate statistics
  const totalTenants = tenants.length;
  const totalProperties = properties.length;
  const totalBills = bills.length;
  
  const monthlyBills = bills.filter(bill => {
    const billDate = new Date(bill.dueDate);
    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
  });
  
  const totalMonthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    return dueDate < new Date() && !bill.paid;
  });

  // Get recent bills
  const recentBills = bills
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get tenants with upcoming move-ins
  const upcomingMoveIns = tenants.filter(tenant => {
    const moveInDate = new Date(tenant.moveInDate);
    const today = new Date();
    const diffTime = moveInDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  });

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
      {link && (
        <Link to={link} className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
          View all →
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your landlord management dashboard</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={totalTenants}
          icon={Users}
          color="border-blue-500"
          link="/tenants"
        />
        <StatCard
          title="Properties"
          value={totalProperties}
          icon={Building2}
          color="border-green-500"
          link="/properties"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${totalMonthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="border-yellow-500"
        />
        <StatCard
          title="Overdue Bills"
          value={overdueBills.length}
          icon={AlertCircle}
          color="border-red-500"
          link="/bills"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bills</h2>
            <Link to="/bills" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentBills.length > 0 ? (
              recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {tenants.find(t => t.id === bill.tenantId)?.name || 'Unknown Tenant'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${bill.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bill.paid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bill.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No bills yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Move-ins */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Move-ins</h2>
            <Link to="/tenants" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingMoveIns.length > 0 ? (
              upcomingMoveIns.map((tenant) => {
                const moveInDate = new Date(tenant.moveInDate);
                const today = new Date();
                const diffTime = moveInDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-600">
                        {properties.find(p => p.id === tenant.propertyId)?.address || 'Unknown Property'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {moveInDate.toLocaleDateString()}
                      </p>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {diffDays} days
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming move-ins</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/tenants"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add New Tenant</p>
              <p className="text-sm text-gray-600">Register a new tenant</p>
            </div>
          </Link>
          
          <Link
            to="/properties"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building2 className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add Property</p>
              <p className="text-sm text-gray-600">Register a new property</p>
            </div>
          </Link>
          
          <Link
            to="/bills"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Receipt className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Generate Bills</p>
              <p className="text-sm text-gray-600">Create new bills</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;