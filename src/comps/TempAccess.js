import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Car, User, Edit2, Trash2, Link2, ChevronDown, Copy } from 'lucide-react';
import Header from './Header';

const formatDate = (date) => {
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const TemporaryAccessManagement = ({ onLogOut, gateStateDisplay, sendTrigger, generalInfo }) => {
    const navigate = useNavigate();
    const [accessEntries, setAccessEntries] = useState([
    {
      link: "L4fTeb4aD-bS4BjI",
      access_type: 'ecv',
      ecv: 'BT123AB',
      valid_from: new Date('2024-02-15T10:00'),
      valid_until: new Date('2024-02-20T18:00'),
      open_vehicle: 2,
      open_pedestrian: -1,
      status: 'Active'
    },
    /*{
        "access_type": "ecv",
        "link": "L4fTeb4aD-bS4BjI",
        "ecv": "TT350HO",
        "valid_from": "2024-07-10T00:00:00Z",
        "valid_until": "2025-07-10T23:59:59Z",
        "open_vehicle": -1,
        "open_pedestrian": -1,
        "close_gate": -1,
        "status": 'Active'
    }, */
    {
      link: 2,
      access_type: 'Link',
      link: 'L49HnA4DA84GUPXR',
      ecv: null,
      valid_from: new Date('2024-02-10T14:00'),
      valid_until: new Date('2024-02-16T12:00'),
      open_vehicle: 0,
      open_pedestrian: 2,
      status: 'Expired'
    }
  ]);

  const [filters, setFilters] = useState({
    accessType: 'All',
    status: 'All'
  });

  const filteredEntries = accessEntries.filter(entry => {
    const typeMatch = filters.accessType === 'All' || entry.access_type === filters.accessType;
    const statusMatch = filters.status === 'All' || entry.status === filters.status;
    return typeMatch && statusMatch;
  });

  function editTemporaryAccess(tempAccess) {
    navigate('/temp-access/edit', { state: { prefill: tempAccess } });
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white overflow-y-auto overflow-x-hidden">
      <Header onLogOut={onLogOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} generalInfo={generalInfo}/>
      <div className="max-w-2xl mx-auto mt-0 mb-0 md:mt-4 md:mb-4 bg-gray-800/30 backdrop-blur rounded-lg border border-transparent md:border-gray-700 shadow-xl p-4">
        <h1 className="text-3xl font-bold text-white text-center mb-2 mt-8">
          Temporary Access
        </h1>
        <p className="text-gray-400 text-center mb-12">
            Manage temporary access permissions for visitors
        </p>
        {/* Create Access Button */}
        <button 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white 
                     flex items-center justify-center p-4 rounded-lg mb-4 
                     transition-colors text-lg font-bold"
          onClick={() => navigate('/temp-access/create') }
        >
          <Plus className="mr-2" /> Create Temporary Access
        </button>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="relative">
            <select 
              className="w-full bg-gray-800 text-white p-2 rounded-lg appearance-none text-base"
              value={filters.accessType}
              onChange={(e) => setFilters({...filters, accessType: e.target.value})}
            >
              <option value="All">All Types</option>
              <option value="Link">Link</option>
              <option value="License Plate">License Plate</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 text-gray-400" />
          </div>

          <div className="relative">
            <select 
              className="w-full bg-gray-800 text-white p-2 rounded-lg appearance-none text-base"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Access Entries List */}
        <div className="space-y-4 overflow-y-auto">
          {filteredEntries.map(entry => (
            <div 
              key={entry.link} 
              className={`p-4 rounded-lg border ${
                entry.status === 'Active' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  {entry.access_type === 'ecv' ? (
                    <>
                      <Car className="mr-2 text-blue-400" />
                      {entry.ecv && (
                        <span className="text-xl font-bold text-white ml-1">{entry.ecv}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${entry.link}`)}
                        className="flex items-center text-xl font-bold text-white gap-1 hover:bg-green-600/20 p-2 -m-2 rounded-lg transition-colors"
                      >
                        <Link2 className="mr-2 text-green-400" />
                        Copy link
                      </button>
                    </>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  entry.status === 'Active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {entry.status}
                </span>
              </div>

              <div className="text-sm text-gray-400 mb-3">
                Valid: {formatDate(entry.valid_from)} – {formatDate(entry.valid_until)}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-2">
                  <button 
                    className={`p-2 rounded-lg flex items-center ${
                      entry.open_vehicle !== 0
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    <Car className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {entry.open_vehicle === -1 ? '∞' : `x${entry.open_vehicle}`}
                    </span>
                  </button>
                  <button 
                    className={`p-2 rounded-lg flex items-center ${
                      entry.open_pedestrian !== 0 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    <User className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {entry.open_pedestrian === -1 ? '∞' : `x${entry.open_pedestrian}`}
                    </span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button className="text-blue-400 hover:bg-blue-600/20 p-2 rounded-lg"
                          onClick={() => editTemporaryAccess(entry)}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-red-400 hover:bg-red-600/20 p-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemporaryAccessManagement;