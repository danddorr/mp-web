import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Clock, Calendar, AlertTriangle } from 'lucide-react';
import Header from './Header';

const ParkingOverview = ({ onLogOut, gateStateDisplay, sendTrigger, generalInfo }) => {
  const [statistics, setStatistics] = useState(null);
  const [parkedVehicles, setParkedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (generalInfo?.authToken) {
      fetchStatistics();
      fetchParkedVehicles();
    }
  }, [generalInfo?.authToken]);

  const fetchStatistics = () => {
    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/parking/statistics/`, {
      headers: {
        'Authorization': `JWT ${generalInfo.authToken}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setStatistics(data);
      })
      .catch(err => console.error('Error fetching statistics:', err));
  };

  const fetchParkedVehicles = () => {
    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/parking/`, {
      headers: {
        'Authorization': `JWT ${generalInfo.authToken}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setParkedVehicles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching parked vehicles:', err);
        setLoading(false);
      });
  };

  // Calculate how long a car has been parked
  const calculateDuration = (enteredAt) => {
    const entered = new Date(enteredAt);
    const now = new Date();
    const diffInMs = now - entered;
    
    const days = Math.floor(diffInMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffInMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffInMs % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get the capacity status
  const getCapacityStatus = () => {
    if (!statistics) return { text: 'Načítavam...', color: 'bg-gray-600' };
    
    const percentage = (statistics.current_parked / 20) * 100;
    
    if (percentage < 50) {
      return { text: 'Voľné', color: 'bg-green-600' };
    } else if (percentage < 90) {
      return { text: 'Obsadzujúce sa', color: 'bg-yellow-600' };
    } else {
      return { text: 'Takmer plné', color: 'bg-red-600' };
    }
  };

  const capacityStatus = getCapacityStatus();

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white overflow-y-auto overflow-x-hidden">
      <Header onLogOut={onLogOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} generalInfo={generalInfo} />
      
      <div className="max-w-4xl mx-auto mt-0 mb-0 md:mt-4 md:mb-4 bg-gray-800/30 backdrop-blur rounded-lg border border-transparent md:border-gray-700 shadow-xl p-4">
        <h1 className="text-3xl font-bold text-white text-center mb-2 mt-8">
          Prehľad parkoviska
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Aktuálny stav a štatistiky využitia parkoviska
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Current Parking Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 flex flex-col items-center">
                <Car className="w-12 h-12 mb-2 text-blue-400" />
                <h3 className="text-xl font-bold mb-1">Aktuálne vozidlá</h3>
                <div className="text-4xl font-bold text-white">
                  {statistics?.current_parked || 0}
                </div>
                <div className="text-sm text-gray-400 mt-2">z približnej kapacity 20 vozidiel</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full ${capacityStatus.color} mb-2`}></div>
                <h3 className="text-xl font-bold mb-1">Stav</h3>
                <div className="text-2xl font-bold text-white">
                  {capacityStatus.text}
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
                  <div 
                    className={`${capacityStatus.color} h-2 rounded-full`} 
                    style={{ width: `${Math.min(100, (statistics?.current_parked || 0) / 20 * 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400 mt-2">obsadenosť {Math.round((statistics?.current_parked || 0) / 20 * 100)}%</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 flex flex-col items-center">
                <Clock className="w-12 h-12 mb-2 text-purple-400" />
                <h3 className="text-xl font-bold mb-1">Dnes navštívené</h3>
                <div className="text-4xl font-bold text-white">
                  {statistics?.daily_stats && Object.values(statistics.daily_stats).pop()}
                </div>
                <div className="text-sm text-gray-400 mt-2">vozidiel celkovo</div>
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Týždenná štatistika
              </h3>
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
                <div className="h-32">
                  {statistics?.daily_stats && (
                    <div className="flex h-full items-end justify-between">
                      {Object.entries(statistics.daily_stats).map(([date, count], index) => {
                        const formattedDate = new Date(date).toLocaleDateString('sk-SK', { weekday: 'short', day: 'numeric' });
                        const maxValue = Math.max(...Object.values(statistics.daily_stats));
                        const percentage = maxValue === 0 ? 0 : (count / maxValue) * 100;
                        
                        return (
                          <div key={date} className="flex flex-col justify-end items-center flex-1 mx-1 h-full">
                            <div className="w-[50%] px-1 h-full flex flex-col justify-end">
                              <div 
                                className="bg-blue-600 hover:bg-blue-500 transition-all rounded-t-sm w-full" 
                                style={{ 
                                  height: count === 0 ? '2px' : `${Math.max(percentage, 10)}%`,
                                  minHeight: count > 0 ? '8px' : '2px'
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">{formattedDate}</div>
                            <div className="text-sm font-bold">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Currently Parked Vehicles */}
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Zaparkované vozidlá
            </h3>
            
            {parkedVehicles.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">Aktuálne nie sú zaparkované žiadne vozidlá</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {parkedVehicles.map(vehicle => (
                  <div 
                    key={vehicle.id}
                    className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-3 flex flex-col items-center"
                  >
                    <span className="font-mono font-bold text-lg mb-1">{vehicle.ecv}</span>
                    <div className="text-sm text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {calculateDuration(vehicle.entered_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {parkedVehicles.length > 0 && parkedVehicles.length >= 10 && (
              <div className="mt-4 bg-yellow-600/20 border border-yellow-700/50 text-yellow-400 px-4 py-3 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>Parkovisko sa zapĺňa. Aktuálne obsadené na {Math.round((parkedVehicles.length / 20) * 100)}%.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParkingOverview;
