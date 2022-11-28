const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()
    // when we use the submit event, we have access to the 'e' (event) object.
    const message = e.target.elements.message.value
    // e.target ... this is less error-prone than using document.querySelector
    // because the element IDs might change, or the target element is no longer 
    // the first (only) element of its type.

    socket.emit('sendMessage', message)
})
// Button that discloses one's location to the other participants
document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation!')
    }
    // getCurrentPosition is asynchronous, but does not support the async/await syntax.
    // That's why we use a callback function.
    navigator.geolocation.getCurrentPosition((position) => {
        // position is an object returned by the function.
        const pos = { latitude: position.coords.latitude, longitude: position.coords.longitude }
        socket.emit('sendLocation', pos)
    })
})