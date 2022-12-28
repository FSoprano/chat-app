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

// Options:
// These option use the Query String (qs) library, which is loaded in chat.html (3rd script tag).
// We have access to location.search, which is an object that returns the query string on the 
// client console when entered. This means we can use it here to return an object with 
// 2 key/value pairs, 'username' and 'room'.
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
// ignoreQueryPrefix removes the '?' at the beginning of the query string.

const autoscroll = () => {
    // Grabbing the new message element:
    const $newMessage = $messages.lastElementChild
    // Height of the new message:
    const newMessageStyles = getComputedStyle($newMessage)
    // getComputedStyle() is made avaiable through the browser.
    // We want the height of the margin bottom as a number so we can add it to 
    // offsetHeight. parseInt takes in a string and returns a number.
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Great start, but this does not take the margin into account.
    // Outputting the styles on the console:
    console.log(newMessageStyles)
    // Outputting the margin bottom as a number.
    console.log(newMessageMargin)
    // The visible height:
    const visibleHeight = $messages.offsetHeight
    // The container height (content height, much larger than visible height, as it includes 
    // parts one does not see.)
    const containerHeight = $messages.scrollHeight
    // To decide whether to autoscroll, we need the current scrolling position of the reader(client).
    // We need to know how far we are from the bottom:
    const scrollOffset = $messages.scrollTop + visibleHeight
    // A property scrollBottom does not exist, so we'll use a calculation. The position in relation
    // to the bottom is 
    // the distance from the top to the top of the scollbar. The top of the scrollbar equals the 
    // visibleHeight.
    if (containerHeight - newMessageHeight <= scrollOffset) {
        // condition: We want to know if the user is close to or at the bottom, 
        // so we first need to now container height before the new message comes in.
        // If this condition is true, we want to autoscroll:
        $messages.scrollTop = $messages.scrollHeight
        // Hint: Not only can we extract the scrollTop; we can also set it.

    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
       // message
       // Since the introduction of the generateMessage function in utils/messages.js,
       // the message parameter has become an object. This means, in order to render the 
       // message properly on the client side, we cannot use the shorthand anymorem, since 
       // we need to access just one property of the object (text). Hence we have to write 
       // it like this:
       username: message.username,
       message: message.text,
       createdAt: moment(message.createdAt).format('h:mm a')
       // moment() is for time formatting. We have access to this function because we loaded
       // the script library in in index.html (2nd script tag)
       // docs on momentjs.com
    })
    // Inserting the template content in the messages div:
    $messages.insertAdjacentHTML('beforeend', html)
    // 'beforeend' one of the possible options, which means before the closing </div> tag.
    autoscroll()

})
socket.on('locationMessage', (location) => {
    console.log(location)
    const link = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    // Inserting the template content in the messages div:
    $messages.insertAdjacentHTML('beforeend', link)
    autoscroll()
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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
// sending the chosen username and chatroom to the server (new event 'join' that the server 
// will listen for):
socket.emit( 'join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/' // Refer back to the root of the site, that is, the join page.
    }
})