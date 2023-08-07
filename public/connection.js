const socket = io()
const peers = {}
const myPeer = new Peer()

const myAudio = document.createElement('audio')
myAudio.muted = true
//Obtener audio del navegador
navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
addAudioStream(myAudio, stream)

/* Al conectarnos recibimos una llamada  
por parte de los usuarios conectados
*/
myPeer.on('call', call => {
    const userId = call.peer;
    //enviamos nuestra grabacion
    call.answer(stream)
    const audio = document.createElement('audio')
    /* recibimos el audio de los usuarios conectados
    y lo agregamos al body del dom */
    call.on('stream', userAudioStream =>{
        addAudioStream(audio, userAudioStream)
    }) 
    //cuando se cierre la conexion se elimina el audio
    call.on('close', ()=>{
        audio.remove()
    })
    peers[userId] = call
})

/* 
Evento para iniciar una conexion con los usuarios que se conecten
*/
socket.on('user-connected', userId => {
    console.log("User connected: " + userId)
    connectToNewUser(userId, stream)
})
})

/* 
Evento para cerrar la conexion con los usuario
que se desconecten 
*/
socket.on('user-disconnected', userId => {
if (peers[userId]) {
    peers[userId].close()
    delete peers[userId]
} 
})

/*
Cuando el usuario se conecta le envia 
al servidor el id de su sala y el id de su usuario.
*/
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

/* 
Funcion que empieza una llamada cada vez 
que se conecta un usario al room
*/
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const audio = document.createElement('audio')
    call.on('stream', userAudioStream =>{
        addAudioStream(audio, userAudioStream)
    })
    call.on('close', () =>{
        audio.remove()
    })

    peers[userId] = call
}

/* Funcion para asignar una
 grabacion a un elemento HTLM audio 
 y agregarlo al DOM */
function addAudioStream(audio, stream) {
    audio.srcObject = stream
    audio.addEventListener('loadedmetadata', ()=>{
        audio.play()
    })
    document.body.append(audio)
}