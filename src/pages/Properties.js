import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Building2,
  Home,
  Users
} from 'lucide-react';

const Properties = ({ properties, setProperties, tenants }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    monthlyRent: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const propertyData = {
      id: editingProperty ? editingProperty.id : Date.now().toString(),
      ...formData,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseFloat(formData.bathrooms),
      squareFeet: parseInt(formData.squareFeet),
      monthlyRent: parseFloat(formData.monthlyRent),
      createdAt: editingProperty ? editingProperty.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingProperty) {
      setProperties(properties.map(p => p.id === editingProperty.id ? propertyData : p));
    } else {
      setProperties([...properties, propertyData]);
    }

    setShowModal(false);
    setEditingProperty(null);
    setFormData({
      address: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      monthlyRent: '',
      notes: ''
    });
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      squareFeet: property.squareFeet.toString(),
      monthlyRent: property.monthlyRent.toString(),
      notes: property.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (propertyId) => {
    // Check if property has tenants
    const propertyTenants = tenants.filter(tenant => tenant.propertyId === propertyId);
    if (propertyTenants.length > 0) {
      alert('Cannot delete property with active tenants. Please remove tenants first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter(p => p.id !== propertyId));
    }
  };

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPropertyTenants = (propertyId) => {
    return tenants.filter(tenant => tenant.propertyId === propertyId);
  };

  const getOccupancyRate = (propertyId) => {
    const propertyTenants = getPropertyTenants(propertyId);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return 0;
    
    // Assuming 1 tenant per bedroom for occupancy calculation
    return Math.min((propertyTenants.length / property.bedrooms) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage your rental properties</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Property</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search properties by address, city, or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => {
          const propertyTenants = getPropertyTenants(property.id);
          const occupancyRate = getOccupancyRate(property.id);
          
          return (
            <div key={property.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{property.address}</h3>
                  <p className="text-sm text-gray-600">{property.city}, {property.state} {property.zipCode}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(property)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 size={16} />
                  <span>{property.propertyType}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Home size={16} />
                    <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
                  </div>
                  <div className="text-gray-600">
                    {property.squareFeet} sq ft
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    ${property.monthlyRent}/month
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    occupancyRate >= 100 
                      ? 'bg-red-100 text-red-800'
                      : occupancyRate >= 80
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {occupancyRate.toFixed(0)}% occupied
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{propertyTenants.length} tenant(s)</span>
                </div>

                {propertyTenants.length > 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-medium mb-1">Current Tenants:</p>
                    {propertyTenants.map(tenant => (
                      <p key={tenant.id} className="text-xs">
                        {tenant.name} - ${tenant.rentAmount}/month
                      </p>
                    ))}
                  </div>
                )}

                {property.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {property.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found</p>
          <p className="text-gray-400 mt-2">Add your first property to get started</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    required
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select property type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sq Ft
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.squareFeet}
                      onChange={(e) => setFormData({...formData, squareFeet: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProperty(null);
                      setFormData({
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        propertyType: '',
                        bedrooms: '',
                        bathrooms: '',
                        squareFeet: '',
                        monthlyRent: '',
                        notes: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingProperty ? 'Update Property' : 'Add Property'}
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

export default Properties;