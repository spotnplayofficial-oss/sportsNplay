import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import groundRoutes from './routes/groundRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { socketHandler } from './socket/socketHandler.js';
import passport from './config/passport.js';
import coachRoutes from './routes/coachRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import User from "./models/User.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const allUsers = await User.find();
console.log("All Users:", allUsers.length);
const corsOrigin = (origin, callback) => {
  if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173') {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(passport.initialize());

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

socketHandler(io);

app.get('/', (req, res) => {
  res.json({ message: 'PLAYNSPORTS API running 🚀' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is working 🚀' });
});

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  next(err);
});

app.use('/api/auth', authRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/grounds', groundRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT} 🟢`));