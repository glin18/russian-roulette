import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import ScrollToBottom from "react-scroll-to-bottom";
import { useAccount } from "wagmi";

type messageData = {
  room: string;
  address: string;
  message: string;
  time: string;
};

const ChatRoom = (props: { socket: any; room: string }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<messageData[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const { address } = useAccount();

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: props.room,
        address: address,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      console.log("ChatRoom", messageData);

      // Emit the message to the server but don't add it to the state here
      await props.socket.emit("send_message", messageData);

      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const receiveMessage = (data: messageData) => {
      setMessageList((list) => [...list, data]);
    };

    // Listen for messages
    props.socket.on("receive_message", receiveMessage);

    // Cleanup function
    return () => {
      props.socket.off("receive_message", receiveMessage);
    };
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <Icon
          className="hoverIcon"
          width={30}
          icon="charm:power"
          onClick={() => setIsChatVisible(!isChatVisible)}
        />
        <p>Live Chat</p>
      </div>
      {isChatVisible ? (
        <>
          {" "}
          <div className="chat-body">
            <ScrollToBottom className="message-container">
              {messageList.map((messageContent) => {
                return (
                  <div
                    className="message"
                    id={
                      address === messageContent.address ? "you" : "other"
                    }
                  >
                    <div>
                      <div className="message-content">
                        <p>{messageContent.message}</p>
                      </div>
                      <div className="message-meta">
                        <p id="time">{messageContent.time}</p>
                        <p id="author">
                          {messageContent.address?.slice(0, 6) +
                            "..." +
                            messageContent.address?.slice(-3)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </ScrollToBottom>
          </div>
          <div className="chat-footer">
            <input
              type="text"
              value={currentMessage}
              placeholder="Hey..."
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyPress={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            />
            <button onClick={sendMessage}>&#9658;</button>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChatRoom;
