import Otp from '../models/Otp.js';
import generateOtp from '../utils/generateOtp.js';
import whatsappService from '../services/whatsappService.js';

/**
 * OTP Controller - Handles OTP generation, sending, and verification
 */
class OtpController {
    /**
     * Sends a 6-digit OTP to the given WhatsApp number
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    async sendOtp(req, res) {
        try {
            const { whatsapp } = req.body;

            // Validate WhatsApp number (basic validation)
            if (!whatsapp || !whatsapp.startsWith('+')) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid WhatsApp number format. Must start with "+" followed by country code and number.'
                });
            }

            // Generate a new 6-digit OTP
            const otp = generateOtp();

            // Set expiry (5 minutes from now)
            const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

            // Save the OTP in the database
            await Otp.create({
                whatsapp,
                otp,
                expiresAt
            });

            // Prepare the message - using a simplified format for better WhatsApp compliance
            const message = `Your verification code is: ${otp}`;

            // Log attempt to send message
            console.log(`Attempting to send OTP to ${whatsapp}`);

            try {
                // Send the OTP via WhatsApp
                const result = await whatsappService.sendWhatsappMessage(whatsapp, message);
                console.log('Twilio message sent successfully:', result.sid);

                return res.status(200).json({
                    status: 'success',
                    message: 'OTP sent to WhatsApp'
                });
            } catch (twilioError) {
                // Log detailed Twilio error
                console.error('Twilio Error Details:', JSON.stringify({
                    code: twilioError.code,
                    status: twilioError.status,
                    message: twilioError.message,
                    moreInfo: twilioError.moreInfo,
                    detail: twilioError.detail
                }, null, 2));

                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to send OTP via WhatsApp. Please make sure you have sent a message to our WhatsApp number first.',
                    twilioError: process.env.NODE_ENV === 'development' ? twilioError.message : null
                });
            }

        } catch (error) {
            console.error('Error in OTP generation process:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to generate and store OTP',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }

    /**
     * Verifies an OTP against the stored value for a WhatsApp number
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    async verifyOtp(req, res) {
        try {
            const { whatsapp, otp } = req.body;

            // Validate input
            if (!whatsapp || !otp) {
                return res.status(400).json({
                    status: 'error',
                    message: 'WhatsApp number and OTP are required'
                });
            }

            // Find the most recent non-expired OTP for this number
            const otpRecord = await Otp.findOne({
                whatsapp,
                expiresAt: { $gt: new Date() }, // Not expired yet
                verified: false // Not verified yet
            }).sort({ createdAt: -1 }); // Most recent first

            // If no valid OTP found
            if (!otpRecord) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No valid OTP found for this number or OTP has expired'
                });
            }

            // Check if OTP matches
            if (otpRecord.otp !== otp) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid OTP'
                });
            }

            // Mark the OTP as verified
            otpRecord.verified = true;
            await otpRecord.save();

            return res.status(200).json({
                status: 'success',
                message: 'OTP verified successfully'
            });

        } catch (error) {
            console.error('Error verifying OTP:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to verify OTP',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }
}

// Create and export a singleton instance
const otpController = new OtpController();
export default otpController; 