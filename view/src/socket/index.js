import { io } from 'socket.io-client'

let playSocketIns
let controllerSocketIns
const createSocket=()=>{
    const playIns = io('/socket-player',{
        autoConnect:false
    }).on('connect',()=>{
        playSocketIns=playIns
    }).on('disconnect',()=>{
        playSocketIns=undefined
    }).connect()
    const controllerIns = io('/socket-controller',{
        autoConnect:false
    }).on('connect',()=>{
        controllerSocketIns=controllerIns
    }).on('disconnect',()=>{
        controllerSocketIns=undefined
    }).connect()
}
const sendPlaySocketData=(key,data)=>{
    if (playSocketIns){
        playSocketIns.emit(key,data)
    }
}
const sendControllerSocketData=(key,data)=>{
    if (playSocketIns){
        playSocketIns.emit(key,data)
    }
}
export default async (vue)=>{
    createSocket()
}
export const getControllerSocketIns=()=>controllerSocketIns
export const getPlaySocketIns=()=>playSocketIns
export const sendPlayData=(data)=>{
    sendPlaySocketData('playData',data)
}
export const sendOrder=(data)=>{
    sendPlaySocketData('controllerOrder',data)
}