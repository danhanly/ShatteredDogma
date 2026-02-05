import React from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { MainScreen } from './components/MainScreen';
import { Menu } from './components/Menu';

const App: React.FC = () => {
  const { 
    gameState, 
    clickPower, 
    upgradeCost, 
    canAfford, 
    milestoneState,
    performMiracle, 
    purchaseUpgrade, 
    equipGem,
    toggleSound
  } = useGame();

  const handleTap = (x: number, y: number) => {
    const result = performMiracle();
    return result.power;
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black text-gray-200">
      <Header gameState={gameState} toggleSound={toggleSound} />
      
      <main className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <MainScreen 
          gameState={gameState} 
          milestoneState={milestoneState}
          onTap={handleTap} 
        />
        
        <Menu 
          gameState={gameState}
          upgradeCost={upgradeCost}
          clickPower={clickPower}
          canAfford={canAfford}
          milestoneState={milestoneState}
          onUpgrade={purchaseUpgrade}
          onEquipGem={equipGem}
        />
      </main>
    </div>
  );
};

export default App;