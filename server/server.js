const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Routes Placeholder
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/appointment', require('./routes/appointment'));
app.use('/api/prescription', require('./routes/prescription'));
app.use('/api/ai', require('./routes/ai'));

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const Message = require('./models/Message');
      const newMessage = new Message({
        appointmentId: data.roomId,
        senderId: data.senderId,
        text: data.text
      });
      await newMessage.save();
      io.to(data.roomId).emit('receive-message', { ...data, createdAt: newMessage.createdAt });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // WebRTC Signaling
  socket.on('signal', (data) => {
    socket.to(data.roomId).emit('signal', {
      signal: data.signal,
      from: data.from
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Message History Route
app.get('/api/appointment/:id/messages', async (req, res) => {
  try {
    const Message = require('./models/Message');
    const messages = await Message.find({ appointmentId: req.params.id }).populate('senderId', 'name');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telemedicine';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
