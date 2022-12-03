import {Server} from 'socket.io'
import {createServer} from 'node:http'

const socketConnections={
    player:{},
    controller:{}
}
let socketServer={}
const setSocketConnections=(nameSpace,action,data,socket)=>{
    if (nameSpace==='playerNsp'){
        if (action==='create'){
            socketConnections.player[data]={}
            socketServer.controllerNsp.emit('deviceList',socketConnections.player)
            // console.log(Object.keys(socketConnections.player),'create')
        }else if (action==='update'){
            socketConnections.player={...socketConnections.player,...data}
            socketServer.controllerNsp.emit('updateState',data)
            // console.log(Object.keys(socketConnections.player),'update')
        }else if(action==='remove'){
            // console.log(Object.keys(socketConnections.player),'beforeMove',data)
            Reflect.deleteProperty(socketConnections.player,data)
            socketServer.controllerNsp.emit('deviceList',socketConnections.player)
            // console.log(Object.keys(socketConnections.player),'remove')
        }
    }
}

export const createSocket = (app) => {
    const server = createServer(app)
    socketServer.main = new Server(server)
    addSocketEvent()
    return server
}
const addSocketEvent = () => {
    socketServer.playerNsp=socketServer.main.of('/socket-player')
    socketServer.controllerNsp=socketServer.main.of('/socket-controller')
    socketServer.playerNsp.on('connection', (socket) => {
        console.log(socket.id)
        setSocketConnections('playerNsp','create',socket.id)
        socket.on('playData',(data)=>{
            setSocketConnections('playerNsp','update', {[socket.id]:data})
        })
        socket.on('disconnect',()=>{
            setSocketConnections('playerNsp','remove',socket.id)
        })
    });

    socketServer.controllerNsp.on('connection',(socket)=>{
        console.log(socket.id,'controllerNsp')
        socket.emit('deviceList',socketConnections.player)
        socket.on('deviceList',()=>{
            socket.emit('deviceList',socketConnections.player)
        })
    })
}