import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Car, User, Edit2, Trash2, Link2, ChevronDown} from 'lucide-react';

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

const TemporaryAccessManagement = ({ generalInfo }) => {
    const navigate = useNavigate();
    const [accessEntries, setAccessEntries] = useState([]);
    
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_DOMAIN}/api/temporary-access/`, {
          headers: {
            'Authorization': `JWT ${generalInfo.authToken}`
          }
        })
          .then(response => response.json())
          .then(data => {
            const formattedData = data.map(entry => ({
              ...entry,
              valid_from: new Date(entry.valid_from),
              valid_until: new Date(entry.valid_until)
            }));
            setAccessEntries(formattedData);
          })
          .catch(err => console.error(err));
    }, [generalInfo]);

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

    function deleteTemporaryAccess(tempAccess) {  
      fetch(`${process.env.REACT_APP_API_DOMAIN}/api/temporary-access/${tempAccess.link}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `JWT ${generalInfo.authToken}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAccessEntries(accessEntries.filter(entry => entry.link !== tempAccess.link));
      })
      .catch(err => console.error(err));
    }

    return (
      <div className="h-full flex-1 overflow-y-auto bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto mt-0 mb-0 md:mt-4 md:mb-4 bg-gray-800/30 backdrop-blur rounded-lg border border-transparent md:border-gray-700 shadow-xl p-4">
          <h1 className="text-3xl font-bold text-white text-center mb-2 mt-8">
            Dočasný prístup
          </h1>
          <p className="text-gray-400 text-center mb-12">
              Spravujte dočasné prístupové povolenia pre návštevníkov
          </p>
          
          {/* Create Access Button */}
          <button 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white 
                      flex items-center justify-center p-4 rounded-lg mb-4 
                      transition-colors text-lg font-bold"
            onClick={() => navigate('/temp-access/create') }
          >
            <Plus className="mr-2" /> Vytvoriť dočasný prístup
          </button>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="relative">
              <select 
                className="w-full bg-gray-800 text-white p-2 rounded-lg appearance-none text-base"
                value={filters.accessType}
                onChange={(e) => setFilters({...filters, accessType: e.target.value})}
              >
                <option value="All">Všetky typy</option>
                <option value="link">Link</option>
                <option value="ecv">ŠPZ</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>

            <div className="relative">
              <select 
                className="w-full bg-gray-800 text-white p-2 rounded-lg appearance-none text-base"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="All">Všetky stavy</option>
                <option value="Active">Aktívne</option>
                <option value="Expired">Vypršané</option>
                <option value="Pending">Čakajúce</option>
                <option value="Revoked">Zrušené</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Access Entries List */}
          <div className="overflow-y-auto space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
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
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/guest/${entry.link}`)}
                          title={`${window.location.origin}/guest/${entry.link}`}
                          className="flex items-center text-xl font-bold text-white gap-1 hover:bg-green-600/20 p-2 -m-2 rounded-lg transition-colors"
                        >
                          <Link2 className="mr-2 text-green-400" />
                          {entry.link}
                        </button>
                      </>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.status === 'Active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {entry.status === 'Active' ? 'Aktívne' : entry.status === 'Expired' ? 'Vypršané' : entry.status === 'Pending' ? 'Čakajúce' : 'Zrušené'}
                  </span>
                </div>

                <div className="text-sm text-gray-400 mb-3">
                  Platné: {formatDate(entry.valid_from)} – {formatDate(entry.valid_until)}
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
                    <button className="text-red-400 hover:bg-red-600/20 p-2 rounded-lg"
                            onClick={() => deleteTemporaryAccess(entry)}>
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