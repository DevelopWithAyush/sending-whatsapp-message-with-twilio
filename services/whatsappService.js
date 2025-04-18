import twilio from 'twilio';

/**
 * WhatsApp Service - Handles sending WhatsApp messages via Twilio
 */
class WhatsappService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    /**
     * Sends WhatsApp message to a given number using Twilio API
     * @param {string} to - Destination WhatsApp number (format: whatsapp:+1234567890)
     * @param {string} message - Message content to send
     * @returns {Promise} - Twilio message response
     */
    async sendWhatsappMessage(to, message) {
        try {
            // Format number if it doesn't have the WhatsApp: prefix
            const formattedNumber = to.startsWith('whatsapp:')
                ? to
                : `whatsapp:${to}`;

            // Send the message via Twilio
            const result = await this.client.messages.create({
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: formattedNumber,
                body: message
            });

            return result;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const whatsappService = new WhatsappService();
export default whatsappService; 