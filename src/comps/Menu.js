import React, { useEffect, useState } from 'react';
import { X, User, Clock, Car, Link2, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const SlideOutMenu = ({ isMenuOpen, toggleMenu, onLogOut, generalInfo }) => {
  const [user, setUser] = useState('');
  const navigate = useNavigate();
  function redirectToTempAccess() { navigate('/temp-access'); }


  useEffect(() => {
    setUser(generalInfo.user);
  }, [generalInfo]);
    
  return (
    <div className={`fixed z-20 inset-y-0 left-0 w-64 bg-gray-900 text-white transform transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4">
        <button onClick={toggleMenu} className="absolute right-4 top-4 p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-6 h-6" />
        </button>
        
        {/* User Info */}
        <button className="flex items-center space-x-3 mb-8 mt-8">
          <User className="w-8 h-8" />
          <span className="text-lg font-semibold">{user ? user.username : '' }</span>
        </button>

        {/* Menu Items */}
        <nav className="space-y-4">
        <button onClick={() => {navigate("/");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Clock className="w-5 h-5" />
            <span>Ovládanie brány</span>
          </button>
          <button onClick={() => {navigate("/history");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Clock className="w-5 h-5" />
            <span>História</span>
          </button>
          <button className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Car className="w-5 h-5" />
            <span>Spravovať ŠPZ</span>
          </button>
          <button onClick={() => {navigate("/temp-access");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Link2 className="w-5 h-5" />
            <span>Generovať dočasný prístup</span>
          </button>
          <button onClick={() => {navigate("/parking");}} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Car className="w-5 h-5" />
            <span>Prehľad parkoviska</span>
          </button>
          <button className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg text-start">
            <Settings className="w-5 h-5" />
            <span>Nastavenia</span>
          </button>
        </nav>
        <button onClick={onLogOut} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-800 rounded-lg mb-4 mt-4">
            <LogOut className="w-5 h-5" />
            <span>Odhlásiť sa</span>
        </button>
      </div>
    </div>
  );
};

export default SlideOutMenu;