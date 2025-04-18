import twilio from 'twilio';

/**
 * WhatsApp Service - Handles sending WhatsApp messages via Twilio
 */
class WhatsappService {
    constructor() {
        // Check if Twilio credentials are available
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.error('Missing Twilio credentials. Please check your environment variables.');
        }

        try {
            this.client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            console.log('Twilio client initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize Twilio client:', error);
            // Still create the client to avoid breaking the app
            this.client = null;
        }
    }

    /**
     * Validates WhatsApp number format
     * @param {string} number - WhatsApp number to validate
     * @returns {boolean} - Whether the number is valid
     */
    validateNumber(number) {
        // Basic validation - could be enhanced with more robust checks
        return number && (number.startsWith('+') || number.startsWith('whatsapp:+'));
    }

    /**
     * Sends WhatsApp message to a given number using Twilio API
     * @param {string} to - Destination WhatsApp number (format: whatsapp:+1234567890)
     * @param {string} message - Message content to send
     * @returns {Promise} - Twilio message response
     */
    async sendWhatsappMessage(to, message) {
        // Validate inputs
        if (!this.client) {
            throw new Error('Twilio client not initialized. Check your credentials.');
        }

        if (!this.validateNumber(to)) {
            throw new Error('Invalid WhatsApp number format.');
        }

        if (!message || message.trim() === '') {
            throw new Error('Message content cannot be empty.');
        }

        try {
            // Format number if it doesn't have the WhatsApp: prefix
            const formattedNumber = to.startsWith('whatsapp:')
                ? to
                : `whatsapp:${to}`;

            // Log the attempt
            console.log(`Sending WhatsApp message to ${formattedNumber} using Twilio number: ${process.env.TWILIO_WHATSAPP_NUMBER}`);

            // Send the message via Twilio
            const result = await this.client.messages.create({
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: formattedNumber,
                body: message
            });

            console.log(`Message sent successfully. SID: ${result.sid}, Status: ${result.status}`);
            return result;
        } catch (error) {
            console.error('Error sending WhatsApp message:');
            console.error('- Error code:', error.code);
            console.error('- Error message:', error.message);

            // Provide more helpful error messages based on common Twilio errors
            if (error.code === 21608) {
                throw new Error('The recipient has not opted in to receive WhatsApp messages. They must send a message to your WhatsApp number first.');
            } else if (error.code === 21211) {
                throw new Error('Invalid WhatsApp number format or the number is not capable of receiving WhatsApp messages.');
            } else if (error.code === 20003) {
                throw new Error('Authentication error. Please check your Twilio credentials.');
            } else {
                throw error;
            }
        }
    }
}

// Create and export a singleton instance
const whatsappService = new WhatsappService();
export default whatsappService; 