import React from 'react';
import { X, History, Car, Key, ParkingCircle, Settings, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SlideOutMenu = ({ isMenuOpen, toggleMenu }) => {
  const navigate = useNavigate();

  function handleNavigate(path) {
    navigate(path);
    toggleMenu();
  }

  return (
    <div className={`fixed z-20 inset-y-0 left-0 w-64 bg-gray-900 text-white transform transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4">
        <button onClick={toggleMenu} className="absolute right-4 top-4 p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-6 h-6" />
        </button>
        
        {/* Menu Items */}
        <nav className="space-y-4 mt-12">
          <button onClick={() => {handleNavigate("/");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Home className="w-5 h-5" />
            <span>Ovládanie brány</span>
          </button>
          <button onClick={() => {handleNavigate("/parking");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <ParkingCircle className="w-5 h-5" />
            <span>Prehľad parkoviska</span>
          </button>
          <button onClick={() => {handleNavigate("/temp-access");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Key className="w-5 h-5" />
            <span>Generovať dočasný prístup</span>
          </button>
          <button onClick={() => {handleNavigate("/history");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <History className="w-5 h-5" />
            <span>História</span>
          </button>
          <button className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Car className="w-5 h-5" />
            <span>Spravovať ŠPZ</span>
          </button>
          <button className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Settings className="w-5 h-5" />
            <span>Nastavenia</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default SlideOutMenu;