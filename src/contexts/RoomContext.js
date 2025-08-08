import React, { createContext, useContext, useState, useEffect } from 'react';

const RoomContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved rooms from localStorage
    const savedRooms = localStorage.getItem('roomtab_rooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  }, []);

  useEffect(() => {
    // Save rooms to localStorage whenever rooms change
    localStorage.setItem('roomtab_rooms', JSON.stringify(rooms));
  }, [rooms]);

  const createRoom = (roomData) => {
    const newRoom = {
      id: Date.now().toString(),
      ...roomData,
      createdAt: new Date().toISOString(),
      members: roomData.members || [],
      expenses: roomData.expenses || [],
    };
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  };

  const joinRoom = (roomId, user) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const isAlreadyMember = room.members.some(member => member.id === user.id);
        if (!isAlreadyMember) {
          return {
            ...room,
            members: [...room.members, user]
          };
        }
      }
      return room;
    }));
  };

  const addExpense = (roomId, expense) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      createdAt: new Date().toISOString(),
    };

    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          expenses: [...room.expenses, newExpense]
        };
      }
      return room;
    }));

    if (currentRoom?.id === roomId) {
      setCurrentRoom(prev => ({
        ...prev,
        expenses: [...prev.expenses, newExpense]
      }));
    }
  };

  const updateExpense = (roomId, expenseId, updates) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          expenses: room.expenses.map(expense => 
            expense.id === expenseId ? { ...expense, ...updates } : expense
          )
        };
      }
      return room;
    }));

    if (currentRoom?.id === roomId) {
      setCurrentRoom(prev => ({
        ...prev,
        expenses: prev.expenses.map(expense => 
          expense.id === expenseId ? { ...expense, ...updates } : expense
        )
      }));
    }
  };

  const deleteExpense = (roomId, expenseId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          expenses: room.expenses.filter(expense => expense.id !== expenseId)
        };
      }
      return room;
    }));

    if (currentRoom?.id === roomId) {
      setCurrentRoom(prev => ({
        ...prev,
        expenses: prev.expenses.filter(expense => expense.id !== expenseId)
      }));
    }
  };

  const getRoomById = (roomId) => {
    return rooms.find(room => room.id === roomId);
  };

  const value = {
    rooms,
    currentRoom,
    setCurrentRoom,
    loading,
    setLoading,
    createRoom,
    joinRoom,
    addExpense,
    updateExpense,
    deleteExpense,
    getRoomById,
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};