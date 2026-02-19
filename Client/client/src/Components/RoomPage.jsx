import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useParams } from "react-router-dom";

function RoomPage({ socket, isHost, canSend ,setCanSend}) {
  const [pendingRequest, setPendingRequest] = useState(null);

  const [disableButton,setdisableButton] = useState(false)

  // Host listens for requests
  useEffect(() => {
    if (!isHost) return;

    socket.on("send-request", ({ requesterId }) => {
      setPendingRequest(requesterId);
    });

    return () => socket.off("send-request");
  }, [isHost, socket]);



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


  const roomId = useParams()

  console.log(roomId,"useprarms")

  function requestToSend() {


setdisableButton(true)


    socket.emit("request-send",roomId.roomId)

}



  function approveSend() {
    socket.emit("approve-send", pendingRequest);
    setPendingRequest(null);
  }




  console.log(canSend,"cansend")



  return (
    <div>
      <h2>Room Page</h2>

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
        <input type="file" disabled={!canSend} />
        <br />
        <Button variant="contained" disabled={!canSend}>
          Send File
        </Button>
      </div>
    </div>
  );
}

export default RoomPage;
