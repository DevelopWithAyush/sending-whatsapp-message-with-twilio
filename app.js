import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swaggerSpec.js';
import authRoutes from './routes/authRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    // Allow requests from all origins in development
    // In production, you might want to restrict this
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization,Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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

// Set up Swagger docs with custom options
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "WhatsApp OTP API Documentation"
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Expose Swagger JSON for the fallback UI
app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Fallback route for Swagger UI
app.get('/swagger', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'swagger.html'));
});

// API routes
app.use('/api/v1/auth', async (req, res, next) => {
    // Connect to MongoDB if not already connected
    if (!cachedConnection) {
        cachedConnection = await connectDB();
    }
    next();
}, authRoutes);

// Welcome route - serve the HTML interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add a dedicated route to check if the API is running
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running correctly',
        timestamp: new Date().toISOString()
    });
});

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
    console.log(`API Documentation available at:`);
    console.log(`- http://localhost:${PORT}/api-docs (Default Swagger UI)`);
    console.log(`- http://localhost:${PORT}/swagger (Alternative Swagger UI)`);
    console.log(`Web interface available at http://localhost:${PORT}`);
});

// For Vercel serverless deployment
export default app; 