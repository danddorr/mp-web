import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './comps/LoginForm';
import Dashboard from './comps/Dashboard'; // Assuming you have a Dashboard component
import GateControlApp from './comps/GateControl';
import LoginPage from './comps/LoginPage';
import TempAccessForm from './comps/TempAccessForm';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';


function App() {
  const [authToken, setAuthToken] = useState(
    () => Cookies.get('auth_token')
  );
  const [gateStateDisplay, setGateStateDisplay] = useState('');
  const [gateState, setGateState] = useState('unknown');
  let ws = null;

  const GATE_STATES = {
    'open_p': 'Brána je otvorená pre chodcov',
    'open_v': 'Brána je otvorená pre vozidlá',
    'closed': 'Brána je zatvorená',
    'not_closed': 'Nie je zatvorená',
    'opening_p': 'Otvára sa brána pre chodcov',
    'opening_v': 'Otvára sa brána pre vozidlá',
    'closing': 'Zatvára sa brána',
    'unknown': '',
  }

  useEffect(() => {
    setGateStateDisplay(GATE_STATES[gateState]);
  }, [gateState]);
  
  useEffect(() => {
    if (!authToken) {
      return;
    }

    ws = new WebSocket(`wss://${process.env.REACT_APP_SERVER_DOMAIN}/ws/gate/?token=${authToken}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type === 'status') {
        setGateState(message.message);
      }
    };

    return () => {
      ws.close();
    };
  }, [authToken]);

  function sendTrigger(trigger) {
    console.log('Sending trigger:', trigger);
    if (!ws) {
      console.error('WebSocket is not open');
      return;
    }
    ws.send(JSON.stringify({ type: 'trigger', message: trigger }));
  }

  const logIn = (auth_token) => {
    setAuthToken(auth_token);
    Cookies.set('auth_token', auth_token, { expires: 7 });
  };

  const logOut = () => {
    setAuthToken(null);
    Cookies.remove('auth_token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login-old" element={<LoginForm />} />
          <Route path="/login" element={<LoginPage onLogIn={logIn} replace={true}/>} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
          <Route path="/" element={authToken 
            ? <GateControlApp onLogOut={logOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger}/> 
            : <Navigate to='/login' state={"/"}/>
          }/>
          <Route path="/temp-access" element={authToken 
            ? <TempAccessForm onLogOut={logOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger}/> 
            : <Navigate to='/login'  state={"/temp-access"}/>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;