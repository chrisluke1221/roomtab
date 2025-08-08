import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowLeft,
  Search,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';

const JoinRoom = () => {
  const { user } = useAuth();
  const { rooms, joinRoom, getRoomById } = useRoom();
  const navigate = useNavigate();
  
  const [roomCode, setRoomCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedRoomId, setCopiedRoomId] = useState('');

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Find room by ID or name
      const room = getRoomById(roomCode) || 
                   rooms.find(r => r.name.toLowerCase().includes(roomCode.toLowerCase()));
      
      if (!room) {
        setError('Room not found. Please check the room code and try again.');
        return;
      }
      
      // Check if user is already a member
      const isAlreadyMember = room.members.some(member => 
        member.email === user?.email || member.id === user?.id
      );
      
      if (isAlreadyMember) {
        setError('You are already a member of this room.');
        return;
      }
      
      // Join the room
      joinRoom(room.id, {
        id: user?.id || Date.now().toString(),
        name: user?.name || 'New Member',
        email: user?.email || 'newmember@example.com'
      });
      
      setSuccess('Successfully joined the room!');
      
      // Navigate to the room after a short delay
      setTimeout(() => {
        navigate(`/room/${room.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRoomId = (roomId) => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(''), 2000);
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Join a Room
          </h1>
          <p className="text-secondary-600">
            Join an existing room to start managing shared expenses with friends.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Join by Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">
              Join with Room Code
            </h2>
            
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-secondary-900 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code or name"
                  className="input-field"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Join Room</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Your Rooms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">
              Your Rooms
            </h2>
            
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600 mb-4">
                  You haven't joined any rooms yet.
                </p>
                <button
                  onClick={() => navigate('/create-room')}
                  className="btn-primary"
                >
                  Create Your First Room
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                {/* Rooms List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900">{room.name}</h3>
                        <p className="text-sm text-secondary-600">
                          {room.members.length} members • {room.expenses.length} expenses
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyRoomId(room.id)}
                          className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
                          title="Copy room code"
                        >
                          {copiedRoomId === room.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/room/${room.id}`)}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRooms.length === 0 && searchTerm && (
                  <div className="text-center py-4">
                    <p className="text-secondary-600">No rooms found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card mt-8"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">
            How to join a room
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Room Code</h4>
              <p className="text-sm text-secondary-600">
                Ask the room creator for the room code. This is usually a unique identifier 
                that you can use to join the room.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Room Name</h4>
              <p className="text-sm text-secondary-600">
                You can also search for rooms by name if you know what the room is called. 
                This works for rooms you have access to.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinRoom;