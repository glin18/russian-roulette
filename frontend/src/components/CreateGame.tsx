import createGameImage from "../assets/game.png";
import { useAccount } from "wagmi";
import { useState } from "react";
import { io } from "socket.io-client";

function CreateGame() {
  const [showModal, setShowModal] = useState<boolean>(false);

  const { address } = useAccount();
  console.log(address);

  const socket = io("http://localhost:3001");

  const onClickCreate = () => {
    setShowModal(true);
  };

  const onClickClose = () => {
    setShowModal(false);
  };

  return (
    <main className="outer-container">
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
            <div className="body-button">AUTO MATCH</div>
            <div className="body-button">INVITE WITH CODE</div>
            <div className="room-code">
              <input type="text" placeholder="Enter room code..." />
              <div className="join">JOIN</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CreateGame;
