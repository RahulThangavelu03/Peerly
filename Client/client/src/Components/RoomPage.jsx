import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import { useParams, useLocation } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { cardContentClasses } from "@mui/material/CardContent";

function RoomPage({ socket, canSend, setCanSend, username }) {
  const { roomId } = useParams();
  const location = useLocation();
  const role = location.state?.role;
  const isHost = role === "host";

  const [pendingRequest, setPendingRequest] = useState(null);
  const [disableButton, setDisableButton] = useState(false);
  const [users, setUsers] = useState({});
  const [dataChannel, setDataChannel] = useState(null);
  const [roomCode,setRoomCode] = useState("")

  const[selectedFile,setSelectedFile] = useState("")


  const [sendProgress,setSendProgress] = useState(0)
  const [receiveProgress,setReceiveProgress] = useState(0)

  const [headCount,setHeadCount] = useState(0)


  const peerRef = useRef(null);

const receivedBytes = useRef(0)
const fileInputRef = useRef(null)
const cancelSendRef = useRef(false);

  // File receive refs
  const receivedChunks = useRef([]);
  const receivedFileInfo = useRef(null);

  /* ---------------- CREATE / JOIN ROOM ---------------- */

  useEffect(() => {
    if (!socket) return;

    setRoomCode(roomId)
    if (isHost) {
      socket.emit("create-room", roomId, username);
    } else {
      socket.emit("join-room", { roomId, username });
    }
  }, [socket, isHost, roomId, username]);

  /* ---------------- ROOM USERS ---------------- */



useEffect(() => {
  if (!socket) return;

  const handler = (data) => {
    setUsers(data);
  };

  socket.on("room-users", handler);

  return () => socket.off("room-users", handler);
}, [socket]);



  /* ---------------- Host Disconnects---------------- */


function HandleRoomExit(socket){

  if(!socket) return 



  socket.disconnect(); // this triggers real disconnect
  window.location.href = "/";


}



  useEffect(() => {
  if (!socket) return;

  socket.on("room-closed", ({ message }) => {
    alert(message);

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    window.location.href = "/";
  });

  return () => socket.off("room-closed");
}, [socket]);



  /* ---------------- PERMISSION SYSTEM ---------------- */

  useEffect(() => {
    if (!socket) return;

    socket.on("permission-update", ({ canSend }) => {
      setCanSend(canSend);
      if (!canSend) setDisableButton(false);
    });

    return () => socket.off("permission-update");
  }, [socket, setCanSend]);

  useEffect(() => {
    if (!isHost || !socket) return;

    socket.on("send-request", ({ requesterId }) => {
      setPendingRequest(requesterId);
    });

    return () => socket.off("send-request");
  }, [isHost, socket]);

  function requestToSend() {
    setDisableButton(true);
    socket.emit("request-send", roomId);
  }

  function approveSend() {
    socket.emit("approve-send", pendingRequest);
    setPendingRequest(null);
  }

  /* ---------------- WEBRTC CONNECTION ---------------- */

  async function startWebRTC(targetId) {
    if (peerRef.current) {
      console.log("Already connected");
      return;
    }

    console.log("Connecting to:", targetId);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerRef.current = pc;

  
    const channel = pc.createDataChannel("file", {
  ordered: false,
  maxRetransmits: 0
});

    setupDataChannel(channel);
    setDataChannel(channel);

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

    socket.emit("webrtc-offer", { targetId, offer });


    console.log("offer-sent")
  }

  /* ---------------- RECEIVE OFFER ---------------- */

  useEffect(() => {
    if (!socket) return;

    socket.on("webrtc-offer", async ({ offer, senderId }) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      peerRef.current = pc;

      pc.ondatachannel = (event) => {
        const channel = event.channel;
        setupDataChannel(channel);
        setDataChannel(channel);
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

  /* ---------------- DATA CHANNEL LOGIC ---------------- */

  function setupDataChannel(channel) {
   
     channel.binaryType = "arraybuffer";
 channel.onopen = () => {
  console.log("Data channel open ✅");
 
};

console.log(message,"messageeeeeeeeeeeeeeeee")


if (message.type === "file-cancel") {
  console.log("Sender cancelled transfer");

  receivedChunks.current = [];
  receivedFileInfo.current = null;
  receivedBytes.current = 0;

  setReceiveProgress(0);

  alert("File transfer cancelled by sender");
  return;
}


    channel.onmessage = (event) => {

      if (typeof event.data === "string") {
        const message = JSON.parse(event.data);
        console.log(event.data.byteLength,"Chunk received::::::::::::");

        if (message.type === "file-info") {
          receivedFileInfo.current = message;
          receivedChunks.current = [];
          console.log("Receiving file:", message.name);
            receivedBytes.current = 0; 
          setReceiveProgress(0);
            console.log("Receiving file:", message.name);
          return;
        }



if (message.type === "file-complete") {

    console.log("🔥 FILE COMPLETE RECEIVED");
  

  const blob = new Blob(receivedChunks.current, {
    type: receivedFileInfo.current?.fileType || "application/octet-stream"
  });

  console.log("Blob size:", blob.size);

  if (blob.size === 0) {
    console.log("Blob is empty ❌");
    return;
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = receivedFileInfo.current?.name || "downloaded-file";
  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  console.log("Download triggered 🎉");
}





      } else {
        
receivedChunks.current.push(event.data);
receivedBytes.current += event.data.byteLength;

const progress = Math.floor(
  (receivedBytes.current / receivedFileInfo.current?.size) * 100
);

setReceiveProgress(progress);


//






      }
    };
  }

  /* ---------------- FILE SEND ---------------- */

    
async function sendFile(file) {




 

 if (!file) {
    alert("No file selected");
    return;
  }

  
    if (!dataChannel || dataChannel.readyState !== "open") {
      alert("No WebRTC connection");
      return;
    }


  cancelSendRef.current = false;

  const chunkSize = 512 * 1024; 


  dataChannel.send(JSON.stringify({
    type: "file-info",
    name: file.name,
    size: file.size,
    fileType: file.type
  }));


 dataChannel.bufferedAmountLowThreshold = 1 * 1024 * 1024; // 1MB


let offSet= 0



  while (offSet < file.size) {



      if (cancelSendRef.current) {
    console.log("Transfer cancelled ❌");

    dataChannel.send(JSON.stringify({
      type: "file-cancel"
    }));

    setSendProgress(0);
    return;

  }


    if (dataChannel.bufferedAmount > 5 * 1024 * 1024) {
      await new Promise(resolve => {
        dataChannel.onbufferedamountlow = resolve;
      });
    }

    const chunk = file.slice(offSet, offSet + chunkSize);
    const buffer = await chunk.arrayBuffer();

    dataChannel.send(buffer);



    offSet += buffer.byteLength;



const progress = Math.min(
  Math.floor((receivedBytes.current / receivedFileInfo.current.size) * 100),
  100
);
setSendProgress(progress);


  }

  dataChannel.send(JSON.stringify({ type: "file-complete" }));
   console.log("File sent successfully 🚀");
  setSelectedFile(0)

if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
  console.log(sendProgress,"sendprogressss??????????????")
setTimeout(() => setSendProgress(0), 2000);


}


console.log(selectedFile,"selctefile??????????????????????/")

console.log(sendProgress,"sendprogresssssssssssssss")




function HandleCancelSend(){


  cancelSendRef.current = true;


}
  /* ---------------- UI ---------------- */






  return (
    <div>
      <h2>Room Page</h2>
      <Button variant ="contained" color="error" onClick={()=>HandleRoomExit(socket)} >Leave Room</Button>
      <p>RoomCode : {roomId}</p>
      {sendProgress > 0 && (
  <div style={{ marginTop: "10px" }}>
    <Typography>Sending: {sendProgress}%</Typography>
    <LinearProgress variant="determinate" value={sendProgress} />
  </div>
)}<br></br>
<p>Members in room: {Object.keys(users).length}</p>

{receiveProgress > 0 && (
  <div style={{ marginTop: "10px" }}>
    <Typography>Receiving: {receiveProgress}%</Typography>
    <LinearProgress variant="determinate" value={receiveProgress} />
  </div>
)}

      <h4>Users</h4>
      {Object.entries(users).map(([id, user]) => (
        <div key={id}>
          {user.displayName}

          {/* Host sees Connect button only for others */}
          {isHost && id !== socket.id && (
            <button onClick={() => startWebRTC(id)}>
              Connect
            </button>
          )}
        </div>
      ))}

    

      <p>
        Role: <b>{isHost ? "Host" : "Participant"}</b>
      </p>

      {isHost && (
        <div>
          {pendingRequest ? (
            <Button variant="contained" onClick={approveSend}>
              Approve Send Request
            </Button>
          ) : (
            <p>No pending requests</p>
          )}


          
        </div>
      )}

      {!isHost && (
        <div>
          {!canSend ? (
            <Button
              variant="contained"
              disabled={disableButton}
              onClick={requestToSend}
            >
              Request Permission to Send
            </Button>
          ) : (
            <p>You are allowed to send files</p>
          )}
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e)=>setSelectedFile( e.target.files[0])}
          disabled={!isHost && !canSend}
        /><br/><br/>
 

        <Button disabled ={!isHost && !canSend} variant="contained" onClick={()=>sendFile(selectedFile)} > Click to Send </Button>
        

        <Button disabled ={!isHost && !canSend} variant="contained" color="error" onClick={()=>HandleCancelSend()} > Cancel Send </Button>

        
      </div>
    </div>
  );
}

export default RoomPage;