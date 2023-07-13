import Revolver from "../assets/revolver.png";
import { useState } from "react";
import GamerDetails from "./GamerDetails";
import fireMan from "../assets/firePopMan.png";

function GameRoom(props: {
  room: string;
  players: string[];
  leaveRoom: () => void;
}) {
  const [rotating, setRotating] = useState<boolean>(false);
  const [fire, setFire] = useState<boolean>(false);

  if (fire) {
    return (
      <div className="fire-container">
        <img src={fireMan}></img>
      </div>
    );
  }

  return (
    <div className="game-room-container">
      <div>GameRoom: {props.room}</div>
      <div>Round: 1</div>
      <div>Bet Pool: 0.001 ETH</div>
      <div>Players: {props.players.length}/4</div>
      <div>Waiting for {4 - props.players.length} more players...</div>
      <div className="game-room-row">
        <GamerDetails
          address={props.players[0]}
          shot={false}
          died={false}
          gamerNumber={1}
        />
        <div className="game-room-column">
          <GamerDetails
            address={props.players[1] || "WAITING"}
            shot={false}
            died={false}
            gamerNumber={1}
          />
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
            <div
              className="action-button"
              onClick={() => {
                setFire(true);
                setTimeout(() => setFire(false), 4000);
              }}
            >
              FIRE
            </div>
          </div>
          <GamerDetails
            address={props.players[2] || "WAITING"}
            shot={false}
            died={false}
            gamerNumber={1}
          />
        </div>
        <GamerDetails
          address={props.players[3] || "WAITING"}
          shot={false}
          died={false}
          gamerNumber={1}
        />
      </div>
      <div className="leave" onClick={props.leaveRoom}>
        LEAVE
      </div>
    </div>
  );
}

export default GameRoom;
