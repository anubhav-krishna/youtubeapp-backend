import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Test route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Server is running',
        success: true,
    });
});

// Corrected route path
app.use('/api/v1/user', userRouter);

export default app;
