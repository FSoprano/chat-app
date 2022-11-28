const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    // socket.emit sends a message to a particular connection, for example, when a new user 
    // connects.
    socket.emit('message', 'Welcome!')
    // broadcast emit sends the message to all participants, except the one that the 
    // socket connection is referring to.
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message) => {
        // io.emits sends a message to all connections (all participants)
        io.emit('message', message)
    })
    // disconnect is another built-in event, like connection. It does not have to be defined.
    // We want to send a message when a participant leaves the chat. We don't have to use broadcast
    // because the user has already disconnected when this function runs; io.emit will send the 
    // message to the remaining participants.
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })

    socket.on('sendLocation', (coords) => {
        // io.emit('message',`My location is: ${coords.latitude}, ${coords.longitude}`)
        // In Google Maps:
        io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    })
    
})
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})