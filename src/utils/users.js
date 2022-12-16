// 4 functions to track users in chat rooms
const users = []
// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // the user id is connected to the socket; each socket connection has a unique id generated for it.
    // This id can be accessed.

    // !. step: Clean the data (convert to lowercase, trim), then validate that it has been provided.
    // Clean the data:
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    // Validate:
    if (!username || !room) {
        return {
            error: 'User name and room are required!'
        }
    }
    // Check for existing user, that is, make sure a user name exists only once per room. 
    // Otherwise, do not allow to choose that name.
    const existingUser = users.find( (user) => {
        return user.room === room && user.username === username
    })
    // validate username:
    if (existingUser) {
        return {
            error: 'This user name is in use!'
        }
    }
    // Store the user if it does not yet exist in the room:
    const user = { id, username, room }
    users.push(user)
    return { user }
}
// Remove a user from the users array:
const removeUser = (id) => {
    const index = users.findIndex(user => {
        // findIndex returns the position of an id in the users array.
        // The result is -1 if no match was found. Otherwise it's 0 or greater.
        // findIndex is faster than filter because it stops running after finding a match.
        return user.id === id
    })
    if (index !== 1) {
        return users.splice(index,1)[0]
        // splice revisited: The first arg is the index of the item to remove, the second is the number 
        // of items to remove from there; so 1 means just that item.
        // [0]: What we get back from splice is an array containing the deleted item. This item is an object.
        // To console log just the object, we access the object by its index, which is 0.
    }
  
}


// Testing the addUser function
addUser({
    id: 22,
    username: 'Francesco',
    room: 'Garage'
})

console.log(users)

const removedUser = removeUser(22)
console.log(removedUser)
console.log(users)

