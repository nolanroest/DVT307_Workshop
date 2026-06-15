import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Navigation } from './components/Navigation';
import EntryScreen from './screens/EntryScreen/EntryScreen';
import LeaderboardScreen from './screens/LeaderboardScreen/LeaderboardScreen';
import GameScreen from './screens/GameScreen/GameScreen';
import GameListScreen from './screens/GameListScreen/GameListScreen';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from '../amplify_outputs.json';

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure({
  ...amplifyConfig,
  API: {
    ...amplifyConfig.API,
    REST: outputs.custom.API,
  },
});

function App() {
  const baseURL = import.meta.env.MODE === 'production' ? '/' : `/ports/8081${import.meta.env.BASE_URL}`;

  return (
    <Authenticator>
      <Authenticator.Provider>
        <GameProvider>
          <Router basename={baseURL}>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main>
                <Routes>
                  <Route path="/" element={<EntryScreen />} />
                  <Route path="/game" element={<GameListScreen />} />
                  <Route path="/game/:gameId" element={<GameScreen />} />
                  <Route path="/leaderboard" element={<LeaderboardScreen />} />
                </Routes>
              </main>
            </div>
          </Router>
        </GameProvider>
      </Authenticator.Provider>
   </Authenticator>
  );
}

export default App;