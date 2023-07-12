const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);
const publicRooms = {};
const privateRooms = {};

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

  socket.on("joinRandomRoom", () => {
    console.log("joinRandomRoom event received from:", socket.id);

    // Extract roomIds from publicRooms
    const roomIds = Object.keys(publicRooms);

    // Look for a room that isn't full (less than 4 players)
    let room = roomIds.find((roomId) => publicRooms[roomId].length < 4);

    if (!room) {
      // If no available room, create a new one
      console.log("No available room. Creating a new one.");
      room = generateRoomId();
      publicRooms[room] = [];
    } else {
      console.log("Found a room with available space:", room);
    }

    // Add the player (socket.id) to the room
    publicRooms[room].push(socket.id);
    console.log(
      "Added player to the room:",
      room,
      ". Players:",
      publicRooms[room]
    );

    // Make the socket join the room on the socket.io server
    socket.join(room);

    // Notify the client they have successfully joined the room
    socket.emit("joinedRoom", { roomId: room });
    console.log("Notified player about joined room:", room);
  });

  // When the server receives a 'createPrivateRoom' event...
  socket.on("createPrivateRoom", () => {
    // Generate a new room ID
    let room = generateRoomId();

    // Initialize the new room in the privateRooms object with the socket's ID
    privateRooms[room] = [socket.id];

    // Make the socket join the new room
    socket.join(room);
    console.log("Created private room:", room, "with player:", socket.id)

    // Emit a 'roomCreated' event back to the client, including the room ID
    socket.emit("roomCreated", { roomId: room });
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
    privateRooms[room].push(socket.id);
    
    console.log(`Player added to room ${room}. Current players:`, privateRooms[room]);
  
    socket.join(room);
    console.log(`Player ${socket.id} joined room ${room}.`);
  
    socket.emit("joinedRoom", { roomId: room });
    console.log(`Sent joinedRoom event to player ${socket.id} with room ID ${room}.`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server is running on *:3001");
});
