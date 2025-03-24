import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Clock, ChevronLeft, ChevronRight, Car, User, Lock } from 'lucide-react';

const HistoryPage = ({ onLogOut, gateStateDisplay, sendTrigger, generalInfo }) => {
  const [activeTab, setActiveTab] = useState('triggers');
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAdmin = generalInfo?.user?.is_admin;

  const GATE_STATES = {
    'open_p': 'Otvorené pre chodcov',
    'open_v': 'Otvorené pre vozidlo',
    'closed': 'Zatvorené',
    'not_closed': 'Nie je zatvorené',
    'opening_p': 'Otvára sa pre chodcov',
    'opening_v': 'Otvára sa pre vozidlo',
    'closing': 'Zatvára sa',
    'unknown': 'Neznámy',
  }

  useEffect(() => {
    if (generalInfo?.authToken) {
      fetchData(activeTab, 1);
    }
  }, [activeTab, generalInfo?.authToken]);

  const fetchData = (type, page) => {
    setLoading(true);
    const endpoint = type === 'triggers' 
      ? `/api/triggers/?page=${page}`
      : `/api/states/?page=${page}`;
      
    fetch(`${process.env.REACT_APP_API_DOMAIN}${endpoint}`, {
      headers: {
        'Authorization': `JWT ${generalInfo.authToken}`
      }
    })
    .then(response => response.json())
    .then(data => {
      setData(data.results || []);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
        page: page
      });
      console.log(data);
      setLoading(false);
    })
    .catch(error => {
      console.error(`Error fetching ${type}:`, error);
      setLoading(false);
    });
  };

  const handlePageChange = (newPage) => {
    console.log(newPage);
    fetchData(activeTab, newPage);
  };

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  // Extract page number from URL
  const getPageFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  return (
    <div className="h-full flex-1 overflow-y-auto bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto mt-0 mb-0 md:mt-4 md:mb-4 bg-gray-800/30 backdrop-blur rounded-lg border border-transparent md:border-gray-700 shadow-xl p-4">
        <h1 className="text-3xl font-bold text-white text-center mb-2 mt-8">
          História záznamov
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Zobrazenie histórie spúšťačov a stavov systému
        </p>

        {/* Tab Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-1 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('triggers')}
              className={`py-2 px-4 rounded-md transition-colors ${
                activeTab === 'triggers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <List className="w-4 h-4" />
                <span>História spúšťačov</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('states')}
              className={`py-2 px-4 rounded-md transition-colors ${
                activeTab === 'states'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50'
              } ${!isAdmin && 'opacity-50 cursor-not-allowed'}`}
              disabled={!isAdmin}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>História stavov</span>
                {!isAdmin && <span className="text-xs">(Len pre administrátorov)</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">Dátum a čas</th>
                {activeTab === 'triggers' ? (
                  <>
                    <th className="px-6 py-3">Typ otvorenia</th>
                    <th className="px-6 py-3 rounded-tr-lg">Používateľ</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3">Stav</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">Načítavam...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">Žiadne dostupné údaje</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700/30 bg-gray-800/20 hover:bg-gray-700/20">
                    <td className="px-6 py-4">{formatTimestamp(item.timestamp)}</td>
                    {activeTab === 'triggers' ? (
                      <>
                        <td className="px-6 py-4">
                          <span className={
                            item.trigger_type === 'start_v' 
                              ? 'text-blue-400' 
                              : item.trigger_type === 'start_p'
                                ? 'text-green-400'
                                : 'text-gray-400'
                          }>
                            {item.trigger_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{item.username || 'Systém'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <span className={`${
                            item.gate_state?.includes('open_p') 
                              ? 'text-green-400' 
                              : item.gate_state?.includes('open_v')
                                ? 'text-blue-400'
                                : item.gate_state === 'closed'
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                          } flex items-center gap-2`}>{
                            item.gate_state?.includes('open_p') 
                            ? <Car className="w-4 h-4" /> 
                            : item.gate_state?.includes('open_v')
                              ? <User className="w-4 h-4" />
                              : item.gate_state === 'closed'
                                ? <Lock className="w-4 h-4" />
                                : 
                                <span className="w-4 h-4 bg-gray-600/20 rounded-full"></span>
                            }
                            {GATE_STATES[item.gate_state] || item.gate_state}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            {pagination.count > 0 ? (
              <span>
                Zobrazujem {(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.count)} z {pagination.count} záznamov
              </span>
            ) : (
              <span>Žiadne záznamy</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.previous && handlePageChange(getPageFromUrl(pagination.previous))}
              disabled={!pagination.previous}
              className={`p-2 rounded-lg ${
                pagination.previous 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 bg-gray-800 rounded-lg text-sm">
              Strana {pagination.page}
            </span>
            <button
              onClick={() => pagination.next && handlePageChange(getPageFromUrl(pagination.next))}
              disabled={!pagination.next}
              className={`p-2 rounded-lg ${
                pagination.next 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
