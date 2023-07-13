function GamerDetails(props: {
  address: string;
  died: boolean;
  shot: boolean;
  gamerNumber: Number;
}) {
  return (
    <div>
      <div className="gamer-address">
        <a
          href={"https://etherscan.io/address/" + props.address}
          target="_blank"
        >
          Gamer {String(props.gamerNumber)}:{" "}
          {props.address.slice(0, 6) + "..." + props.address.slice(-3)}
        </a>
      </div>
      <div>{props.died ? "DEAD" : "ALIVE"}</div>
      <div>{props.shot ? "FIRED" : "NOT FIRED"}</div>
    </div>
  );
}

export default GamerDetails;
