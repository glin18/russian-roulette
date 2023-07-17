const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);
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

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("joinRandomRoom", (data) => {
    console.log("joinRandomRoom event received from:", socket.id);

    // Extract roomIds from publicRooms
    const roomIds = Object.keys(publicRooms);

    // Look for a room that isn't full (less than 4 players)
    let room = roomIds.find((roomId) => publicRooms[roomId]?.length < 4);

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
      gamesData[room] = {
        players: publicRooms[room],
        room: room,
        currentTurn: 0, // Index of the player whose turn it is
        playersAlive: [true, true, true, true], // All players start off alive
        playersShot: [false, false, false, false], // Nobody has shot yet
      };
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
    console.log("user disconnected", socket.id);
    if (playerData[socket.id]?.type === "Private") {
      privateRooms[playerData[socket.id]?.room] = privateRooms[
        playerData[socket.id]?.room
      ]?.filter((address) => address != playerData[socket.id].address);
    } else {
      publicRooms[playerData[socket.id]?.room] = publicRooms[
        playerData[socket.id]?.room
      ]?.filter((address) => address != playerData[socket.id].address);
    }
    delete playerData[socket.id];
  });

  socket.on("fired", (room) => {
    let alive = true;
    console.log(room);
    console.log("GAMEDATA", gamesData[String(room)]);

    if (Math.floor(Math.random() * 6) + 1 >= 4) {
      console.log("PLAYER DEAD");
      alive = false;
      gamesData[String(room)]["playersAlive"][
        gamesData[String(room)]["currentTurn"]
      ] = false;
    }
    gamesData[String(room)]["currentTurn"] =
      (gamesData[String(room)]["currentTurn"] + 1) % 4;
    console.log("GAMEDATA", gamesData[String(room)]);
    io.in(room).emit("fired", gamesData[String(room)]);
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
