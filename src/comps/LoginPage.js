import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add your login logic here
    if (!email || !password) {
      console.error('Email and password are required');
      return;
    }
    
    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/auth/jwt/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: email,
        password: password
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          alert(data.detail);
          return;
        }
        onLogIn(data.access);
        
        navigate(location.state ? location.state : '/');
      })
      .catch((error) => {
        console.error('Failed to log in', error);
      });
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 p-4 rounded-full">
              <Lock className="w-12 h-12" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-4">Prihlásenie</h1>

          

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Používateľské meno
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="text"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-500 text-white"
                  placeholder="Zadajte používateľské meno"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Heslo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-500 text-white"
                  placeholder="Zadajte heslo"
                />
              </div>
            </div>

    

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg 
                       font-semibold transition-colors focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;