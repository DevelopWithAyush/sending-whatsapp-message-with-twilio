import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swaggerSpec.js';
import authRoutes from './routes/authRoutes.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with optimized settings for serverless environment
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options help with serverless deployments
            // by optimizing connection handling
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Only connect to MongoDB when handling a request
// This approach is better for serverless environments
let cachedConnection = null;

// Set up Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to WhatsApp OTP Verification API',
        documentation: '/api-docs',
        version: '1.0.0'
    });
});

// API routes
app.use('/api/v1/auth', async (req, res, next) => {
    // Connect to MongoDB if not already connected
    if (!cachedConnection) {
        cachedConnection = await connectDB();
    }
    next();
}, authRoutes);

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : null
    });
});

// Connect to MongoDB in local environment
// In production/Vercel, we'll connect on request
if (process.env.NODE_ENV !== 'production') {
    connectDB();
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// For Vercel serverless deployment
export default app; 