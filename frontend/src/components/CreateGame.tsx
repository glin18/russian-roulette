import createGameImage from "../assets/game.png";

function CreateGame() {
  return (
    <main className="outer-container">
      <div className="page-title">YOU BET YOUR LIFE</div>
      <div className="inner-container">
        <div>CREATE GAME ROOM</div>
        <img src={createGameImage} alt="create game image" />
      </div>
    </main>
  );
}

export default CreateGame;
