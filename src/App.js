import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import GateControlApp from './comps/GateControl';
import TempGateControl from './comps/TempGateControl';
import LoginPage from './comps/LoginPage';
import TempAccessCreateForm from './comps/TempAccessCreate';
import TempAccessEditForm from './comps/TempAccessEdit';
import TempAccess from './comps/TempAccess';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [authToken, setAuthToken] = useState(
    () => Cookies.get('auth_token')
  );
  const [gateStateDisplay, setGateStateDisplay] = useState('');
  const [gateState, setGateState] = useState('unknown');
  const [lastWsMessage, setLastWsMessage] = useState('');
  const [generalInfo, setGeneralInfo] = useState({});
  let ws = useRef(null);
  let timeout = 250;

  const GATE_STATES = {
    'open_p': 'Otvorené pre chodcov',
    'open_v': 'Otvorené pre vozidlo',
    'closed': 'Zatvorené',
    'not_closed': 'Nie je zatvorené',
    'opening_p': 'Otvára sa pre chodcov',
    'opening_v': 'Otvára sa pre vozidlo',
    'closing': 'Zatvára sa',
    'unknown': 'Unknown',
  }

  useEffect(() => {
    setGateStateDisplay(GATE_STATES[gateState]);
  }, [gateState]);
  
  useEffect(() => {
    if (!authToken) {
      if (window.location.href.split('/').slice(-2, -1)[0] === 'guest') {
        connectWebsocket('', window.location.href.split('/').pop());
        return () => {
          ws.current.close();
        };
      }
      return;
    }

    connectWebsocket(authToken);

    fetch(`https://${process.env.REACT_APP_SERVER_DOMAIN}/api/general-info/`, {
      headers: {
        'Authorization': `JWT ${authToken}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setGeneralInfo({ ...data, authToken });
        console.log(generalInfo);
      });

    return () => {
      ws.current.close();
    };
  }, [authToken]);

  function connectWebsocket(authToken='', temp_access_link='') {
    const connectionString = `wss://${process.env.REACT_APP_SERVER_DOMAIN}/ws/gate/?` + (authToken ? `token=${authToken}` : `temp_access_link=${temp_access_link}`);
    ws.current = new WebSocket(connectionString);
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type === 'status') {
        setGateState(message.message);
      }
    };

    ws.current.onopen = function() {
      timeout = 250;
    };

    ws.current.onclose = function(e) {
      console.log(`Socket is closed. Reconnect will be attempted in ${timeout}ms.`, e.reason);
      if (timeout < 10000) {
        timeout += timeout;
      }
      if (window.location.href.split('/').slice(-2, -1)[0] === 'guest') {
        setTimeout(() => {connectWebsocket('', window.location.href.split('/').pop())}, timeout);
      } else {
        setTimeout(() => {connectWebsocket(authToken)}, timeout);
      }
      setTimeout(connectWebsocket, timeout);
    };
  }

  function sendTrigger(trigger) {
    console.log('Sending trigger:', trigger);
    console.log(ws.current);
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open');
      return;
    }
    ws.current.send(JSON.stringify({ type: 'trigger', message: trigger }));
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
          <Route path="/login" element={<LoginPage onLogIn={logIn} replace={true}/>} />
          <Route path="/guest/:accesslink" element={<TempGateControl gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
          <Route path="/" element={authToken 
            ? <GateControlApp onLogOut={logOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} generalInfo={generalInfo}/> 
            : <Navigate to='/login' state={"/"}/>
          }/>
          <Route path="/temp-access/create" element={authToken 
            ? <TempAccessCreateForm onLogOut={logOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} generalInfo={generalInfo}/> 
            : <Navigate to='/login'  state={"/temp-access"}/>
          } />
          <Route path="/temp-access/edit" element={authToken 
            ? <TempAccessEditForm onLogOut={logOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} generalInfo={generalInfo}/> 
            : <Navigate to='/login'  state={"/temp-access"}/>
          } />
          <Route path="/temp-access" element={authToken 
            ? <TempAccess onLogOut={logOut} gateStateDisplay={gateStateDisplay} sendTrigger={sendTrigger} generalInfo={generalInfo}/> 
            : <Navigate to='/login' state={"/temp-access"}/>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;