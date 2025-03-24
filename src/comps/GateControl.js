import React, { useState, useEffect } from 'react';
import { Car, UserCircle2, Lock, Infinity, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const GateControlApp = ({ gateStateDisplay, sendTrigger, onLogOut, generalInfo }) => {
    const [actionFeedback, setActionFeedback] = useState(null);
    const [parkingStats, setParkingStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (generalInfo?.authToken) {
            fetchParkingStats();
        }
    }, [generalInfo?.authToken]);

    const fetchParkingStats = () => {
        fetch(`${process.env.REACT_APP_API_DOMAIN}/api/parking/statistics/`, {
            headers: {
                'Authorization': `JWT ${generalInfo.authToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setParkingStats(data);
                setLoadingStats(false);
            })
            .catch(err => {
                console.error('Error fetching parking statistics:', err);
                setLoadingStats(false);
            });
    };

    const handleTriggerAction = (action) => {
        // Show feedback for the action
        setActionFeedback({ type: action, status: 'pending' });
        
        sendTrigger(action);
        
        // Update the feedback to success after a short delay
        setTimeout(() => {
            setActionFeedback({ type: action, status: 'success' });
            
            // Clear the feedback after showing it briefly
            setTimeout(() => {
                setActionFeedback(null);
            }, 2000);
        }, 1000);
    };
    
    const getGateStateColor = () => {
        if (!gateStateDisplay) return 'bg-gray-600';
        
        if (gateStateDisplay.includes('Otvoren')) return 'bg-green-600';
        if (gateStateDisplay.includes('Zatvor')) return 'bg-red-600';
        if (gateStateDisplay.includes('Otv')) return 'bg-blue-600';
        if (gateStateDisplay.includes('Zatv')) return 'bg-yellow-600';
        return 'bg-gray-600';
    };

    // Get the capacity status
    const getCapacityStatus = () => {
        if (!parkingStats) return { text: 'Načítavam...', color: 'bg-gray-600' };
        
        const percentage = (parkingStats.current_parked / 20) * 100;
        
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
        <div className="h-full flex-1 overflow-y-auto bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
            {/* Main Content */}
            <main className="container mx-auto p-4 max-w-lg">
                {/* Action feedback toast */}
                {actionFeedback && (
                    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center
                        ${actionFeedback.status === 'pending' ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {actionFeedback.status === 'pending' ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                                <span>Spracúva sa {
                                    actionFeedback.type === 'start_v' ? 'otvorenie pre vozidlá' :
                                    actionFeedback.type === 'start_p' ? 'otvorenie pre chodcov' : 
                                    'zatvorenie brány'
                                }...</span>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                <span>Akcia dokončená</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Enhanced Gate Status Card */}
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-4">
                    <h2 className="text-lg font-semibold mb-3 text-center">Stav Brány</h2>
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center mb-4">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getGateStateColor()}`}></div>
                            <span className="text-2xl font-medium">{gateStateDisplay || 'Neznámy'}</span>
                        </div>
                    </div>
                </div>

                {/* Gate Control Buttons */}
                <div className="space-y-4">
                    {/* Vehicle access button */}
                    <button
                        onClick={() => generalInfo?.user?.can_open_vehicle && handleTriggerAction('start_v')}
                        className={`w-full relative bg-gray-800/70 backdrop-blur border border-gray-700 rounded-lg overflow-hidden group
                            hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-300 p-6 flex items-center justify-between
                            ${!generalInfo?.user?.can_open_vehicle ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/10'}`}
                        disabled={!generalInfo?.user?.can_open_vehicle}
                    >
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-600/20 text-blue-400 mr-4">
                                <Car className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="text-lg font-semibold block">Otvoriť Bránu</span>
                                <span className="text-sm text-gray-400">Pre vozidlá</span>
                            </div>
                        </div>
                        {!generalInfo?.user?.can_open_vehicle && <Lock className="w-5 h-5 text-gray-400" />}
                    </button>

                    {/* Pedestrian access button */}
                    <button
                        onClick={() => generalInfo?.user?.can_open_pedestrian && handleTriggerAction('start_p')}
                        className={`w-full relative bg-gray-800/70 backdrop-blur border border-gray-700 rounded-lg overflow-hidden group
                            hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-300 p-6 flex items-center justify-between
                            ${!generalInfo?.user?.can_open_pedestrian ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-green-500/10'}`}
                        disabled={!generalInfo?.user?.can_open_pedestrian}
                    >
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-600/20 text-green-400 mr-4">
                                <UserCircle2 className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="text-lg font-semibold block">Otvoriť Bránu</span>
                                <span className="text-sm text-gray-400">Pre chodcov</span>
                            </div>
                        </div>
                        {!generalInfo?.user?.can_open_pedestrian && <Lock className="w-5 h-5 text-gray-400" />}
                    </button>
                </div>
                
                {/* Parking Overview Quick Summary */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Car className="w-5 h-5 mr-2" />
                            Stav parkoviska
                        </h3>
                        <Link to="/parking" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                            <span className="mr-1">Podrobný prehľad</span>
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                    
                    {loadingStats ? (
                        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-8 flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${capacityStatus.color} mr-2`}></div>
                                    <span className="font-medium">{capacityStatus.text}</span>
                                </div>
                                <div className="text-xl font-bold">
                                    {parkingStats?.current_parked || 0} <span className="text-gray-400 text-sm">/ 20</span>
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-700 h-2 rounded-full mt-3">
                                <div 
                                    className={`${capacityStatus.color} h-2 rounded-full transition-all duration-500`} 
                                    style={{ width: `${Math.min(100, ((parkingStats?.current_parked || 0) / 20) * 100)}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex justify-between mt-4 text-sm">
                                <span className="text-gray-400">Obsadenosť {Math.round((parkingStats?.current_parked || 0) / 20 * 100)}%</span>
                                <span class="text-gray-400">Dnes návštev: {parkingStats?.daily_stats && Object.values(parkingStats.daily_stats).pop() || 0}</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GateControlApp;