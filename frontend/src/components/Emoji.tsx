import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import handshakeEmoji from "../assets/emoji/handshakeEmoji.png";
import cloverEnoji from "../assets/emoji/cloverEmoji.png";
import compassEmoji from "../assets/emoji/compassEmoji.png";
import gunEmoji from "../assets/emoji/gunEmoji.png";
import horseshoeEmoji from "../assets/emoji/horseshoeEmoji.png";
import longfaceEmoji from "../assets/emoji/longfaceEmoji.png";
import meaninglessEmoji from "../assets/emoji/meaninglessEmoji.png";
import revolverEmoji from "../assets/emoji/revolverEmoji.png";
import skullEmoji from "../assets/emoji/skullEmoji.png";
import { useAccount } from "wagmi";

// Emoji mapping
const emojiMap = {
  "emoji-1": revolverEmoji,
  "emoji-2": gunEmoji,
  "emoji-3": compassEmoji,
  "emoji-4": longfaceEmoji,
  "emoji-5": handshakeEmoji,
  "emoji-6": horseshoeEmoji,
  "emoji-7": skullEmoji,
  "emoji-8": meaninglessEmoji,
  "emoji-9": cloverEnoji,
};

const Emoji = (props: { socket: any; room: string; address: string }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentEmoji, setCurrentEmoji] = useState<{
    name: string;
    address: string;
  }>({ name: "", address: "" });
  const { address } = useAccount();

  function openModal() {
    setShowModal(true);
  }

  function onClickClose() {
    setShowModal(false);
  }

  function handleEmojiClick(emojiName: string) {
    // Emit an event to the server with the emoji name and the room id
    props.socket.emit("emojiClicked", {
      emojiName: emojiName,
      roomId: props.room,
      address: props.address,
    });
    setShowModal(false);
  }

  // props.socket.once("displayEmoji", (emojiName: string) => {
  //   // Display the emoji to all users
  //   // The implementation of this will depend on how your frontend is set up
  //   displayEmoji(emojiName);
  // });

  useEffect(() => {
    // When the component mounts, start listening for 'displayEmoji' events
    props.socket.on("displayEmoji", (emojiName: string, address: string) => {
      // Display the emoji to all users
      // The implementation of this will depend on how your frontend is set up
      displayEmoji(emojiName, address);
    });

    // When the component unmounts, stop listening for 'displayEmoji' events
    return () => {
      props.socket.off("displayEmoji");
    };
  }, []);

  function displayEmoji(emojiName: string, address: string) {
    setCurrentEmoji({ name: emojiName, address });
    setTimeout(() => {
      setCurrentEmoji({ name: "", address: "" });
    }, 3000);
  }

  return (
    <>
      {currentEmoji.address === props.address && (
        <img
          className="emojiImage"
          src={emojiMap[currentEmoji.name as keyof typeof emojiMap]}
          alt={currentEmoji.name}
        />
      )}
      {address === props.address && (
        <Icon
          className="hoverIcon"
          width={30}
          icon="quill:chat"
          onClick={openModal}
        />
      )}

      <div
        id="myModal"
        className="modal"
        style={{ display: showModal ? "block" : "none" }}
      >
        <div className="modal-content">
          <div className="modal-content-header">
            <div style={{ visibility: "hidden" }}> &times;</div>
            <span className="close" onClick={onClickClose}>
              &times;
            </span>
          </div>
          <div className="emoji-grid">
            <img
              src={revolverEmoji}
              alt="emoji-1"
              onClick={() => handleEmojiClick("emoji-1")}
            />
            <img
              src={gunEmoji}
              alt="emoji-2"
              onClick={() => handleEmojiClick("emoji-2")}
            />
            <img
              src={compassEmoji}
              alt="emoji-3"
              onClick={() => handleEmojiClick("emoji-3")}
            />
            <img
              src={longfaceEmoji}
              alt="emoji-4"
              onClick={() => handleEmojiClick("emoji-4")}
            />
            <img
              src={handshakeEmoji}
              alt="emoji-5"
              onClick={() => handleEmojiClick("emoji-5")}
            />
            <img
              src={horseshoeEmoji}
              alt="emoji-6"
              onClick={() => handleEmojiClick("emoji-6")}
            />
            <img
              src={skullEmoji}
              alt="emoji-7"
              onClick={() => handleEmojiClick("emoji-7")}
            />
            <img
              src={meaninglessEmoji}
              alt="emoji-8"
              onClick={() => handleEmojiClick("emoji-8")}
            />
            <img
              src={cloverEnoji}
              alt="emoji-9"
              onClick={() => handleEmojiClick("emoji-9")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Emoji;
