import Revolver from "../assets/revolver.png";
import { useState, useEffect } from "react";
import GamerDetails from "./GamerDetails";
import ChatRoom from "./ChatRoom";
import fireMan from "../assets/firePopMan.png";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3001");

function GameRoom(props: {
  room: string;
  players: string[];
  leaveRoom: () => void;
  socket: any;
  address: string;
}) {
  const [rotating, setRotating] = useState<boolean>(false);
  const [fire, setFire] = useState<boolean>(false);
  const [gameData, setGameData] = useState<any>();

  const [countdown, setCountdown] = useState<number>(0);

  // const [gamesData, setGamesData] = useState();

  // Listen for the 'GameStarted' event
  props.socket.on("gameStart", (data: any) => {
    console.log("gameStarted", data);
    setGameData(data);
  });

  useEffect(() => {
    if (props.players.length === 3) {
      setCountdown(5);
      const intervalId = setInterval(() => {
        setCountdown((t) => t - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [props.players]);

  const onClickFire = () => {
    setFire(true);
    console.log(gameData);
    props.socket.emit("fired", props.room);
    setTimeout(() => setFire(false), 4000);
  };

  props.socket.on("fired", (data: any) => {
    console.log("fired data received");
    setGameData(data);
  });

  if (fire) {
    return (
      <div className="fire-container">
        <img src={fireMan} alt="fireman" />
      </div>
    );
  }

  return (
    <>
      {countdown > 0 ? (
        <div>Game starting in: {countdown}</div>
      ) : (
        <div className="game-room-container">
          <div className="game-room-inner-container">
            <div className="chat-window">
              {gameData && (
                <>
                  <div className="started">STARTED!</div>
                  <div className="started">
                    CURRENT TURN: GAMER
                    {gameData["currentTurn"] + 1}
                  </div>
                </>
              )}
              <div>GameRoom: {props.room}</div>
              <div>Round: 1</div>
              <div>Bet Pool: 0.001 ETH</div>
              <div>Players: {props.players.length}/4</div>
              <div>Waiting for {4 - props.players.length} more players...</div>
            </div>

            <div className="game-room-row">
              <GamerDetails
                address={props.players[0]}
                shot={gameData && gameData["currentTurn"] > 0}
                died={gameData && !gameData["playersAlive"][0]}
                gamerNumber={1}
                socket={props.socket}
                room={props.room}
              />
              <div className="game-room-column">
                <GamerDetails
                  address={props.players[1] || "WAITING"}
                  shot={gameData && gameData["currentTurn"] > 1}
                  died={gameData && !gameData["playersAlive"][1]}
                  gamerNumber={2}
                  socket={props.socket}
                  room={props.room}
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
                  {/* {gameData && gameData["playersAlive"][gameData["currentTurn"]]} */}
                  <img
                    src={Revolver}
                    alt="revolver"
                    className={rotating ? "rotatingImage" : ""}
                  />
                  <div className="action-button" onClick={onClickFire}>
                    FIRE
                  </div>
                </div>
                <GamerDetails
                  address={props.players[2] || "WAITING"}
                  shot={gameData && gameData["currentTurn"] > 2}
                  died={gameData && !gameData["playersAlive"][2]}
                  gamerNumber={3}
                  socket={props.socket}
                  room={props.room}
                />
              </div>
              <GamerDetails
                address={props.players[3] || "WAITING"}
                shot={false}
                died={gameData && !gameData["playersAlive"][3]}
                gamerNumber={4}
                socket={props.socket}
                room={props.room}
              />
            </div>
            <ChatRoom socket={props.socket} room={props.room} />
          </div>

          <div className="leave" onClick={props.leaveRoom}>
            LEAVE
          </div>
        </div>
      )}
    </>
  );
}

export default GameRoom;
