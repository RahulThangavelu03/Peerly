
import { Navigate } from "react-router-dom"

function ProctedRoute({inRoom,children}){


    


console.log(inRoom,"inroom")




    if(!inRoom){

 return <Navigate to = "/" replace />


    }



    return children
}

export default ProctedRoute