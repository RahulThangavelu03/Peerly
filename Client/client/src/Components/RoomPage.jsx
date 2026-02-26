import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import { useParams, useLocation } from "react-router-dom";

function RoomPage({ socket, canSend, setCanSend, username }) {
  const { roomId } = useParams();
  const location = useLocation();
  const role = location.state?.role;
  const isHost = role === "host";

  const [pendingRequest, setPendingRequest] = useState(null);
  const [disableButton, setDisableButton] = useState(false);
  const [users, setUsers] = useState({});
  const [dataChannel, setDataChannel] = useState(null);

  const[selectedFile,setSelectedFile] = useState("")

  const peerRef = useRef(null);

  // File receive refs
  const receivedChunks = useRef([]);
  const receivedFileInfo = useRef(null);

  /* ---------------- CREATE / JOIN ROOM ---------------- */

  useEffect(() => {
    if (!socket) return;

    if (isHost) {
      socket.emit("create-room", roomId, username);
    } else {
      socket.emit("join-room", { roomId, username });
    }
  }, [socket, isHost, roomId, username]);

  /* ---------------- ROOM USERS ---------------- */

  useEffect(() => {
    if (!socket) return;

    const handleUsers = (usersList) => {
      setUsers(usersList);
    };

    socket.on("room-users", handleUsers);
    return () => socket.off("room-users", handleUsers);
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

    const channel = pc.createDataChannel("chat");
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
    channel.onopen = () => {
      console.log("Data channel open ✅");
    };

    channel.onmessage = (event) => {
      if (typeof event.data === "string") {
        const message = JSON.parse(event.data);

        if (message.type === "file-info") {
          receivedFileInfo.current = message;
          receivedChunks.current = [];
          console.log("Receiving file:", message.name);
          return;
        }



if (message.type === "file-complete") {

  console.log("File complete received");

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

console.log( typeof event.data,"Chunk type:;;;;;;;;;;;;;;;;");
      }
    };
  }

  /* ---------------- FILE SEND ---------------- */

    


 async function SendFile(file){


  if(!selectedFile) alert("No file selected")


    if (!dataChannel || dataChannel.readyState !== "open") {
      alert("No WebRTC connection");
      return;
    }






    const buffer = await file.arrayBuffer();
    const chunkSize = 16 * 1024;
    let offset = 0;

    dataChannel.send(JSON.stringify({
      type: "file-info",
      name: file.name,
      size: file.size,
      fileType: file.type
    }));

    while (offset < buffer.byteLength) {
      const chunk = buffer.slice(offset, offset + chunkSize);
      dataChannel.send(chunk);
      offset += chunkSize;
    }

    dataChannel.send(JSON.stringify({ type: "file-complete" }));
    console.log("File sent successfully 🚀");

setSelectedFile(null)

}



  /* ---------------- UI ---------------- */

  return (
    <div>
      <h2>Room Page</h2>

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
          onChange={(e)=>setSelectedFile( e.target.files[0])}
          disabled={!isHost && !canSend}
        /><br/><br/>
        <Button disabled ={!isHost && !canSend} variant="contained" onClick={(e)=>SendFile(selectedFile)} > Click to Send </Button>
      </div>
    </div>
  );
}

export default RoomPage;