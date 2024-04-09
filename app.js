// app.js
require('dotenv').config(); // loading variables from .env
console.log('MONGO_URI:', process.env.MONGO_URI);
const express = require('express'); 
const mongoose = require('mongoose'); 
const User = require('./userModel'); // importing User model file 

const app = express(); 
const PORT = process.env.PORT || 3000;

//JWT
const jwtSecret = 'winston123'; 
const jwtExpiration = '1d'; // expires after 24hrs

// connect to MongoDB (https://tinyurl.com/23lmtxm7)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully!')) // confirmation
.catch(err => console.error('MongoDB connection error:', err)); // Logs specific error message

// Mongoose Schema 
const MessageSchema = new mongoose.Schema({
    text: String,
    user: String, 
    timestamp: { type: Date, default: Date.now }
}); // Mongoose model named 'Message', corresponding to the 'Message Schema'

const Message = mongoose.model('Message', MessageSchema); 

// Middleware to parse JSON bodies
app.use(express.json()); 

// Protect Routes for JWT goes here


// POST route to create new message
app.post('/messages', async (req, res) => {
    try {
        const { text, user } = req.body; 
        const message = new Message({ text, user });  // Assign values to text and user fields
        await message.save(); 
        res.status(201).json(message); 
    } catch (error) {
        console.error('Error creating message:', error); 
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
});

// Get All Messages 
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find(); // fetch all from database
        res.json(messages); // Return messages as json response
    } catch (error) {
        console.error ('Error retreiving messages:', error); // error message to console
        res.status(500).json({ error: 'Internal Server Error'}) // error in retrieval process 
    }
})
// Get single message
app.get('/messages/:id', async (req, res) => {
    try {
        const  messageID = req.params.id; // Get message ID from URL parameters
        const message = await Message.findById(messageID); // Find message by ID 

        // if found, return as JSON response
        if (message) {
            res.json(message); 
        } else {
            // If the message not found, return 404 status w/ error 
            res.status(404).json({ error: 'Message not found' }); 
        }
    } catch (error) {
        // handling error during process
        console.error('Error retrieving message by ID', error); 
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
})

// User Registration Endpoint
app.post('/register', async (req, res) => {
    try {
        const {username, email, password } = req.body; 
        
        // checking if user w/ email provided exists already
        const existingUser = await User.findOne ({ email }); 
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' })
        }
        
        // Create new user 
        const newUser = new User ({ username, email, password }); 
        
        // save new user to DB
        await newUser.save();
                
        // Return success response message 
        res.status(201).json({ message: 'User has been registered successfully' })
    } catch (error) {
        console.error('Error registering new user:', error); 
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
}); 

// Update Existing Message
app.put('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id; // Get message ID from URL params
        const { text, user } = req.body; // Get updated message from request body
    
        // finding message by ID, updating contents
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId, 
            { text, user },
            { new: true } // returns updated document
        ); 
    
        // checking if msg was found / updated successfully 
        if (updatedMessage) {
            res.json(updatedMessage); // returns updated message as JSON response
        } else {
            res.status(404).json({ error: 'Message not found' }); // Message not found
        }
    } catch (error) {
        console.error('Error updating message:', error); 
        res.status(500).json({ error: 'Message not found' }); 
    }
});
// Delete message
app.delete('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id; // get message ID from URL params
    
        // find message by ID and delete
        const deletedMessage = await Message.findByIdAndDelete(messageId);
    
        // if found and deleted successfully
        if (deletedMessage) {
            res.json({ message: 'Message deleted successfully' });
        } else {
            // if the message isn't found
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        // if there's an error during deletion
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message }); // Return error message to client
    }
});

// User Login 

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}.`); // confirmation message
}); 