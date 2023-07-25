import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import Emoji from "./Emoji";

function GamerDetails(props: {
  address: string;
  died: boolean;
  shot: boolean;
  gamerNumber: Number;
  socket: any;
  room: string;
}) {
  return (
    <div>
      {props.address !== "WAITING" && props.address !== "disconnected" ? (
        <div className="jazzicon-emoji">
          <Jazzicon diameter={50} seed={jsNumberForAddress(props.address)} />
          <Emoji
            socket={props.socket}
            room={props.room}
            address={props.address}
          />
        </div>
      ): null}
      <div className="gamer-address">
        <a
          href={"https://etherscan.io/address/" + props.address}
          target="_blank"
          className={props.address === "WAITING" || props.address === "disconnected" ? "a-disable" : ""}
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
