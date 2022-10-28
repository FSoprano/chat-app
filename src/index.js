const express = require('express')
const path = require('path')
const http = require('http') // A node.JS core module 
const socketio = require('socket.io') // Socket.io is a library that provides 
// functions for real-time applications, like chat apps.
const app = express()
const server = http.createServer(app) // This is some sort of refactoring.
// Node would create a server anyway.
// We define the server outside of the Express library (defining it by ourselves).
// This makes it easier to use socket.io.
// Socket.io requires that the server is created by the raw http function. 
// Otherwise, socket.io would not have access to the server.
// In other words: We cannot just pass app to socketio; socketio would not 
// accept that.
const io = socketio(server)
// Client connection count to be sent to all clients:
let count= 0
// Print a message to the terminal when a client connects:
io.on('connection', (socket) => {
    // connection is the event we expect and () => is the function to run 
    // when the event occurs.
    console.log('New WebSocket connection')
    // Send a message from the server to each connecting client:
    socket.emit('countUpdated', count)
    // countUpdated is a custom event.
    socket.on('increment', () => {
        count++
        io.emit('countUpdated', count)
        // We'd like to see the updated count on the browser console of each connecting
        // client, and not just for the paricular connection of the updating client.
        // We therefore change the code from socket.emit to io.emit.
        // io.emit('updatedCount', count)
    })
})
const port = process.env.PORT || 3000

// console.log(__dirname)
// console.log(__filename) // values provided by Nodejs (path module) on the console.
// Path to the public directory by means of manipulation. path.join() is 
// a function of the path module.
// console.log(path.join(__dirname, '../public'))
// To use this path:
const pathToPublicDirectory = path.join(__dirname, '../public')
app.use(express.static(pathToPublicDirectory))


server.listen(port, () => {  // Refactoring: app.listen -> server.listen
    console.log('Server is up on port ' + port)
})