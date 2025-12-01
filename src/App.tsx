import './App.css';
import { CanvasStage } from './components/CanvasStage';
import { ReactionPanel } from './components/ReactionPanel';

function App() {
  return (
    <div className="app-shell">
      <main className="layout">
        <CanvasStage />
        <ReactionPanel />
      </main>
      </div>
  );
}

export default App;
