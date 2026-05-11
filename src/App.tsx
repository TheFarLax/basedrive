import React from 'react';
import { GameCanvas } from './components/GameCanvas';

function App() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white selection:bg-neon-cyan/30">
      <GameCanvas />
    </div>
  );
}

export default App;
