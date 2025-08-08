import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building2
} from 'lucide-react';

const Tenants = ({ tenants, setTenants, properties }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    moveInDate: '',
    rentAmount: '',
    depositAmount: '',
    leaseEndDate: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tenantData = {
      id: editingTenant ? editingTenant.id : Date.now().toString(),
      ...formData,
      rentAmount: parseFloat(formData.rentAmount),
      depositAmount: parseFloat(formData.depositAmount),
      createdAt: editingTenant ? editingTenant.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingTenant) {
      setTenants(tenants.map(t => t.id === editingTenant.id ? tenantData : t));
    } else {
      setTenants([...tenants, tenantData]);
    }

    setShowModal(false);
    setEditingTenant(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      propertyId: '',
      moveInDate: '',
      rentAmount: '',
      depositAmount: '',
      leaseEndDate: '',
      notes: ''
    });
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      propertyId: tenant.propertyId,
      moveInDate: tenant.moveInDate,
      rentAmount: tenant.rentAmount.toString(),
      depositAmount: tenant.depositAmount.toString(),
      leaseEndDate: tenant.leaseEndDate,
      notes: tenant.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      setTenants(tenants.filter(t => t.id !== tenantId));
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    properties.find(p => p.id === tenant.propertyId)?.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysSinceMoveIn = (moveInDate) => {
    const moveIn = new Date(moveInDate);
    const today = new Date();
    const diffTime = today - moveIn;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilMoveIn = (moveInDate) => {
    const moveIn = new Date(moveInDate);
    const today = new Date();
    const diffTime = moveIn - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-2">Manage your tenants and their move-in dates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search tenants by name, email, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => {
          const property = properties.find(p => p.id === tenant.propertyId);
          const daysSinceMoveIn = getDaysSinceMoveIn(tenant.moveInDate);
          const daysUntilMoveIn = getDaysUntilMoveIn(tenant.moveInDate);
          const isMovedIn = daysSinceMoveIn >= 0;
          
          return (
            <div key={tenant.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-sm text-gray-600">{tenant.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tenant)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{tenant.phone}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 size={16} />
                  <span>{property?.address || 'No property assigned'}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Move-in: {new Date(tenant.moveInDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    ${tenant.rentAmount}/month
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isMovedIn 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isMovedIn 
                      ? `${daysSinceMoveIn} days since move-in`
                      : `${daysUntilMoveIn} days until move-in`
                    }
                  </span>
                </div>

                {tenant.leaseEndDate && (
                  <div className="text-sm text-gray-600">
                    Lease ends: {new Date(tenant.leaseEndDate).toLocaleDateString()}
                  </div>
                )}

                {tenant.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {tenant.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tenants found</p>
          <p className="text-gray-400 mt-2">Add your first tenant to get started</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                    Move-in Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rent Amount *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.rentAmount}
                      onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    value={formData.leaseEndDate}
                    onChange={(e) => setFormData({...formData, leaseEndDate: e.target.value})}
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
                      setEditingTenant(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        propertyId: '',
                        moveInDate: '',
                        rentAmount: '',
                        depositAmount: '',
                        leaseEndDate: '',
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
                    {editingTenant ? 'Update Tenant' : 'Add Tenant'}
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

export default Tenants;