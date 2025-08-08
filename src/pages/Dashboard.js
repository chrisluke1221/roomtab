import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowRight,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { rooms, loading } = useRoom();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && room.expenses.length > 0) ||
                         (filterStatus === 'inactive' && room.expenses.length === 0);
    return matchesSearch && matchesFilter;
  });

  const totalExpenses = rooms.reduce((sum, room) => sum + room.expenses.length, 0);
  const totalAmount = rooms.reduce((sum, room) => 
    sum + room.expenses.reduce((roomSum, expense) => roomSum + expense.amount, 0), 0
  );

  const recentExpenses = rooms
    .flatMap(room => room.expenses.map(expense => ({ ...expense, roomName: room.name })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-secondary-600">
            Manage your shared expenses and keep track of your rooms.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Rooms</p>
                <p className="text-2xl font-bold text-secondary-900">{rooms.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Expenses</p>
                <p className="text-2xl font-bold text-secondary-900">{totalExpenses}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Amount</p>
                <p className="text-2xl font-bold text-secondary-900">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Rooms</option>
            <option value="active">Active Rooms</option>
            <option value="inactive">Inactive Rooms</option>
          </select>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Create New Room Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card border-2 border-dashed border-secondary-300 hover:border-primary-400 transition-colors duration-200 cursor-pointer"
            onClick={() => navigate('/create-room')}
          >
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Create New Room
              </h3>
              <p className="text-secondary-600">
                Start a new room to manage shared expenses
              </p>
            </div>
          </motion.div>

          {/* Existing Rooms */}
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                    {room.name}
                  </h3>
                  <p className="text-sm text-secondary-600">
                    {room.members.length} members
                  </p>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-secondary-100 rounded">
                    <MoreVertical className="w-4 h-4 text-secondary-400" />
                  </button>
                </div>
              </div>

              <p className="text-secondary-600 text-sm mb-4">
                {room.description || 'No description'}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-secondary-600">
                  {room.expenses.length} expenses
                </div>
                <div className="text-sm font-semibold text-secondary-900">
                  ${room.expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                </div>
              </div>

              <Link
                to={`/room/${room.id}`}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span>View Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        {recentExpenses.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">
                        {expense.description}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {expense.roomName} • {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary-900">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {expense.paidBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;