import React from "react"
 import Button from '@mui/material/Button';
 import { useNavigate } from "react-router-dom";

function Lobby(){

const Navigate= useNavigate()


  return (
    <div id="Lobby">
      <div id="LobbyContent">
        <div id="Spinner"></div>

        <div id="LobbyText">
          Waiting for Host Approval
        </div>

        <div id="LobbySubText">
          Please wait while the host lets you in...
        </div>

        <Button variant="contained" onClick={() => Navigate("/")}>
          Leave Room
        </Button>
      </div>
    </div>
  );
}

export default Lobby