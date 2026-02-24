import { use, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useParams,useLocation } from "react-router-dom";
import { useRef } from "react";


function RoomPage({ socket, canSend ,setCanSend,username}) {
  const [pendingRequest, setPendingRequest] = useState(null);

  const [disableButton,setdisableButton] = useState(false)

  const [peerConnection, setPeerConnection] = useState(null);
const [dataChannel, setDataChannel] = useState(null);
const [users, setUsers] = useState({});
const [update,setUpdate] = useState(0)
const receivedChunks = useRef([]);
const receivedFileInfo = useRef(null);
const location = useLocation();

const role = location.state?.role;
const isHost = role === "host";


console.log(isHost,"ishostttttttttttttttttttttt")

const peerRef = useRef(null);

  // Host listens for requests
  useEffect(() => {
    if (!isHost) return;

    socket.on("send-request", ({ requesterId }) => {
      setPendingRequest(requesterId);
    });

    return () => socket.off("send-request");
  }, [isHost, socket]);




const { roomId } = useParams();

useEffect(() => {
  if (!socket) return;

  if (isHost) {
    socket.emit("create-room", roomId, username);
  } else {
    socket.emit("join-room", { roomId, username }, () => {});
  }

}, [socket, isHost, roomId, username]);



 useEffect(()=>{


socket.on("permission-update",({canSend})=>{

console.log(canSend,"canSend")

  setCanSend(canSend)


  if(!canSend){

setdisableButton(false)

  }
  
})

return ()=>socket.off("permission-update")


  },[socket,setCanSend])




useEffect(() => {
  if (!socket) return;

  const handleRoomUsers = (usersList) => {
    console.log("Users in room:", usersList);
    setUsers(usersList);
  };

  socket.on("room-users", handleRoomUsers);

  return () => {
    socket.off("room-users", handleRoomUsers);
  };
}, [socket]);




console.log(users,"users]]]]]]]]]]]]]")



  console.log(roomId,"useprarms")

  function requestToSend() {


setdisableButton(true)



    socket.emit("request-send", roomId)

}



  function approveSend() {
    socket.emit("approve-send", pendingRequest);
    setPendingRequest(null);
  }




  console.log(canSend,"cansend")





// Sender Side


async function startWebRTC(targetId) {

console.log( targetId,"startwebrtctccccccc")

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });
  peerRef.current = pc;


  const channel = pc.createDataChannel("chat");

  setPeerConnection(pc);
  setDataChannel(channel);

  channel.onopen = () => {
    console.log("Data channel open ✅");
  };

  channel.onmessage = (event) => {
    console.log("Received:", event.data);


    channel.onmessage = (event) => {
  if (typeof event.data === "string") {
    const message = JSON.parse(event.data);

    if (message.type === "file-info") {
      receivedFileInfo.current = message;
      receivedChunks.current = [];
      console.log("Receiving file:", message.name);
    }

    if (message.type === "file-complete") {
      const blob = new Blob(receivedChunks.current);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = receivedFileInfo.current.name;
      a.click();

      console.log("File received successfully 🎉");
    }
  } else {
    // Binary chunk
    receivedChunks.current.push(event.data);
  }
};

  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("webrtc-ice", {
        targetId,
        candidate: event.candidate
      });
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("webrtc-offer", {
    targetId,
    offer
  });
}


//Reciever Side//

useEffect(() => {


    if (!socket) return;
  socket.on("webrtc-offer", async ({ offer, senderId }) => {

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.ondatachannel = (event) => {
      const channel = event.channel;

      setDataChannel(channel);

      channel.onopen = () => {
        console.log("Receiver data channel open ✅");
      };

      channel.onmessage = (event) => {
        console.log("Received:", event.data);
      };
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice", {
          targetId: senderId,
          candidate: event.candidate
        });
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("webrtc-answer", {
      targetId: senderId,
      answer
    });


    

    setPeerConnection(pc);
  });


  socket.on("webrtc-answer", async ({ answer }) => {

      if (!peerRef.current) return;
  await peerRef.current.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
});

socket.on("webrtc-ice", async ({ candidate }) => {
  if (peerRef.current) {
    await peerRef.current.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  }
});


  return () => {
    socket.off("webrtc-offer");
    socket.off("webrtc-answer");
    socket.off("webrtc-ice");
  };

}, [socket]);



// Send Message//


function sendMessage() {
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send("Hello from Peerly 🚀");
  }
}




async function HandleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!dataChannel || dataChannel.readyState !== "open") {
    alert("No WebRTC connection");
    return;
  }

  const arrayBuffer = await file.arrayBuffer();

  const chunkSize = 16 * 1024; // 16KB
  let offset = 0;

  // Send file metadata first
  dataChannel.send(JSON.stringify({
    type: "file-info",
    name: file.name,
    size: file.size
  }));

  while (offset < arrayBuffer.byteLength) {
    const chunk = arrayBuffer.slice(offset, offset + chunkSize);
    dataChannel.send(chunk);
    offset += chunkSize;
  }

  // Notify transfer complete
  dataChannel.send(JSON.stringify({ type: "file-complete" }));

  console.log("File sent successfully 🚀");
}


  return (
    <div>
      <h2>Room Page</h2>
      


<h4>Users</h4>
{Object.entries(users).map(([id, user]) => (
  <div key={id}>
    {user.displayName}
    {id !== socket.id && (
      <button onClick={() => startWebRTC(id)}>
        Connect
      </button>
    )}
  </div>
))}

<button onClick={sendMessage}>Send Test Message</button>



      {/* ROLE INFO */}
      <p>
        Role: <b>{isHost ? "Host" : "Participant"}</b>
      </p>

      {/* HOST VIEW */}
      {isHost && (
        <div>
          <h4>Host Controls</h4>

          {pendingRequest ? (
            <Button variant="contained" onClick={approveSend}>
              Approve Send Request
            </Button>
          ) : (
            <p>No pending requests</p>
          )}

          
        </div>
      )}

      {/* PARTICIPANT VIEW */}
      {!isHost && (
        <div>
          {!canSend ? (
            <Button variant="contained" disabled={disableButton} onClick={requestToSend}>
              Request Permission to Send
            </Button>
          ) : (
            <p>You are allowed to send files</p>
          )}
        </div>
      )}

      {/* SHARED FILE SECTION */}
      <div style={{ marginTop: "20px" }}>
        <input type="file" onChange={HandleFileSelect} disabled={!canSend} />
        <br />
        <Button variant="contained" disabled={!canSend}>
          Send File
        </Button>
      </div>
    </div>
  );
}

export default RoomPage;
