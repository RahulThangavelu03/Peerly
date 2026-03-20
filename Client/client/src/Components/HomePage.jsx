import React from "react"
 import {io} from "socket.io-client"
 import Button from '@mui/material/Button';
 import TextField from '@mui/material/TextField';
import { useEffect,useState } from "react";

import { useNavigate } from "react-router-dom";


function HomePage({socket,setinRoom,setroomId,username,setUserName}){


const Navigate = useNavigate()
const [joinId,setjoinId] = useState("")

const[createRoomUserName,setCreateRoomUserName] = useState("")

const [joinRoomUserName,setJoinRoomUserName] = useState("")

const [createSubmitted, setCreateSubmitted] = useState(false)
const [joinroomSubmitted, setJoinRoomSubmitted] = useState(false)




const CreateRoom=(e)=>
  {

e.preventDefault()

    


  setCreateSubmitted(true);



   if (!createRoomUserName || createRoomUserName.trim() === "") {
    return;
  }



setUserName(createRoomUserName)

 function generateRandomAlphaNumeric(length) {

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }


    return result;
}


const roomId= generateRandomAlphaNumeric(8)


setinRoom(true)


Navigate(`/room/${roomId}`, { state: { role: "host" } })




  

}



const JoinRoom = (e) => {

e.preventDefault()



  setJoinRoomSubmitted(true);

 if (!joinRoomUserName || joinRoomUserName.trim() === "") {
    return;
  }




  setUserName(joinRoomUserName)

  // socket.emit("join-room", { roomId: joinId, username :joinRoomUserName }, (response) => {

  //   if (!response?.success) {
  //     alert(response?.message || "Room not found");
  //     return;
  //   }

  //   setinRoom(true);
  //   Navigate(`/room/${joinId}`, { state: { role: "participant" } });

  // });




  Navigate(`/Lobby/${joinId}`)










};



    return(

        <div id="HomePage">



<div id="IntroSection">


<div>
   Real-Time File Transfer 

</div>



<div id="FormSection">
  
  Create a room, share the code, and transfer files      
               instantly between devices.
</div>

</div>



<div id="form">


  <form id="CreateRoom" onSubmit={(e)=>CreateRoom(e)}>
    <div className="Card_Head">Create Room</div>


<TextField   placeholder="Enter Your Name"  value={createRoomUserName} onChange={(e)=>setCreateRoomUserName(e.target.value)}   error={createSubmitted && createRoomUserName === ""}
  helperText={
    createSubmitted && createRoomUserName === ""
      ? "Name is required"
      : ""
  } ></TextField>

<Button variant="contained" type="submit">Create Room</Button>

  </form>


<div id="OR"> OR </div>


  <form id="JoinRoom" onSubmit={(e)=>JoinRoom(e)}>

<div className="Card_Head">Join Room</div>

    <TextField placeholder="Enter Your Name"  value={joinRoomUserName} onChange={(e)=>setJoinRoomUserName(e.target.value)}   error={joinroomSubmitted && joinRoomUserName === ""}
  helperText={
    joinroomSubmitted && joinRoomUserName === ""
      ? "Name is required"
      : ""
  } ></TextField>
    
    <TextField placeholder="Enter Room ID"  value={joinId} onChange={(e)=>setjoinId(e.target.value)}    error={joinroomSubmitted && joinId === ""}
  helperText={
    joinroomSubmitted && joinId === ""
      ? "Room ID is required"
      : ""
  }  ></TextField>
    <Button variant="contained" type="submit"> Join Room</Button>
  </form>


</div>


<div id="Features">

<div id="Features_heading"> Features</div>


<div id="Features_Points">


<div>Real Time</div>
<div>|</div>
<div>Simple Rooms</div>
<div>|</div>
<div>Fast Transfer</div>

</div>


</div>


<div id="Guide">

  <div id="Guide_heading">How it is done</div>

  <div id="Guide_Points">
    <div class="Guide_Step">Create Room</div>
    <div class="Guide_Step">Send Code</div>
    <div class="Guide_Step">Share Files</div>
  </div>

</div>



</div>


)

}


export default HomePage

 