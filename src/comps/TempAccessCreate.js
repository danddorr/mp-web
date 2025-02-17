import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, DoorClosed, X } from 'lucide-react';
import Header from './Header';
import Counter from './Counter';

const TempAccessCreateForm = ({ onLogOut, gateStateDisplay, sendTrigger, generalInfo }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('license');
  const [licensePlate, setLicensePlate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openVehicle, setOpenVehicle] = useState(0);
  const [openPedestrian, setOpenPedestrian] = useState(0);
  const [closeGate, setCloseGate] = useState(0);
  const [canOpenVehicle, setCanOpenVehicle] = useState(false);
  const [canOpenPedestrian, setCanOpenPedestrian] = useState(false);
  const [canCloseGate, setCanCloseGate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (generalInfo.user) {
      setCanOpenVehicle(generalInfo.user.can_open_vehicle);
      setCanOpenPedestrian(generalInfo.user.can_open_pedestrian);
      setCanCloseGate(generalInfo.user.can_close_gate);
      setIsAdmin(generalInfo.user.is_admin);
    }
  }, [generalInfo]);

  const handleSubmit = () => {
    const data = {
      access_type: activeTab === 'license' ? 'ecv' : 'link',
      ecv: activeTab === 'license' ? licensePlate : undefined,
      valid_from: startDate,
      valid_until: endDate,
      open_vehicle: openVehicle,
      open_pedestrian: openPedestrian,
      close_gate: closeGate,
    };

    fetch(`https://${process.env.REACT_APP_SERVER_DOMAIN}/api/temporary-access/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${generalInfo.authToken}`
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black overflow-y-auto text-white">
      <Header onLogOut={onLogOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} generalInfo={generalInfo}/>
      <div className="max-w-2xl mx-auto md:mt-4 md:mb-4 bg-gray-800/30 backdrop-blur rounded-lg border border-transparent md:border-gray-700 shadow-xl p-4">
        <div className="flex items-center">
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                  onClick={() => navigate('/temp-access') }>
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Temporary Access
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Configure temporary access permissions for visitors
        </p>

        {/* Custom Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-1 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('license')}
              className={`py-2 px-4 rounded-md transition-colors ${
                activeTab === 'license'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              License Plate
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`py-2 px-4 rounded-md transition-colors ${
                activeTab === 'link'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              Temporary Link
            </button>
          </div>
        </div>

        {activeTab === 'license' && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle License Plate Number
            </label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="Enter license plate number"
              className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white rounded-lg 
                       focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                       hover:border-gray-500 transition-colors placeholder-gray-400"
            />
            <p className="text-sm text-gray-400 mt-2">
              Enter the vehicle's license plate number for temporary access authorization
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="space-y-2 w-full">
            <label className="block text-sm font-medium text-gray-300">
              Start Date/Time
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white rounded-lg 
                       focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                       hover:border-gray-500 transition-colors"
            />
          </div>
          <div className="space-y-2 w-full">
            <label className="block text-sm font-medium text-gray-300">
              End Date/Time
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white rounded-lg 
                       focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                       hover:border-gray-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Counter
            icon={Car}
            value={openVehicle}
            label="Vehicle Access"
            helperText="Number of vehicles allowed"
            onIncrement={() => setOpenVehicle(openVehicle + 1)}
            onDecrement={() => setOpenVehicle(openVehicle - 1)}
            canModify={canOpenVehicle}
            isAdmin={isAdmin}
          />
          <Counter
            icon={User}
            value={openPedestrian}
            label="Pedestrian Access"
            helperText="Number of people allowed"
            onIncrement={() => setOpenPedestrian(openPedestrian + 1)}
            onDecrement={() => setOpenPedestrian(openPedestrian - 1)}
            canModify={canOpenPedestrian}
            isAdmin={isAdmin}
          />
          <Counter
            icon={DoorClosed}
            value={closeGate}
            label="Close Gate"
            helperText="Auto-close after entries"
            onIncrement={() => setCloseGate(closeGate + 1)}
            onDecrement={() => setCloseGate(closeGate - 1)}
            canModify={canCloseGate}
            isAdmin={isAdmin}
          />
        </div>

        <p className="text-gray-400 italic text-center text-sm mb-8">
          Set the number of entries allowed for each access type. Gates will automatically
          close after the specified number of entries.
        </p>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 
                         text-white font-bold py-4 px-8 rounded-lg text-lg 
                         transition-all duration-200 transform hover:scale-[1.02]"
        >
          Create Temporary Access
        </button>
      </div>
    </div>
  );
};

export default TempAccessCreateForm;