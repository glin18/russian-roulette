import createGameImage from "../assets/game.png";
import { useAccount } from "wagmi";
import { useState } from "react";
import { io } from "socket.io-client";
import GameRoom from "./GameRoom";

const socket = io("http://localhost:3001");

function CreateGame() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>("");

  // User will enter the GameRoom based on this state
  const [room, setRoom] = useState<string>("");
  const [players, setPlayers] = useState<string[]>([]);

  const { address } = useAccount();

  // pass room code to backend
  const joinRandomRoom = () => {
    socket.emit("joinRandomRoom", { address });
    setRoom(roomCode);
  };

  const joinPrivateRoom = () => {
    console.log("Joining room:", roomCode);
    socket.emit("joinPrivateRoom", { roomId: roomCode, address });
    // setRoom(roomCode);
  };

  const createPrivateRoom = () => {
    socket.emit("createPrivateRoom", { address });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId: room });
    console.log("ROOMCODE", room);
    setRoom("");
  };

  // Listen for the 'roomCreated' event
  socket.on("roomCreated", (data) => {
    // 'data' is the object that the server sent, which includes the roomId
    const roomId = data.roomId;
    setRoom(roomId);
    setPlayers(data.players);

    console.log("roomCreated, Joined room:", roomId);

    // Now you can use roomId as needed
  });

  // Listen for the 'joinedRoom' event
  socket.on("joinedRoom", (data) => {
    // 'data' is the object that the server sent, which includes the roomId
    const roomId = data.roomId;
    if (data.socketID === socket.id) {
      setRoom(roomId);
    }
    setPlayers(data.players);
    console.log(data.players);

    console.log("Joined room:", roomId);
    console.log("Players", data.players);
    // setRoomCode(roomId);

    // Now you can use roomId as needed
  });

  socket.on("roomLeft", (data) => {
    setPlayers(data.players);
  });

  const onClickCreate = () => {
    setShowModal(true);
  };

  const onClickClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <main className="outer-container">
        {room ? (
          <GameRoom room={room} players={players} leaveRoom={leaveRoom} />
        ) : (
          <>
            <div className="page-title">YOU BET YOUR LIFE</div>
            <div className="inner-container">
              <div className="create-game" onClick={onClickCreate}>
                CREATE GAME ROOM
              </div>
              <img src={createGameImage} alt="create game image" />

              <div
                id="myModal"
                className="modal"
                style={{ display: showModal ? "block" : "none" }}
              >
                <div className="modal-content">
                  <div className="modal-content-header">
                    <div style={{ visibility: "hidden" }}> &times;</div>
                    <div className="bet-button">Bet 0.001 ETH</div>
                    <span className="close" onClick={onClickClose}>
                      &times;
                    </span>
                  </div>
                  <div className="body-button" onClick={joinRandomRoom}>
                    AUTO MATCH
                  </div>
                  <div className="body-button" onClick={createPrivateRoom}>
                    CREATE PRIVATE ROOM
                  </div>
                  <div className="room-code">
                    <input
                      type="text"
                      placeholder="Enter private room code..."
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                    />
                    <div className="join" onClick={joinPrivateRoom}>
                      JOIN
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default CreateGame;
