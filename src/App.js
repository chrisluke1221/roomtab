import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Bills from './pages/Bills';
import Properties from './pages/Properties';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bills, setBills] = useState([]);

  // Load data from localStorage on app start
  useEffect(() => {
    const savedTenants = localStorage.getItem('landlord-tenants');
    const savedProperties = localStorage.getItem('landlord-properties');
    const savedBills = localStorage.getItem('landlord-bills');

    if (savedTenants) setTenants(JSON.parse(savedTenants));
    if (savedProperties) setProperties(JSON.parse(savedProperties));
    if (savedBills) setBills(JSON.parse(savedBills));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('landlord-tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('landlord-properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('landlord-bills', JSON.stringify(bills));
  }, [bills]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  tenants={tenants}
                  properties={properties}
                  bills={bills}
                />
              } 
            />
            <Route 
              path="/tenants" 
              element={
                <Tenants 
                  tenants={tenants}
                  setTenants={setTenants}
                  properties={properties}
                />
              } 
            />
            <Route 
              path="/properties" 
              element={
                <Properties 
                  properties={properties}
                  setProperties={setProperties}
                />
              } 
            />
            <Route 
              path="/bills" 
              element={
                <Bills 
                  bills={bills}
                  setBills={setBills}
                  tenants={tenants}
                  properties={properties}
                />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;