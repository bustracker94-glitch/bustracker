import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchPage from './pages/SearchPage';
import BusesPage from './pages/BusesPage';
import TrackingPage from './pages/TrackingPage';
import { BusProvider } from './context/BusContext';

function App() {
  return (
    <BusProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/buses" element={<BusesPage />} />
          <Route path="/track/:busId" element={<TrackingPage />} />
        </Routes>
      </div>
    </BusProvider>
  );
}

export default App;