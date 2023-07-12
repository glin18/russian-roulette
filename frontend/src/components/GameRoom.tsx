import Revolver from "../assets/revolver.png";

function GameRoom(props: { room: string }) {
  return (
    <div className="game-room-container">
      <div>GameRoom: {props.room}</div>
      <div>Round: 1</div>
      <div>Bet Pool: 0.001 ETH</div>
      <img src={Revolver} alt="revolver" />
    </div>
  );
}

export default GameRoom;
