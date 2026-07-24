import Header from "./components/Header";
import ChessBoard from "./components/ChessBoard";
import SidePanel from "./components/SidePanel";
import GameOverModal from "./components/GameOverModal";
import PromotionModal from "./components/PromotionModal";
import useGame from "./hooks/useGame";
import bgVideo from "./assets/background.mp4";

function App() {

  const game = useGame();

  return (
    <>
      {/* Fixed Background */}
      <div className="background"></div>

      {/* Main App */}
      <div className="app">
        <Header game={game} />

        <div className="layout">
          <ChessBoard game={game} />
          <SidePanel game={game} />
        </div>

        <GameOverModal game={game} />
        <PromotionModal game={game} />
      </div>
    </>
  );
}

export default App;