import React from 'react';
import ImpactSimulator from './ImpactSimulator';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🌍 Asteroid Impact Calculator</h1>
        <p>Calculate impact radius and visualize damage zones on Earth</p>
      </header>
      <main>
        <ImpactSimulator />
      </main>
    </div>
  );
}

export default App;
