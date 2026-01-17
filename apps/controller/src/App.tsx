import React, { useEffect, useState } from 'react';
import { StreamClient } from '@video-light-sync/transport';
import { LightState } from '@video-light-sync/core';

const PRESETS: { label: string; state: LightState }[] = [
  { label: 'Warm White', state: { timestamp: 0, rgb: [255, 200, 100], brightness: 0.8, warmth: 0.8 } },
  { label: 'Cool White', state: { timestamp: 0, rgb: [200, 220, 255], brightness: 0.8, warmth: 0.1 } },
  { label: 'Red', state: { timestamp: 0, rgb: [255, 0, 0], brightness: 1, warmth: 0.5 } },
  { label: 'Blue', state: { timestamp: 0, rgb: [0, 0, 255], brightness: 1, warmth: 0.1 } },
  { label: 'Green', state: { timestamp: 0, rgb: [0, 255, 0], brightness: 1, warmth: 0.5 } }
];

function App() {
  const [client, setClient] = useState<StreamClient | null>(null);
  const [currentState, setCurrentState] = useState<LightState | null>(null);

  useEffect(() => {
    const c = new StreamClient('ws://localhost:3001');
    c.connect();
    
    // Listen for updates from other sources (e.g. web-capture)
    c.onState((state) => {
      setCurrentState(state);
    });

    setClient(c);
  }, []);

  const sendState = (presetState: LightState) => {
    if (client) {
      const payload = { ...presetState, timestamp: Date.now() };
      client.sendState(payload);
      // Optimistically update UI
      setCurrentState(payload);
    }
  };

  const bgColor = currentState 
    ? `rgb(${currentState.rgb[0]}, ${currentState.rgb[1]}, ${currentState.rgb[2]})`
    : '#333';

  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      minHeight: '100vh', 
      backgroundColor: bgColor,
      color: '#fff',
      transition: 'background-color 0.2s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{ 
        background: 'rgba(0,0,0,0.7)', 
        padding: 40, 
        borderRadius: 20,
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <h1>Video Light Sync Controller</h1>
        
        <div style={{ margin: '20px 0' }}>
          <h3>Current State</h3>
          {currentState ? (
            <div style={{ textAlign: 'left' }}>
              <p>Brightness: {Math.round(currentState.brightness * 100)}%</p>
              <p>Warmth: {Math.round(currentState.warmth * 100)}%</p>
              <p>RGB: {currentState.rgb.join(', ')}</p>
            </div>
          ) : (
            <p>Waiting for data...</p>
          )}
        </div>

        <h3>Manual Overrides</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => sendState(p.state)}
              style={{ padding: '10px 20px', cursor: 'pointer', fontSize: 16 }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
