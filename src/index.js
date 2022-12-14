const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
// object deconstruction:
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser , getUser, getUsersInRoom } = require('./utils/users')
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
   
    // Listening for the 'join' event:
    socket.on('join', ( {username, room}, callback ) => {
        // We use addUser() when somebody joins a chat:
        const { error, user } = addUser({ id: socket.id, username, room })
        // the unique ID of every client connection ( == unique id of ever user) lives on the socket object.
        // We can use it throughout this server connection.
        // { error, user } -> deconstruction again. The outcome of running addUser is either an error object 
        //or the user object.
        /* Also possible would be:
        socket.on('join', ( options, callback ) => {
        const { error, user } = addUser({ id: socket.id, ...options }) -> spread operator
        */
        if (error) {
            // If something goes wrong, send the error message to the client, and stop the function 
            // execution:
            return callback(error)
        }
        // joining the specified chat room:
        socket.join(user.room)
        // Letting the clients know they were able to join:
        // Relocated events, used to be outside the join event before; now we only want to 
        // emit these when a user has joined a chat room:
        socket.emit('message', generateMessage('Admin: ', 'Welcome!'))
        // broadcast emit sends the message to all participants (client sockets), except the one that the 
        // emitting socket connection is referring to.
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin: ',`${user.username} has joined!`))
        // slightly modified: using the to() function in between, we make sure that the 
        // message is only emitted to members of the chat room, except for the user who joined.
        // io.to.emit sends a message to just the participants of the chosen chat room, that is,
        // without sending it to people in other chat rooms.

        // Getting the list of users. This list is updated when a user joins, and when a user 
        // disconnects.
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
      
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    // disconnect is another built-in event, like connection. It does not have to be defined.
    // We want to send a message when a participant leaves the chat. We don't have to use broadcast
    // because the user has already disconnected when this function runs; io.emit will send the 
    // message to the remaining participants.
    socket.on('disconnect', () => {
        user = removeUser(socket.id)
            // It is thinkable that a user never joined a room, for example if invalid data   
            // was entered. In this case, it would be useless to emit a message saying 'user x has 
            // left' because nobody has seen this user join. However, if a user object exists, 
            // the user has joined a room.
            // Hence we move the io.emit call inside this conditional logic:

        if (user) {

            io.to(user.room).emit('message', generateMessage('Admin: ',`${user.username} has left!`))
            // Updating the list of users:
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            
        }
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    
})
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})