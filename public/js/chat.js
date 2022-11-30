const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
// $ in front of the variable name is just a convention. It signifies 
// that we're referring to a DOM element.
const $sendLocationButton = document.querySelector('#send-location')

// server (emit) => client (receive) --acknowledgement --> server
// client (emit) => server (receive) --acknowledgement --> client

socket.on('message', (message) => {
    console.log(message)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // when we use the submit event, we have access to the 'e' (event) object.

    // Disabling the form once it's been submitted:
    $messageFormButton.setAttribute('disabled', 'disabled')
    // DOM manipulation. There is a 'disabled' attribute on a button, and one of its possible values is 
    // also 'disabled'.
    // Clearing the messsage text input field:
    $messageFormInput.value = ''
    //Putting the cursor focus back on the message input field:
    $messageFormInput.focus()
    const message = e.target.elements.message.value
    // e.target ... this is less error-prone than using document.querySelector
    // because the element IDs might change, or the target element is no longer 
    // the first (only) element of its type.

    socket.emit('sendMessage', message, (error) => {
        // Re-enabling the messsage button:
        $messageFormButton.removeAttribute('disabled')

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered.')
    })
})
// Button that discloses one's location to the other participants
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation!')
    }
   
    // Disabling the button just before we send the location:
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        // getCurrentPosition is asynchronous, but does not support the async/await syntax.
        // That's why we use a callback function.
        // position is an object returned by the function.
        const pos = { latitude: position.coords.latitude, longitude: position.coords.longitude }
        socket.emit('sendLocation', pos, () => {
            // Re-enabling the Send Location button:
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared.')
        })
    })
})