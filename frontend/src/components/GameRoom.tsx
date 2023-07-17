import Revolver from "../assets/revolver.png";
import { useState, useEffect } from "react";
import GamerDetails from "./GamerDetails";
import ChatRoom from "./ChatRoom";
import fireMan from "../assets/firePopMan.png";
import spin from "../assets/audio/spin.mp3";
import gunShoot from "../assets/audio/gunShoot.mp3";
import loaded from "../assets/audio/loaded.mp3";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3001");

function GameRoom(props: {
  room: string;
  players: string[];
  leaveRoom: () => void;
  socket: any;
}) {
  const [rotating, setRotating] = useState<boolean>(false);
  const [fire, setFire] = useState<boolean>(false);
  const [gameData, setGameData] = useState();

  const [countdown, setCountdown] = useState(0);

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

  if (fire) {
    return (
      <div className="fire-container">
        <img src={fireMan} alt="fireman" />
      </div>
    );
  }

  // Create a new audio object
  const spinAudio = new Audio(spin);
  const gunShootAudio = new Audio(gunShoot);
  const loadedAudio = new Audio(loaded);

  // Function to handle spinning and playing sound
  const handleSpin = () => {
    setRotating(true);
    if (!rotating) {
      spinAudio.play();
    }
    setTimeout(() => {
      setRotating(false);
    }, 3000);
  };

  const handleFire = () => {

    setFire(true);
    loadedAudio.play();
    // after loadedAudio finish then play gunshoot audio
    setTimeout(() => {     
      gunShootAudio.play();
    }, 1000);
    // after gunshoot audio finish then set fire to false
    setTimeout(() => {
      setFire(false);
    }, 3000);
  };


  return (
    <>
      {countdown > 0 ? (
        <div>Game starting in: {countdown}</div>
      ) : (
        <div className="game-room-container">
          {gameData && <div className="started">STARTED</div>}
          <div>GameRoom: {props.room}</div>
          <div>Round: 1</div>
          <div>Bet Pool: 0.001 ETH</div>
          <div>Players: {props.players.length}/4</div>
          <div>Waiting for {4 - props.players.length} more players...</div>
          <div className="game-room-inner-container">
            <ChatRoom socket={props.socket} room={props.room} />

            <div className="game-room-row">
              <GamerDetails
                address={props.players[0]}
                shot={false}
                died={false}
                gamerNumber={1}
                socket={props.socket}
                room={props.room}
              />
              <div className="game-room-column">
                <GamerDetails
                  address={props.players[1] || "WAITING"}
                  shot={false}
                  died={false}
                  gamerNumber={2}
                  socket={props.socket}
                  room={props.room}
                />
                <div className="game-room-core">
                  <div
                    className="action-button"
                    onClick={() => {
                      handleSpin();
                      // setRotating(true);
                      // setTimeout(() => setRotating(false), 3000);
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
                      handleFire();
                      // setFire(true);
                      // setTimeout(() => setFire(false), 4000);
                    }}
                  >
                    FIRE
                  </div>
                </div>
                <GamerDetails
                  address={props.players[2] || "WAITING"}
                  shot={false}
                  died={false}
                  gamerNumber={3}
                  socket={props.socket}
                  room={props.room}
                />
              </div>
              <GamerDetails
                address={props.players[3] || "WAITING"}
                shot={false}
                died={false}
                gamerNumber={4}
                socket={props.socket}
                room={props.room}
              />
            </div>
            <div className="chat-window"></div>
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
