import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Plus, 
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
  Share,
  Calculator,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { getRoomById, currentRoom, setCurrentRoom, addExpense, updateExpense, deleteExpense } = useRoom();
  const navigate = useNavigate();
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    const room = getRoomById(roomId);
    if (room) {
      setCurrentRoom(room);
    } else {
      navigate('/dashboard');
    }
  }, [roomId, getRoomById, setCurrentRoom, navigate]);

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading room...</p>
        </div>
      </div>
    );
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  const totalExpenses = currentRoom.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averagePerPerson = totalExpenses / currentRoom.members.length;

  const calculateBalances = () => {
    const balances = {};
    currentRoom.members.forEach(member => {
      balances[member.id] = 0;
    });

    currentRoom.expenses.forEach(expense => {
      // Add what the payer paid
      balances[expense.paidBy] += expense.amount;
      
      // Subtract what each person owes
      const amountPerPerson = expense.amount / expense.splitBetween.length;
      expense.splitBetween.forEach(memberId => {
        balances[memberId] -= amountPerPerson;
      });
    });

    return balances;
  };

  const balances = calculateBalances();

  const tabs = [
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'balances', label: 'Balances', icon: Calculator }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-secondary-900">{currentRoom.name}</h1>
                <p className="text-sm text-secondary-600">{currentRoom.members.length} members</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={copyRoomId}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 transition-colors duration-200"
              >
                {copiedRoomId ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedRoomId ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Expenses</p>
                <p className="text-2xl font-bold text-secondary-900">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
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
                <p className="text-sm font-medium text-secondary-600">Number of Expenses</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {currentRoom.expenses.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
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
                <p className="text-sm font-medium text-secondary-600">Average per Person</p>
                <p className="text-2xl font-bold text-secondary-900">
                  ${averagePerPerson.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Members</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {currentRoom.members.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentRoom.expenses.length === 0 ? (
                <div className="card text-center py-12">
                  <DollarSign className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Add your first expense to start tracking shared costs.
                  </p>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="btn-primary"
                  >
                    Add First Expense
                  </button>
                </div>
              ) : (
                currentRoom.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="card hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900 mb-1">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          Paid by {expense.paidBy} • {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-secondary-600">
                          Split between {expense.splitBetween.length} people
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-secondary-900">
                          ${expense.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-secondary-600">
                          ${(expense.amount / expense.splitBetween.length).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentRoom.members.map((member) => (
                  <div key={member.id} className="card">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900">{member.name}</h3>
                        <p className="text-sm text-secondary-600">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'balances' && (
            <motion.div
              key="balances"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentRoom.members.map((member) => {
                const balance = balances[member.id] || 0;
                return (
                  <div key={member.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-secondary-900">{member.name}</h3>
                          <p className="text-sm text-secondary-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-secondary-900'
                        }`}>
                          {balance > 0 ? '+' : ''}${balance.toFixed(2)}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {balance > 0 ? 'Owed to you' : balance < 0 ? 'You owe' : 'Settled up'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          room={currentRoom}
          onClose={() => setShowAddExpense(false)}
          onAdd={addExpense}
        />
      )}
    </div>
  );
};

// Add Expense Modal Component
const AddExpenseModal = ({ room, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitBetween: []
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.paidBy) newErrors.paidBy = 'Please select who paid';
    if (formData.splitBetween.length === 0) newErrors.splitBetween = 'Please select who to split with';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expense = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      paidBy: formData.paidBy,
      splitBetween: formData.splitBetween,
      createdAt: new Date().toISOString()
    };

    onAdd(room.id, expense);
    onClose();
  };

  const toggleMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter(id => id !== memberId)
        : [...prev.splitBetween, memberId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Add Expense
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="e.g., Groceries, Rent, Utilities"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Paid by
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value }))}
                className={`input-field ${errors.paidBy ? 'border-red-500' : ''}`}
              >
                <option value="">Select who paid</option>
                {room.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {errors.paidBy && (
                <p className="text-red-500 text-sm mt-1">{errors.paidBy}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Split between
              </label>
              <div className="space-y-2">
                {room.members.map(member => (
                  <label key={member.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.splitBetween.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-900">{member.name}</span>
                  </label>
                ))}
              </div>
              {errors.splitBetween && (
                <p className="text-red-500 text-sm mt-1">{errors.splitBetween}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Room;