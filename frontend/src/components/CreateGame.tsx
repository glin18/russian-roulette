import createGameImage from "../assets/game.png";
import { useAccount } from "wagmi";
import { useState } from "react";
import { io } from "socket.io-client";
import GameRoom from "./GameRoom";

const socket = io("http://localhost:3001");

function CreateGame() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>("");

  const { address } = useAccount();
  console.log(address);

  // pass room code to backend
  const joinRoom = () => {
    setRoomCode("1234");
    if (roomCode !== "") {
      socket.emit("join_room", roomCode);
    }
  };

  const onClickCreate = () => {
    setShowModal(true);
  };

  const onClickClose = () => {
    setShowModal(false);
  };

  return (
    <main className="outer-container">
      {roomCode ? (
        <GameRoom />
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
                <div className="body-button" onClick={joinRoom}>
                  AUTO MATCH
                </div>
                <div className="body-button">INVITE WITH CODE</div>
                <div className="room-code">
                  <input type="text" placeholder="Enter room code..." />
                  <div className="join">JOIN</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default CreateGame;
