import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  Users,
  Building2
} from 'lucide-react';

const Bills = ({ bills, setBills, tenants, properties }) => {
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    billType: 'rent',
    amount: '',
    dueDate: '',
    description: '',
    notes: ''
  });

  const [generateFormData, setGenerateFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    includeUtilities: false,
    utilitiesAmount: 0,
    includeLateFees: false,
    lateFeeAmount: 0
  });

  const billTypes = [
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'late_fee', label: 'Late Fee' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const billData = {
      id: editingBill ? editingBill.id : Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount),
      paid: editingBill ? editingBill.paid : false,
      paidDate: editingBill ? editingBill.paidDate : null,
      createdAt: editingBill ? editingBill.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingBill) {
      setBills(bills.map(b => b.id === editingBill.id ? billData : b));
    } else {
      setBills([...bills, billData]);
    }

    setShowModal(false);
    setEditingBill(null);
    setFormData({
      tenantId: '',
      propertyId: '',
      billType: 'rent',
      amount: '',
      dueDate: '',
      description: '',
      notes: ''
    });
  };

  const handleGenerateBills = (e) => {
    e.preventDefault();
    
    const { month, year, includeUtilities, utilitiesAmount, includeLateFees, lateFeeAmount } = generateFormData;
    
    // Get all tenants who have moved in by the end of the previous month
    const eligibleTenants = tenants.filter(tenant => {
      const moveInDate = new Date(tenant.moveInDate);
      const billDate = new Date(year, month - 1, 1); // First day of the month
      return moveInDate <= billDate;
    });

    const newBills = eligibleTenants.map(tenant => {
      const property = properties.find(p => p.id === tenant.propertyId);
      const dueDate = new Date(year, month, 1); // First day of the month
      
      const bills = [];
      
      // Add rent bill
      bills.push({
        id: Date.now() + Math.random(),
        tenantId: tenant.id,
        propertyId: tenant.propertyId,
        billType: 'rent',
        amount: tenant.rentAmount,
        dueDate: dueDate.toISOString(),
        description: `Rent for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        paid: false,
        paidDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Add utilities if enabled
      if (includeUtilities && utilitiesAmount > 0) {
        bills.push({
          id: Date.now() + Math.random() + 1,
          tenantId: tenant.id,
          propertyId: tenant.propertyId,
          billType: 'utilities',
          amount: parseFloat(utilitiesAmount),
          dueDate: dueDate.toISOString(),
          description: `Utilities for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          paid: false,
          paidDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Add late fees if enabled and there are overdue bills
      if (includeLateFees && lateFeeAmount > 0) {
        const overdueBills = bills.filter(bill => {
          const dueDate = new Date(bill.dueDate);
          const today = new Date();
          return dueDate < today && !bill.paid;
        });

        if (overdueBills.length > 0) {
          bills.push({
            id: Date.now() + Math.random() + 2,
            tenantId: tenant.id,
            propertyId: tenant.propertyId,
            billType: 'late_fee',
            amount: parseFloat(lateFeeAmount),
            dueDate: dueDate.toISOString(),
            description: 'Late fee for overdue payments',
            paid: false,
            paidDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      return bills;
    }).flat();

    // Check for existing bills to avoid duplicates
    const existingBillKeys = bills.map(bill => 
      `${bill.tenantId}-${bill.billType}-${new Date(bill.dueDate).getMonth()}-${new Date(bill.dueDate).getFullYear()}`
    );

    const newBillsFiltered = newBills.filter(bill => {
      const billKey = `${bill.tenantId}-${bill.billType}-${new Date(bill.dueDate).getMonth()}-${new Date(bill.dueDate).getFullYear()}`;
      return !existingBillKeys.includes(billKey);
    });

    setBills([...bills, ...newBillsFiltered]);
    setShowGenerateModal(false);
    setGenerateFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      includeUtilities: false,
      utilitiesAmount: 0,
      includeLateFees: false,
      lateFeeAmount: 0
    });
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      tenantId: bill.tenantId,
      propertyId: bill.propertyId,
      billType: bill.billType,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate.split('T')[0],
      description: bill.description,
      notes: bill.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      setBills(bills.filter(b => b.id !== billId));
    }
  };

  const handleMarkAsPaid = (billId) => {
    setBills(bills.map(bill => 
      bill.id === billId 
        ? { ...bill, paid: true, paidDate: new Date().toISOString() }
        : bill
    ));
  };

  const handleMarkAsUnpaid = (billId) => {
    setBills(bills.map(bill => 
      bill.id === billId 
        ? { ...bill, paid: false, paidDate: null }
        : bill
    ));
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      tenants.find(t => t.id === bill.tenantId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      properties.find(p => p.id === bill.propertyId)?.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'paid' && bill.paid) ||
      (filterStatus === 'unpaid' && !bill.paid) ||
      (filterStatus === 'overdue' && !bill.paid && new Date(bill.dueDate) < new Date());

    return matchesSearch && matchesFilter;
  });

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = bills.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;
  const overdueBills = bills.filter(bill => !bill.paid && new Date(bill.dueDate) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
          <p className="text-gray-600 mt-2">Manage and generate bills for your tenants</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Calendar size={20} />
            <span>Generate Bills</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900">${paidAmount.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unpaid Amount</p>
              <p className="text-2xl font-bold text-gray-900">${unpaidAmount.toLocaleString()}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Bills</p>
              <p className="text-2xl font-bold text-gray-900">{overdueBills.length}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search bills by tenant, description, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Bills</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => {
                const tenant = tenants.find(t => t.id === bill.tenantId);
                const property = properties.find(p => p.id === bill.propertyId);
                const isOverdue = !bill.paid && new Date(bill.dueDate) < new Date();
                
                return (
                  <tr key={bill.id} className={isOverdue ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant?.name}</div>
                      <div className="text-sm text-gray-500">{tenant?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property?.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.billType === 'rent' ? 'bg-blue-100 text-blue-800' :
                        bill.billType === 'utilities' ? 'bg-green-100 text-green-800' :
                        bill.billType === 'late_fee' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {billTypes.find(t => t.value === bill.billType)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${bill.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.paid 
                          ? 'bg-green-100 text-green-800'
                          : isOverdue
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.paid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {bill.paid ? (
                          <button
                            onClick={() => handleMarkAsUnpaid(bill.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Mark Unpaid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsPaid(bill.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(bill)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No bills found</p>
          <p className="text-gray-400 mt-2">Generate bills or add a new bill to get started</p>
        </div>
      )}

      {/* Add/Edit Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingBill ? 'Edit Bill' : 'Add New Bill'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant *
                  </label>
                  <select
                    required
                    value={formData.tenantId}
                    onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {properties.find(p => p.id === tenant.propertyId)?.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property *
                  </label>
                  <select
                    required
                    value={formData.propertyId}
                    onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Type *
                  </label>
                  <select
                    required
                    value={formData.billType}
                    onChange={(e) => setFormData({...formData, billType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {billTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBill(null);
                      setFormData({
                        tenantId: '',
                        propertyId: '',
                        billType: 'rent',
                        amount: '',
                        dueDate: '',
                        description: '',
                        notes: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingBill ? 'Update Bill' : 'Add Bill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bills Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Bills</h2>
              <p className="text-sm text-gray-600 mb-4">
                Automatically generate bills for all eligible tenants based on their move-in dates.
              </p>
              
              <form onSubmit={handleGenerateBills} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month *
                    </label>
                    <select
                      required
                      value={generateFormData.month}
                      onChange={(e) => setGenerateFormData({...generateFormData, month: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2030"
                      value={generateFormData.year}
                      onChange={(e) => setGenerateFormData({...generateFormData, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeUtilities"
                      checked={generateFormData.includeUtilities}
                      onChange={(e) => setGenerateFormData({...generateFormData, includeUtilities: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeUtilities" className="ml-2 block text-sm text-gray-900">
                      Include utilities
                    </label>
                  </div>

                  {generateFormData.includeUtilities && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utilities Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={generateFormData.utilitiesAmount}
                        onChange={(e) => setGenerateFormData({...generateFormData, utilitiesAmount: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeLateFees"
                      checked={generateFormData.includeLateFees}
                      onChange={(e) => setGenerateFormData({...generateFormData, includeLateFees: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeLateFees" className="ml-2 block text-sm text-gray-900">
                      Include late fees for overdue bills
                    </label>
                  </div>

                  {generateFormData.includeLateFees && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Late Fee Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={generateFormData.lateFeeAmount}
                        onChange={(e) => setGenerateFormData({...generateFormData, lateFeeAmount: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate Bills
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;