function GameRoom(props: { room: string }) {
  return (
    <div className="game-room-container">
      <div>GameRoom: {props.room}</div>
      <div>Round: </div>
      <div>Bet Pool: 0.001 ETH</div>
    </div>
  );
}

export default GameRoom;
