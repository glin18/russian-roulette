import Revolver from "../assets/revolver.png";

function GameRoom(props: { room: string; players: string[] }) {
  return (
    <div className="game-room-container">
      <div>GameRoom: {props.room}</div>
      <div>Round: 1</div>
      <div>Bet Pool: 0.001 ETH</div>
      <div className="game-room-core">
        <div className="action-button">SPIN</div>
        <img src={Revolver} alt="revolver" />
        <div className="action-button">FIRE</div>
      </div>

      {props.players.map((player) => (
        <div key={Math.random()}>{player}</div>
      ))}
    </div>
  );
}

export default GameRoom;
