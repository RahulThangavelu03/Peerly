import React from "react"
 import {io} from "socket.io-client"
 import Button from '@mui/material/Button';
 import TextField from '@mui/material/TextField';
import { useEffect,useState } from "react";

import { useNavigate } from "react-router-dom";

function HomePage({socket,setinRoom,setroomId,username,setUserName}){


const Navigate = useNavigate()
const [joinId,setjoinId] = useState("")





const CreateRoom=()=>{

    
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
setroomId(roomId)


// socket.emit("create-room", roomId,username)


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
HomePage<br/><br/>




      <TextField id="outlined-basic" label="Enter your Name"  value={username} variant="outlined" onChange={(e)=>setUserName(e.target.value)} /><br/><br/>


            <Button variant="contained" onClick={CreateRoom}>Create Room</Button><br/><br/>
            <div>OR</div>

            <p>Join Room</p>

      <TextField id="outlined-basic" label="Enter Id to Join " variant="outlined" onChange={(e)=>setjoinId(e.target.value)} /><br/><br/>

 <Button variant="contained" onClick={JoinRoom}>Join Room</Button>






        </div>



    )

}


export default HomePage