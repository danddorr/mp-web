import React, { useState, useEffect } from 'react';
import { Menu, Car, UserCircle2, Lock, Infinity, CheckCircle } from 'lucide-react';
import SlideOutMenu from './Menu';

const GateControlApp = ({ gateStateDisplay, sendTrigger, onLogOut, generalInfo }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [actionFeedback, setActionFeedback] = useState(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 bottom-0 z-10 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <button onClick={toggleMenu} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Kontrola Školskej Brány</h1>
                <div className="w-6" /> {/* Spacer for symmetry */}
            </div>
        </header>
        
        <SlideOutMenu 
            isMenuOpen={isMenuOpen} 
            toggleMenu={toggleMenu} 
            onLogOut={onLogOut}
            generalInfo={generalInfo}
        />

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
        </main>
    </div>
);
};

export default GateControlApp;