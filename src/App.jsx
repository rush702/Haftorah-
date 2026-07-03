import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import PracticeScreen from './screens/PracticeScreen';
import ResultsScreen from './screens/ResultsScreen';
import AchievementsScreen from './screens/AchievementsScreen';

function App() {
  const game = useGameState();
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState({});

  useEffect(() => {
    if (!game.playerName) setScreen('welcome');
  }, [game.playerName]);

  const navigate = (newScreen, newParams = {}) => {
    setParams(newParams);
    setScreen(newScreen);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
      {screen === 'welcome' && <WelcomeScreen onComplete={() => navigate('home')} />}
      {screen === 'home' && <HomeScreen onNavigate={navigate} />}
      {screen === 'practice' && (
        <PracticeScreen
          sectionId={params.sectionId}
          onComplete={(stats) => navigate('results', { stats })}
          onExit={() => navigate('home')}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          stats={params.stats}
          onContinue={() => navigate('home')}
          onNext={(sectionId) => navigate('practice', { sectionId })}
        />
      )}
      {screen === 'achievements' && <AchievementsScreen onBack={() => navigate('home')} />}
    </div>
  );
}

export default App;
