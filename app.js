require('dotenv').config(); // loading variables from .env
const mongoose = require('mongoose'); // MongoDB

// connecting to MongoDB (https://tinyurl.com/23lmtxm7)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

.then(() => console.log('MongoDB connected successfully')) // confirmation
.catch(err => console.error('MongoDB connection error:', err)); // Logs specific error message

