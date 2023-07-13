import Revolver from "../assets/revolver.png";
import { useState } from "react";
import GamerDetails from "./GamerDetails";

function GameRoom(props: { room: string; players: string[] }) {
  const [rotating, setRotating] = useState<boolean>(false);
  return (
    <div className="game-room-container">
      <div>GameRoom: {props.room}</div>
      <div>Round: 1</div>
      <div>Bet Pool: 0.001 ETH</div>
      <div className="game-room-core">
        <div
          className="action-button"
          onClick={() => {
            setRotating(true);
            setTimeout(() => setRotating(false), 4000);
          }}
        >
          SPIN
        </div>
        <img
          src={Revolver}
          alt="revolver"
          className={rotating ? "rotatingImage" : ""}
        />
        <div className="action-button">FIRE</div>
      </div>

      {props.players.map((player, index) => (
        <GamerDetails
          address={player}
          shot={false}
          died={false}
          gamerNumber={index}
        />
      ))}
    </div>
  );
}

export default GameRoom;
