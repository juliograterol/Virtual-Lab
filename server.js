const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4 } = require('uuid')
let data = ''
let admins = {}

const port = 3000
const hostname = 'localhost'

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get ('/lab', (req, res) => {
    res.redirect(`/lab/${v4()}`)
})

app.get('/lab/:room', (req, res) =>{
    res.render('index', {roomId: 1})
})

io.on('connection', socket=>{
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId)
        if (!admins[roomId]) {
            admins[roomId] = userId
            console.log(admins)
        }
        socket.broadcast.to(roomId).emit('user-connected', userId)
       
       
        socket.on('share-canvas', (dataURL)=> {
        if (admins[roomId] == userId) {
           // if(data != dataURL){
           //     data = dataURL
                socket.broadcast.to(roomId).emit('update-canvas', dataURL)
          //  }
        }
        })



    socket.on('disconnect', ()=>{ 
        socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
})
})


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`)
})