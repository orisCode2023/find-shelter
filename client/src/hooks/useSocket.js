import { useState, useEffect } from "react";
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:3000"

export const useSocket = () => {
    const [ socket, setSocket ] = useState(null)
    const [ alert, setAlert ] = useState(null)

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL)
        setSocket(newSocket)

        newSocket.on('red_alert', (data) => {
            console.log('new alert: ', data)
            setAlert(data)
        })
        
        return () => newSocket.close()
    },[])
    return {socket, alert, setAlert}
}