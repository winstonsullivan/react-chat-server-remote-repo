// app.js
require('dotenv').config(); // loading variables from .env
console.log('MONGO_URI:', process.env.MONGO_URI);
const express = require('express'); 
const mongoose = require('mongoose'); 

const app = express(); 
const PORT = process.env.PORT || 3000;

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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}.`); // confirmation message
}); 