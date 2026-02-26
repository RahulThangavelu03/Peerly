const express = require("express"); 
const http = require("http"); const { Server } = require("socket.io"); 
const cors = require("cors"); const app = express(); app.use(cors()); 
const server = http.createServer(app); 
const rooms={}
const io = new Server(server, { cors: { origin: "*", }, });



io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create-room", (roomId,username) => {
socket.data.roomId = roomId;

console.log(socket.data.roomId,"socket.data.roomID 16")

    rooms[roomId] = {
      hostId: socket.id,
      users: {

        [socket.id]: { canSend: true , name:username,  displayName: `${username} (${socket.id.slice(0,4).toUpperCase()})` }
      }
    };



    socket.join(roomId);

    socket.emit("room-users", rooms[roomId].users);  // send only to this user
io.to(roomId).emit("room-users", rooms[roomId].users);
    console.log(rooms[roomId],"roomId-roomuser 30000///////////////") 


    socket.emit("room-role", {
      isHost: true,
      canSend: true
    });
  });



  socket.on("join-room", ({ roomId, username }, callback) => {

  socket.data.roomId = roomId;

  // Room does not exist
  if (!rooms[roomId]) {
    console.log("Room not found");

    if (typeof callback === "function") {
      callback({ success: false, message: "Room not found" });
    }
    return;
  }

  // Add user
  rooms[roomId].users[socket.id] = {
    canSend: false,
    name: username,
    displayName: `${username} (${socket.id.slice(0,4).toUpperCase()})`
  };

  socket.join(roomId);

  // Update everyone in room
  io.to(roomId).emit("room-users", rooms[roomId].users);

  socket.emit("room-role", {
    isHost: false,
    canSend: false
  });

  console.log("User joined:", username);

  if (typeof callback === "function") {
    callback({ success: true });
  }

});

  



  socket.on("request-send", (roomId) => {


    console.log(roomId,"propsroomid")

    console.log(socket.data,"scoket,data 67")

   socket.data.roomId = roomId

     console.log(socket.data.roomId,"scoket,data.roomId 71")

  if (!roomId || !rooms[roomId]) return;

  const hostId = rooms[roomId].hostId;

  console.log(hostId,"hhostIIDDDDDDd")

  io.to(hostId).emit("send-request", {
    requesterId: socket.id
  });
});




  socket.on("approve-send", (targetId) => {


    const roomId = socket.data.roomId;

if (!rooms[roomId] || !rooms[roomId].users[targetId]) return;

    rooms[roomId].users[targetId].canSend = true;

    io.to(targetId).emit("permission-update", {
      canSend: true
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });



//WebRTC//


socket.on("webrtc-offer", ({ targetId, offer }) => {
  io.to(targetId).emit("webrtc-offer", {
    offer,
    senderId: socket.id
  });
});

socket.on("webrtc-answer", ({ targetId, answer }) => {
  io.to(targetId).emit("webrtc-answer", {
    answer
  });
});

socket.on("webrtc-ice", ({ targetId, candidate }) => {
  io.to(targetId).emit("webrtc-ice", {
    candidate
  });
});







});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


