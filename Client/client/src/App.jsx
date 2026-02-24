import { useEffect,useState} from 'react'
import {io} from "socket.io-client"
import {BrowserRouter,Routes,Route} from "react-router-dom"
import HomePage from './Components/HomePage'
import RoomPage from './Components/RoomPage'
import ProctedRoute from './Components/ProctedRoute'




const socket = io("http://localhost:5000")



function App() {


  const[inRoom,setinRoom] = useState(false)
  
  const [roomId,setroomId] = useState("")

  const [isHost,setIsHost] = useState(false)

  const [ cansend,setCanSend] = useState(false)
  const [ username,setUserName] = useState("")

useEffect(() => {
  socket.on("room-role", ({ isHost, canSend }) => {
    setIsHost(isHost);
    setCanSend(canSend);
        setinRoom(true);   
  });
}, []);




  return (
    <>
<h2>Peerly</h2>

<BrowserRouter>
<Routes>

<Route path = "/" element={<HomePage socket={socket} setinRoom={setinRoom} setroomId={setroomId}   username={username} setUserName={setUserName} ></HomePage>}/>
<Route path= "/room/:roomId" element={<ProctedRoute inRoom={inRoom} ><RoomPage roomId={roomId} socket={socket} isHost={isHost} canSend={cansend} setCanSend={setCanSend} username={username}/></ProctedRoute>}/> 



</Routes>

</BrowserRouter>





    </>
  )
}

export default App
