import Revolver from "../assets/revolver.png";
import { useState, useEffect } from "react";
import GamerDetails from "./GamerDetails";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function GameRoom(props: {
  room: string;
  players: string[];
  leaveRoom: () => void;
}) {
  const [rotating, setRotating] = useState<boolean>(false);
  const [countdown, setCountdown] = useState(0);
  // Listen for the 'GameStarted' event
  socket.on("gameStarted", (game) => {
    console.log("gameStarted", game);
  });

  useEffect(() => {
    if (props.players.length === 4) {
      setCountdown(5);
      const intervalId = setInterval(() => {
        setCountdown((t) => t - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [props.players]);
  return (
    <>
    {countdown>0 ? (
       <div>Game starting in: {countdown}</div>
    ) : (
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
            <div className="action-button">FIRE</div>
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

      {/* {props.players.map((player, index) => (
        <GamerDetails
          address={player}
          shot={false}
          died={false}
          gamerNumber={index}
        />
      ))} */}
    </div>
    )}
    </>
  );
}

export default GameRoom;
