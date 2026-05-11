import { GameCanvas } from './components/GameCanvas';
import { Web3Provider } from './providers/Web3Provider';

function App() {
  return (
    <Web3Provider>
      <div className="w-full h-screen overflow-hidden bg-black text-white selection:bg-neon-cyan/30">
        <GameCanvas />
      </div>
    </Web3Provider>
  );
}

export default App;
