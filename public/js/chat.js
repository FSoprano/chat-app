const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value
    // e.target ... this is less error-prone than using document.querySelector
    // because the element IDs might change, or the target element is no longer 
    // the first (only) element of its type.

    socket.emit('sendMessage', message)
})