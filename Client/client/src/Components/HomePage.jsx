import React from "react"
 import {io} from "socket.io-client"
 import Button from '@mui/material/Button';
 import TextField from '@mui/material/TextField';
import { useEffect,useState } from "react";

import { useNavigate } from "react-router-dom";
import Input from "@mui/material/Input";

function HomePage({socket,setinRoom,setroomId,username,setUserName}){


const Navigate = useNavigate()
const [joinId,setjoinId] = useState("")






const CreateRoom=()=>
  {

    
if (!username || username.trim().length < 1 ) {
  alert("please enter your name");
  return;
}

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



const JoinRoom = () => {

  if (!username || username.trim().length < 1) {
    alert("Please enter your name");
    return;
  }

  if (!joinId || joinId.length === 0) {
    alert("Enter a valid Room ID");
    return;
  }

  socket.emit("join-room", { roomId: joinId, username }, (response) => {

    if (!response?.success) {
      alert(response?.message || "Room not found");
      return;
    }

    setinRoom(true);
    Navigate(`/room/${joinId}`, { state: { role: "participant" } });

  });
};



    return(

        <div>

<div id="IntroSection">


<div>
   Real-Time File Transfer 

</div>
<div>
  
  Create a room, share the code, and transfer files      |
|                instantly between devices.
</div>
<div>
  
  <TextField  label = "Please Enter Your Name" variant="outlined" value={username} onChange={(e)=>setUserName(e.target.value)}></TextField>
</div>

<div id="IntroSection-ButtonSection">
<Button onClick={CreateRoom}>Create Room</Button>

</div>

<div>OR</div>


<TextField  label="Please Enter Your Name" value={joinId}  variant="outlined" onChange={(e)=>setjoinId(e.target.value)}></TextField>

<Button onClick={JoinRoom}>Join Room</Button>





<div id="Features">

<div id="Features_heading">Features</div>

<div id="Features_Points">

<div className="Feature_Card">

<div>Real Time</div>
<div>Transfer files instantly</div>


</div>
<div className="Feature_Card">
  
<div>Simple Room</div>
<div>Share rooms with a simple code</div>


</div>

<div className="Feature_Card">

<div>Fast Transfer</div>
<div>Stream files instantly</div>

</div>

</div>

</div>

<div id="Instructions">

<div> How it Works </div>

<div id="Instructions_Points">

<div>1. Create Room</div>

<div>2. Send Room Id</div>

<div>3. Share Files</div>


</div>
  


</div>






</div>




</div>











    )

}


export default HomePage

