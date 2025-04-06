import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, UserCircle2, Lock, Infinity, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';

const TempGateControl = ({ gateStateDisplay, sendTrigger }) => {
    const { accesslink } = useParams();
    const navigate = useNavigate();
    const [accessInfo, setAccessInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionFeedback, setActionFeedback] = useState(null);
    const [remainingTime, setRemainingTime] = useState(null);
    
    useEffect(() => {
        fetchAccessInfo();
        
        // Set up timer to refresh the access info every minute
        const intervalId = setInterval(fetchAccessInfo, 60000);
        return () => clearInterval(intervalId);
    }, [accesslink]);
    
    // Update countdown timer every second if access is about to expire
    useEffect(() => {
        if (!accessInfo.valid_until) return;
        
        const updateRemainingTime = () => {
            const now = new Date();
            const expiry = new Date(accessInfo.valid_until);
            const diff = expiry - now;
            
            // If less than 24 hours remaining, show countdown
            if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
                const hours = Math.floor(diff / (60 * 60 * 1000));
                const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
                setRemainingTime(`${hours}h ${minutes}m`);
            } else {
                setRemainingTime(null);
            }
        };
        
        updateRemainingTime();
        const timerId = setInterval(updateRemainingTime, 1000);
        return () => clearInterval(timerId);
    }, [accessInfo.valid_until]);
    
    const fetchAccessInfo = () => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_DOMAIN}/api/temporary-access/${accesslink}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid or expired access link');
            }
            return response.json();
        })
        .then(data => {
            setAccessInfo(data);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error:', error);
            navigate("/");
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
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };
    
    const getGateStateColor = () => {
        if (!gateStateDisplay) return 'bg-gray-600';
        
        if (gateStateDisplay.includes('Otvoren')) return 'bg-green-600';
        if (gateStateDisplay.includes('Zatvor')) return 'bg-red-600';
        if (gateStateDisplay.includes('Otv')) return 'bg-blue-600';
        if (gateStateDisplay.includes('Zatv')) return 'bg-yellow-600';
        return 'bg-gray-600';
    };

    const isActiveAccess = accessInfo.status === 'Active';

    if (loading) {
        return (
            <div className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 mb-4"></div>
                    <div className="h-7 w-48 bg-gray-700 rounded-lg mb-2"></div>
                    <div className="h-5 w-32 bg-gray-700 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">

            {/* Main Content */}
            <main className="container mx-auto p-4 max-w-lg">
                {/* Access Info Card */}
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-center">Dočasný Prístup</h2>
                    
                    {/* Status badge */}
                    <div className="flex justify-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${isActiveAccess ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'}`}>
                            {accessInfo.status === 'Active' ? 'Aktívny' : 
                             accessInfo.status === 'Expired' ? 'Vypršaný' : 
                             accessInfo.status === 'Revoked' ? 'Zrušený' : 'Neznámy stav'}
                        </span>
                    </div>
                    
                    {/* Validity period */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            <div>
                                <span className="block text-xs text-gray-400">Platné od</span>
                                {formatDate(accessInfo.valid_from)}
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                            <Clock className="w-4 h-4 mr-2 text-blue-400" />
                            <div>
                                <span className="block text-xs text-gray-400">Platné do</span>
                                {formatDate(accessInfo.valid_until)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Countdown if expiring soon */}
                    {remainingTime && isActiveAccess && (
                        <div className="bg-yellow-600/20 border border-yellow-700/50 text-yellow-400 px-3 py-2 rounded-lg flex items-center justify-center mb-4">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            <span>Prístup vyprší za {remainingTime}</span>
                        </div>
                    )}
                    
                    {/* Access type info */}
                    {accessInfo.ecv && (
                        <div className="bg-gray-700/50 px-4 py-3 rounded-lg mb-4">
                            <span className="text-xs text-gray-400 block">EČV Vozidla</span>
                            <span className="text-xl font-mono font-bold">{accessInfo.ecv}</span>
                        </div>
                    )}

                    {/* Show inactive message if not active */}
                    {!isActiveAccess && (
                        <div className="bg-red-600/20 border border-red-700/50 text-red-400 px-4 py-4 rounded-lg mt-4 flex flex-col items-center text-center">
                            <AlertOctagon className="w-8 h-8 mb-2" />
                            <h3 className="text-lg font-bold mb-1">Tento prístup už nie je aktívny</h3>
                            <p>Dočasný prístup vypršal alebo bol zrušený.</p>
                        </div>
                    )}
                </div>

                {/* Only show gate status and controls if access is active */}
                {isActiveAccess && (
                    <>
                        {/* Compact Gate Status Indicator */}
                        <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg px-4 py-3 mb-6">
                            <span className="text-sm text-gray-300">Stav brány:</span>
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${getGateStateColor()}`}></div>
                                <span className="font-medium">{gateStateDisplay || 'Neznámy'}</span>
                            </div>
                        </div>

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

                        {/* Gate Control Buttons */}
                        <div className="space-y-4">
                            {/* Vehicle access button */}
                            <button
                                onClick={() => {if (accessInfo.open_vehicle !== 0) handleTriggerAction('start_v')}}
                                className={`w-full relative bg-gray-800/70 backdrop-blur border border-gray-700 rounded-lg overflow-hidden group
                                    hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-300 p-6 flex items-center justify-between
                                    ${accessInfo.open_vehicle === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/10'}`}
                                disabled={accessInfo.open_vehicle === 0}
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
                                <div className="flex items-center space-x-2">
                                    {accessInfo.open_vehicle !== 0 && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-blue-600/20 text-blue-400`}>
                                            {accessInfo.open_vehicle === -1 ? <Infinity className="w-4 h-4" /> : accessInfo.open_vehicle}
                                        </span>
                                    )}
                                    {accessInfo.open_vehicle === 0 && <Lock className="w-5 h-5 text-gray-400" />}
                                </div>
                            </button>
                            
                            {/* Pedestrian access button */}
                            <button
                                onClick={() => {if (accessInfo.open_pedestrian !== 0) handleTriggerAction('start_p')}}
                                className={`w-full relative bg-gray-800/70 backdrop-blur border border-gray-700 rounded-lg overflow-hidden group
                                    hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-300 p-6 flex items-center justify-between
                                    ${accessInfo.open_pedestrian === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-green-500/10'}`}
                                disabled={accessInfo.open_pedestrian === 0}
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
                                <div className="flex items-center space-x-2">
                                    {accessInfo.open_pedestrian !== 0 && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-green-600/20 text-green-400`}>
                                            {accessInfo.open_pedestrian === -1 ? <Infinity className="w-4 h-4" /> : accessInfo.open_pedestrian}
                                        </span>
                                    )}
                                    {accessInfo.open_pedestrian === 0 && <Lock className="w-5 h-5 text-gray-400" />}
                                </div>
                            </button>
                            
                            
                        </div>
                    </>
                )}
                
                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    <p>Toto je dočasný prístupový odkaz.</p>
                    <p>Ak narazíte na problémy, kontaktujte administrátora.</p>
                </div>
            </main>
        </div>
    );
};

export default TempGateControl;