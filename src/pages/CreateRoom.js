import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';

const CreateRoom = () => {
  const { user } = useAuth();
  const { createRoom } = useRoom();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    }
    
    if (formData.name.length > 50) {
      newErrors.name = 'Room name must be less than 50 characters';
    }
    
    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      return;
    }
    
    const member = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      email: newMember.email.trim()
    };
    
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, member]
    }));
    
    setNewMember({ name: '', email: '' });
  };

  const removeMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add current user as a member if not already included
      const allMembers = [...formData.members];
      if (!allMembers.find(member => member.email === user?.email)) {
        allMembers.push({
          id: 'current-user',
          name: user?.name || 'You',
          email: user?.email || 'current@user.com'
        });
      }
      
      const roomData = {
        ...formData,
        members: allMembers,
        createdBy: user?.id || 'current-user'
      };
      
      const newRoom = createRoom(roomData);
      
      // Navigate to the new room
      navigate(`/room/${newRoom.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setErrors({ submit: 'Failed to create room. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Create New Room
          </h1>
          <p className="text-secondary-600">
            Set up a new room to manage shared expenses with friends and roommates.
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-900 mb-2">
                Room Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Apartment 3B, Trip to Paris"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                maxLength={50}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description of the room or purpose"
                className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                rows={3}
                maxLength={200}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-secondary-500 text-sm mt-1">
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Members */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Add Members
              </label>
              
              {/* Add Member Form */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field flex-1"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="btn-primary px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Members List */}
              {formData.members.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary-900">
                    Members ({formData.members.length})
                  </p>
                  {formData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-secondary-900">{member.name}</p>
                        <p className="text-sm text-secondary-600">{member.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-secondary-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Create Room</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card mt-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">
            Tips for creating a great room
          </h3>
          <ul className="space-y-2 text-sm text-secondary-600">
            <li className="flex items-start space-x-2">
              <DollarSign className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Use a descriptive name that everyone will recognize</span>
            </li>
            <li className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Add all room members so everyone can track expenses</span>
            </li>
            <li className="flex items-start space-x-2">
              <DollarSign className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>You can always add or remove members later</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRoom;