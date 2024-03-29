import express from "express";
const app = express();
import http_ from "http";
import cors from "cors";
import { Server } from "socket.io";
app.use(cors());
import { abi } from "./abi.js";
import { walletABI } from "./walletABI.js";
import "dotenv/config";
import { createPublicClient, createWalletClient, http } from "viem";
import { arbitrumGoerli } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// const CONTRACT_ADDRESS = "0xE029d61A45a0315AbDa8F188c0cF6eFDB70f8432";
const CONTRACT_ADDRESS = "0x5ac075eA858601d82b3518077d5132d3ba9D2D46";
const WALLET_CONTRACT_ADDRESS = "0xa9f2950DeE0FfbF8a833C61a731661946d838d22";

const client = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

const walletClient = createWalletClient({
  account,
  chain: arbitrumGoerli,
  transport: http(),
});

const testingdata = await client.readContract({
  address: CONTRACT_ADDRESS,
  abi: abi,
  functionName: "rooms",
  args: [1],
});
console.log(testingdata);

// console.log(data);

const server = http_.createServer(app);
const publicRooms = {};
const privateRooms = {};
const playerData = {};
const gamesData = {};

// type playerData = {
//   socketId: {roomId: String, address: String}
// };

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

function generateRoomId() {
  // Simple random number as room ID, add more complex logic for production
  return Math.floor(Math.random() * 10000).toString();
}

const fireVRF = async (room) => {
  await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "fire",
    args: [room],
    account,
  });
};

