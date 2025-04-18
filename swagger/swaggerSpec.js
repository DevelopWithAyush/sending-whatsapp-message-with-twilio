import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger configuration options
 */
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'WhatsApp OTP Verification API',
            version: '1.0.0',
            description: 'API for WhatsApp OTP verification using Twilio',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
        },
        servers: [
            {
                url: '/',
                description: 'Current environment',
            },
        ],
    },
    // Path to the API docs
    apis: [
        './routes/*.js',
        './models/*.js',
    ],
};

// Generate the Swagger specification
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 