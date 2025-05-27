import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth'; // Import authentication routes
import listingRoutes from './routes/listings'; // Import listing routes
import userRoutes from './routes/users'; // Import user routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodforward';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes); // Use authentication routes
app.use('/api/listings', listingRoutes); // Use listing routes
app.use('/api/users', userRoutes); // Use user routes

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
