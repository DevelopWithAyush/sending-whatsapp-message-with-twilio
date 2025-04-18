import mongoose from 'mongoose';

/**
 * OTP Schema - stores OTP information for verification
 */
const otpSchema = new mongoose.Schema({
    // WhatsApp number with country code
    whatsapp: {
        type: String,
        required: [true, 'WhatsApp number is required'],
        trim: true
    },
    // 6-digit OTP code
    otp: {
        type: String,
        required: [true, 'OTP is required']
    },
    // When this OTP expires
    expiresAt: {
        type: Date,
        required: true
    },
    // Whether this OTP has been verified
    verified: {
        type: Boolean,
        default: false
    },
    // When this OTP was created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create an index on whatsapp to speed up lookups
otpSchema.index({ whatsapp: 1 });

// Create a compound index on whatsapp and expiresAt for efficient querying
otpSchema.index({ whatsapp: 1, expiresAt: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp; 