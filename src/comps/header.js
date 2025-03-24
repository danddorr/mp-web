import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SlideOutMenu from './Menu';

const Header = ({ onLogOut, gateStateDisplay, generalInfo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(generalInfo?.user || '');
  }, [generalInfo]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-900 w-full border-b border-gray-800 p-4 z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - Menu and Status */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="p-2 text-white hover:text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Stav:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white`}>
                {gateStateDisplay}
              </span>
            </div>
          </div>

          {/* Right side - User dropdown */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg"
              >
                <User className="w-5 h-5" />
                <span>{user?.username || 'Používateľ'}</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-30">
                  <div className="p-1">
                    <button 
                      onClick={() => {
                        onLogOut();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 w-full text-left text-white hover:bg-gray-700 border border-transparent rounded-t-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Odhlásiť sa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <SlideOutMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
    </header>
  );
};

export default Header;