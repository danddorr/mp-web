import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, UserCircle2, Lock, Infinity } from 'lucide-react';

const TempGateControl = ({ gateStateDisplay, sendTrigger }) => {
    const { accesslink } = useParams();
    const navigate = useNavigate();
    const [accessInfo, setAccessInfo] = useState({});

    useEffect(() => {
        fetch(`https://${process.env.REACT_APP_SERVER_DOMAIN}/api/temporary-access/${accesslink}/`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setAccessInfo(data);
        })
        .catch((error) => {
            console.error('Error:', error);
            navigate("/");
        });
    }, [accesslink]);


return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 bottom-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-center">
                <h1 className="text-xl font-bold">School Gate Control</h1>
                <div className="w-6" /> {/* Spacer for symmetry */}
            </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4 max-w-md">
            {/* Gate Status Video Section */}
            <div className="relative mb-6 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    {/* Placeholder for video */}
                    <div className="absolute inset-0 bg-black/50" />
                    <span className="relative text-2xl font-bold">{gateStateDisplay}</span>
                </div>
            </div>

            {/* Gate Control Buttons */}
            <div className="space-y-4">
                <button
                    onClick={() => {if (accessInfo.open_vehicle !== 0) sendTrigger('start_v')}}
                    className="w-full relative bg-gray-800 rounded-lg overflow-hidden group hover:bg-gray-700 transition-colors p-6 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <Car className="w-8 h-8 mr-4" />
                        <div className="text-left">
                            <span className="text-lg font-semibold block">Open Gate</span>
                            <span className="text-sm text-gray-400">For vehicles</span>
                        </div>
                    </div>
                    { accessInfo.open_vehicle !== 0
                        ? (accessInfo.open_vehicle === -1
                            ? <Infinity className="w-6 h-6 text-white" />  
                            : accessInfo.open_vehicle)
                        : <Lock className="w-6 h-6" />
                    }
                </button>

                <button
                    onClick={() => {if (accessInfo.open_pedestrian !== 0) sendTrigger('start_p')}}
                    className="w-full relative bg-gray-800 rounded-lg overflow-hidden group hover:bg-gray-700 transition-colors p-6 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <UserCircle2 className="w-8 h-8 mr-4" />
                        <div className="text-left">
                            <span className="text-lg font-semibold block">Open Gate</span>
                            <span className="text-sm text-gray-400">For pedestrians</span>
                        </div>
                    </div>
                    { accessInfo.open_pedestrian !== 0
                        ? (accessInfo.open_pedestrian === -1
                            ? <Infinity className="w-6 h-6 text-white" />  
                            : accessInfo.open_pedestrian)
                        : <Lock className="w-6 h-6" />
                    }
                </button>

                <button
                    onClick={() => {if (accessInfo.close_gate !== 0) sendTrigger('stop')}}
                    className="w-full relative bg-gray-800 rounded-lg overflow-hidden group hover:bg-gray-700 transition-colors p-6 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <Lock className="w-8 h-8 mr-4" />
                        <div className="text-left">
                            <span className="text-lg font-semibold block">Close Gate</span>
                            <span className="text-sm text-gray-400">All access points</span>
                        </div>
                    </div>
                    { accessInfo.close_gate !== 0
                        ? (accessInfo.close_gate === -1
                            ? <Infinity className="w-6 h-6 text-white" />  
                            : accessInfo.close_gate)
                        : <Lock className="w-6 h-6" />
                    }
                </button>
            </div>
        </main>
    </div>
);
};

export default TempGateControl;