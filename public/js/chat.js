const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
// $ in front of the variable name is just a convention. It signifies 
// that we're referring to a DOM element.
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates:
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
// innerHTML: we want the div inside the template

// server (emit) => client (receive) --acknowledgement --> server
// client (emit) => server (receive) --acknowledgement --> client

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message
        // shorthand for 'message: message'
        // What we pass in here as the value of the message key is the message that this function 
        // works on, allowing us to render different (dynamic) content to the HTML user interface.
    })
    // Inserting the template content in the messages div:
    $messages.insertAdjacentHTML('beforeend', html)
    // 'beforeend' one of the possible options, which means before the closing </div> tag.

})
socket.on('locationMessage', (url) => {
    console.log(url)
    const link = Mustache.render(locationTemplate, {
        url
        // shorthand for 'url: url'
    })
    // Inserting the template content in the messages div:
    $messages.insertAdjacentHTML('beforeend', link)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // when we use the submit event, we have access to the 'e' (event) object.

    // Disabling the form once it's been submitted:
    $messageFormButton.setAttribute('disabled', 'disabled')
    // DOM manipulation. There is a 'disabled' attribute on a button, and one of its possible values is 
    // also 'disabled'.
    
    const message = e.target.elements.message.value
    // e.target ... this is less error-prone than using document.querySelector
    // because the element IDs might change, or the target element is no longer 
    // the first (only) element of its type.
    
    // Clearing the messsage text input field:
    $messageFormInput.value = ''
    //Putting the cursor focus back on the message input field:
    $messageFormInput.focus()
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