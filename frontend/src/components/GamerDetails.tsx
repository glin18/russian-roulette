import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import Emoji from "./Emoji";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

function GamerDetails(props: {
  address: string;
  died: boolean;
  shot: boolean;
  gamerNumber: Number;
  socket: any;
  room: string;
}) {
  const [isSkull, setIsSkull] = useState(false);

  useEffect(() => {
    props.socket.on("fired2", (data: any, address: string) => {
        if (address === props.address) {
            const isPlayerAlive = data.playersAlive[address];
            console.log("fired data received", isPlayerAlive);
            setIsSkull(true);
            const interval = setInterval(() => {
                setIsSkull((prev) => !prev);
            }, 100); // switch every 100 ms

            setTimeout(() => {
                clearInterval(interval);
                setIsSkull(!isPlayerAlive); // after flashing, the icon depends on the most recent alive status
                console.log("isPlayerAlive", isPlayerAlive);
            }, 3000);
        }
    });

    return () => {
        props.socket.off("fired2");
    };
}, []);

  return (
    <div>
      {props.address !== "WAITING" && props.address !== "disconnected" ? (
        <div className="jazzicon-emoji">
          {isSkull ? (
            <Icon width={50} icon="healthicons:skull" />
          ) : (
            <Jazzicon diameter={50} seed={jsNumberForAddress(props.address)} />
          )}
          <Emoji
            socket={props.socket}
            room={props.room}
            address={props.address}
          />
        </div>
      ) : null}
      <div className="gamer-address">
        <a
          href={"https://etherscan.io/address/" + props.address}
          target="_blank"
          className={
            props.address === "WAITING" || props.address === "disconnected"
              ? "a-disable"
              : ""
          }
        >
          Gamer {String(props.gamerNumber)}:{" "}
          {props.address === "WAITING"
            ? "WAITING..."
            : props.address === "disconnected"
            ? "DISCONNECTED"
            : props.address?.slice(0, 6) + "..." + props.address?.slice(-3)}
        </a>
      </div>
      <div>{props.died ? "DEAD" : "ALIVE"}</div>
      <div>{props.shot ? "FIRED" : "NOT FIRED"}</div>
    </div>
  );
}

export default GamerDetails;
