const socket = io()  // io() is a function that this script has access to because we called socket.io.js
// After calling this function and refreshing the app in the browser, we 
// should see the message "New WebSocket connection" in the terminal window we used 
// to run the app. This means that the client was able to connect to the server.

socket.on('countUpdated', (count) => {
    console.log('The count has been updated!', count)
    // count makes sense, but the name could be anything. It is not related 
    // to the count variable in index.js.
    // This message should be visible on the browser console.
    // If we see the message on the browser console, then this means that data 
    // could be transferred from the server to the client.
})
document.querySelector('#increment').addEventListener('click', () => {
    console.log('Button clicked!')
    // Transferring data from the client to the server:
    socket.emit('increment')
})