const cashOut = async (aliveNumber, addresslist) => {
  await walletClient.writeContract({
    address: WALLET_CONTRACT_ADDRESS,
    abi: walletABI,
    functionName: "cashOut",
    args: [aliveNumber, addresslist],
    account,
  });
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("joinRandomRoom", (data) => {
    console.log("joinRandomRoom event received from:", socket.id);

    // Extract roomIds from publicRooms
    const roomIds = Object.keys(publicRooms);

    // Look for a room that isn't full (less than 4 players) and doesn't have a game in progress
    let room = roomIds.find(
      (roomId) => publicRooms[roomId]?.length < 4 && !gamesData[roomId]
    );

    if (!room) {
      // If no available room, create a new one
      console.log("No available room. Creating a new one.");
      room = generateRoomId();
      publicRooms[room] = [];
    } else {
      console.log("Found a room with available space:", room);
    }

    // Add the player (socket.id) to the room
    publicRooms[room].push(data.address);
    playerData[socket.id] = {
      address: data.address,
      room: room,
      type: "Public",
      shoot: false,
      dead: false,
    };
    console.log(
      "Added player to the room:",
      room,
      ". Players:",
      publicRooms[room]
    );

    // Make the socket join the room on the socket.io server
    socket.join(room);

    // Notify the client they have successfully joined the room
    io.in(room).emit("joinedRoom", {
      roomId: room,
      players: publicRooms[room],
      socketID: socket.id,
    });

    if (publicRooms[room].length === 3) {
      fireVRF(room);
      const playerShotObj = {};
      const playerAliveObj = {};
      const prevAliveObj = {};
      publicRooms[room].forEach((player) => {
        playerShotObj[player] = false;
        playerAliveObj[player] = true;
        prevAliveObj[player] = true; // Initialize previous alive status
      });
      gamesData[room] = {
        players: publicRooms[room],
        room: room,
        currentTurn: 0, // Index of the player whose turn it is
        prevAlive: prevAliveObj, // Previous round's alive status
        playersAlive: playerAliveObj, // All players start off alive
        playersShot: playerShotObj, // Nobody has shot yet
        // round: 1,
      };
      console.log(gamesData);
      io.in(room).emit("gameStart", gamesData[room]);
    }

    console.log("Notified player about joined room:", room);
  });

  // When the server receives a 'createPrivateRoom' event...
  socket.on("createPrivateRoom", (data) => {
    // Generate a new room ID
    let room = generateRoomId();

    // Initialize the new room in the privateRooms object with the socket's ID
    privateRooms[room] = [data.address];
    playerData[socket.id] = {
      address: data.address,
      room: room,
      type: "Private",
    };

    // Make the socket join the new room
    socket.join(room);
    console.log("Created private room:", room, "with player:", data.address);

    // Emit a 'roomCreated' event back to the client, including the room ID
    socket.emit("roomCreated", { roomId: room, players: privateRooms[room] });
  });

  socket.on("joinPrivateRoom", (data) => {
    console.log("joinPrivateRoom event received from:", socket.id);
    console.log("Data received:", data);

    let room = data.roomId;
    console.log(`Attempting to join private room: ${room}`);

    if (!privateRooms[room]) {
      console.log(`Room ${room} does not exist.`);
      socket.emit("error", { message: "Room does not exist." });
      return;
    }

    if (privateRooms[room].length >= 4) {
      console.log(`Room ${room} is full.`);
      socket.emit("error", { message: "Room is full." });
      return;
    }

    if (gamesData[room]) {
      console.log(`Game in room ${room} has already started.`);
      socket.emit("error", {
        message: "Cannot join room, game has already started.",
      });
      return;
    }

    console.log(`Room ${room} exists and is not full. Adding player to room.`);
    privateRooms[room].push(data.address);
    playerData[socket.id] = {
      address: data.address,
      room: room,
      type: "Private",
    };

    console.log(
      `Player added to room ${room}. Current players:`,
      privateRooms[room]
    );

    socket.join(room);
    console.log(`Player ${data.address} joined room ${room}.`);

    io.emit("joinedRoom", {
      roomId: room,
      players: privateRooms[room],
      socketID: socket.id,
    });
    console.log(
      `Sent joinedRoom event to player ${data.address} with room ID ${room}.`
    );
    // Check if room has reached 3 players
    if (privateRooms[room].length === 3) {
      gamesData[room] = {
        players: privateRooms[room],
        room: room,
        currentTurn: 0, // Index of the player whose turn it is
        // prvAlive: [true, true, true, true], // All players previous start off alive
        playersAlive: [true, true, true, true], // All players start off alive
        playersShot: [false, false, false, false], // Nobody has shot yet
      };
      io.in(room).emit("gameStart", gamesData[room]);
    }
  });

  socket.on("leaveRoom", (data) => {
    console.log("leaveRoom event received from:", socket.id);
    console.log("Data received:", data);

    let room = data.roomId;
    let currentPlayers;
    console.log(`Attempting to leave room: ${room}`);

    // If the player is in a public room...
    if (publicRooms[room]) {
      console.log(
        `Player ${socket.id} is in public room ${room}. Removing player from room.`
      );
      // Remove the player from the room
      publicRooms[room] = publicRooms[room].filter(
        (player) => player !== playerData[socket.id].address
      );
      console.log(`Player ${socket.id} removed from public room ${room}.`);
      currentPlayers = publicRooms[room];

      // If there are no more players in the room, delete the room
      if (publicRooms[room].length === 0) {
        console.log(`Room ${room} is empty. Deleting room.`);
        delete publicRooms[room];
        console.log(`Room ${room} deleted.`);
      }
    } else if (privateRooms[room]) {
      console.log(
        `Player ${socket.id} is in private room ${room}. Removing player from room.`
      );
      // Remove the player from the room
      privateRooms[room] = privateRooms[room].filter(
        (player) => player !== playerData[socket.id].address
      );
      console.log(`Player ${socket.id} removed from private room ${room}.`);
      currentPlayers = privateRooms[room];

      // If there are no more players in the room, delete the room
      if (privateRooms[room].length === 0) {
        console.log(`Room ${room} is empty. Deleting room.`);
        delete privateRooms[room];
        console.log(`Room ${room} deleted.`);
      }
    } else {
      console.log(`Player ${socket.id} is not in room ${room}.`);
    }
    console.log(currentPlayers);

    delete playerData[socket.id];

    // Make the socket leave the room
    socket.leave(room);
    console.log(`Player ${socket.id} left room ${room}.`);

    // Emit a 'roomLeft' event back to the client, including the room ID
    io.in(room).emit("roomLeft", { roomId: room, players: currentPlayers });
    console.log(
      `Sent roomLeft event to player ${socket.id} with room ID ${room}.`
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    let room = playerData[socket.id]?.room;
    let type = playerData[socket.id]?.type;
    let address = playerData[socket.id]?.address;
    let roomList = type === "Private" ? privateRooms : publicRooms;
    if (room && type && gamesData[room]) {
      // set the player as dead in game data
      let playerIndex = gamesData[room].players.findIndex(
        (playerAddress) => playerAddress === address
      );
      console.log("playerIndex", playerIndex);
      if (playerIndex > -1) {
        gamesData[room].playersAlive[playerIndex] = false;
        // Notify other players in the room about this disconnection
        // io.in(room).emit("playerDisconnected", gamesData[room]);
        roomList[room][playerIndex] = "disconnected";
        console.log(roomList, roomList[room]);
      }
    } else {
      roomList[room] = roomList[room]?.filter(
        (playerAddress) => playerAddress !== address
      );
    }

    delete playerData[socket.id];
    // Emit a 'roomLeft' event back to the client, including the room ID
    io.in(room).emit("roomLeft", { roomId: room, players: roomList[room] });
    console.log(
      `Sent roomLeft event to player ${socket.id} with room ID ${room}.`
    );
    // Emit a 'roomGamesDataLeft' event back to the client, including the room ID
    io.in(room).emit("roomGamesDataLeft", gamesData[room]);
  });

  socket.on("fired", async (room, address) => {
    console.log(room);
    console.log("GAMEDATA", gamesData[String(room)]);

    const fireData = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "getRoomFiredResults",
      args: [room],
    });
    console.log(fireData);

    // Store current alive status to previous before updating it
    gamesData[String(room)]["prevAlive"] = {
      ...gamesData[String(room)]["playersAlive"],
    };

    gamesData[String(room)]["playersAlive"][address] = Boolean(
      fireData[gamesData[String(room)]["currentTurn"]]
    );

    gamesData[String(room)]["currentTurn"] =
      (gamesData[String(room)]["currentTurn"] + 1) % 3;

    gamesData[String(room)]["playersShot"][address] = true;
    console.log("GAMEDATA", gamesData[String(room)]);
    io.in(room).emit("fired", gamesData[String(room)], address);
    io.in(room).emit("fired2", gamesData[String(room)], address);
  });

  socket.on("newRound", (room) => {
    fireVRF(room);

    gamesData[String(room)]["currentTurn"] = 0;
    // // const playerShotObj = {};
    // gamesData[String(room)]["round"]++;
    publicRooms[room].forEach((player) => {
      console.log(player);
      if (gamesData[String(room)]["playersAlive"][player]) {
        gamesData[String(room)]["playersShot"][player] = false;
      }
    });
    console.log("NEW ROUND DATA", gamesData[String(room)]);
    io.in(room).emit("newRound", gamesData[String(room)]);
  });

  socket.on("gameOver", (room) => {
    console.log("GAME OVER");
    console.log("GAME OVER");

    const roomData = gamesData[String(room)];
    const { playersAlive, prevAlive } = roomData;

    // Count the number of alive players
    const alivePlayers = Object.keys(playersAlive).filter(
      (player) => playersAlive[player]
    );

    let aliveAddressList = [];
    let aliveNumber = 0;

    if (alivePlayers.length === 0) {
      // If all players died, use prevAlive data
      aliveAddressList = Object.keys(prevAlive).filter(
        (player) => prevAlive[player]
      );
      aliveNumber = 4 - aliveAddressList.length;
    } else {
      // If some players are alive, use current round data
      aliveAddressList = alivePlayers;
      aliveNumber = 4 - alivePlayers.length;
    }

    // Call cashout function
    try {
      console.log("cashout function called", aliveNumber, aliveAddressList)
      const result = cashOut(aliveNumber, aliveAddressList);
      console.log(result);
    } catch (error) {
      console.error("Error while calling the cashout function:", error);
    }

    io.in(room).emit("gameOver");
  });

  //   socket.on("startGame", ({ roomId }) => {
  //     console.log(socket.id, "started game in room", roomId);
  //     // Get the room type from playerData
  //     let roomType = playerData[socket.id].type;

  //     let playersInRoom = roomType === 'Public' ? publicRooms[roomId] : privateRooms[roomId];

  //     // Assume roomId is valid and room is full
  //     let game = {
  //       gameId: roomId,
  //       players: playersInRoom,
  //       gameState: {
  //         currentTurn: 0, // Index of the player whose turn it is
  //         playersAlive: [true, true, true, true], // All players start off alive
  //         playersShot: [false, false, false, false], // Nobody has shot yet
  //       },
  //     };

  //     games[game.gameId] = game;

  //     socket.emit("gameStarted", game);
  //   });
  socket.on("emojiClicked", ({ emojiName, roomId, address }) => {
    console.log(
      "emojiClicked event received from:",
      socket.id + " " + emojiName + " " + roomId
    );
    // Broadcast the emoji name to all users in the room
    io.to(roomId).emit("displayEmoji", emojiName, address);
  });

  socket.on("send_message", (messageData) => {
    console.log(
      "chatMessage event received from:",
      messageData.room +
        " " +
        messageData.address +
        " " +
        messageData.message +
        " " +
        messageData.time
    );
    // Broadcast the message to all users in the room
    io.to(messageData.room).emit("receive_message", messageData);
  });
});

server.listen(3001, () => {
  console.log("Server is running on *:3001");
});
